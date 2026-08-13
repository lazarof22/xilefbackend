import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Licencia, LicenciaDocument } from './schemas/licencia.schema';
import { LicenciaCryptoService } from './services/licencia-crypto.service';
import { LicenciaGeneratorService } from './services/licencia-generator.service';
import { LicenciaAuditService } from './services/licencia-audit.service';
import { LicenciaOfflineService } from './services/licencia-offline.service';
import { LicenciaValidator } from './types/licencia-validator.interface';
import { ActivarLicenciaDto } from './dto/activar-licencia.dto';
import {
  LicenciaActivadaResponse,
  EstadoLicenciaResponse,
  EstadoPublicoResponse,
} from './types/licencia.types';
import type { AuditoriaLicenciaDocument } from './schemas/auditoria-licencia.schema';

type RechazoMotivo =
  | 'formato'
  | 'nonce-replay'
  | 'no-existe'
  | 'revocada'
  | 'expirada'
  | 'integridad'
  | 'hardware-mismatch'
  | 'empresa-mismatch';

@Injectable()
export class LicenciaService {
  private readonly logger = new Logger(LicenciaService.name);

  constructor(
    @InjectModel(Licencia.name)
    private readonly licenciaModel: Model<LicenciaDocument>,
    private readonly cryptoService: LicenciaCryptoService,
    private readonly generatorService: LicenciaGeneratorService,
    private readonly validatorService: LicenciaValidator,
    private readonly auditService: LicenciaAuditService,
    private readonly offlineService: LicenciaOfflineService,
  ) {}

  /**
   * Activa una licencia a partir del artefacto firmado por XILEF.
   *
   * El cliente es verify-only: verifica la firma Ed25519 sobre el payload
   * canónico v2 reconstruido desde los campos firmados recibidos en el DTO y
   * persiste la firma VERBATIM (sin re-firmar). Primera activación crea el
   * registro; re-activación/renovación lo actualiza (upsert por clave_hash).
   */
  async activarLicencia(
    dto: ActivarLicenciaDto,
    ipOrig?: string,
    userAgent?: string,
  ): Promise<LicenciaActivadaResponse> {
    const auditRechazo = async (
      motivo: RechazoMotivo,
      error: string,
      licId?: Types.ObjectId,
      empresaId?: string,
    ) => {
      await this.auditService.logAccion({
        licencia_id: licId,
        accion: 'rechazo',
        empresa_id: empresaId,
        exitoso: false,
        error,
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { motivo } as Record<string, unknown>,
      });
    };

    if (!dto.hardware_id) {
      await auditRechazo('formato', 'hardware_id es obligatorio');
      throw new BadRequestException('Licencia inválida');
    }

    if (!this.validatorService.validateKeyFormat(dto.clave_activacion)) {
      await auditRechazo('formato', 'Formato de clave inválido');
      throw new BadRequestException('Licencia inválida');
    }

    const nonceOk = await this.validatorService.validateNonce(
      dto.nonce,
      dto.empresa_id,
    );
    if (!nonceOk) {
      await auditRechazo('nonce-replay', 'Nonce inválido o ya utilizado');
      throw new BadRequestException('Licencia inválida');
    }

    // Verificar la firma Ed25519 de XILEF sobre el payload canónico v2
    // reconstruido desde los campos firmados del artefacto recibido.
    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaVencimiento = new Date(dto.fecha_vencimiento);
    const maxUsuarios = dto.max_usuarios ?? 0;
    const firmaPayload = this.cryptoService.buildEd25519Payload({
      empresa_id: dto.empresa_id,
      tipo: dto.tipo,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
      max_usuarios: maxUsuarios,
      activa: true,
      revocada: false,
    });
    if (!this.cryptoService.verifyEd25519(firmaPayload, dto.firma_ed25519)) {
      await auditRechazo(
        'integridad',
        'Firma Ed25519 inválida',
        undefined,
        dto.empresa_id,
      );
      throw new BadRequestException('Licencia inválida');
    }

    if (this.validatorService.isExpired(fechaVencimiento)) {
      await auditRechazo(
        'expirada',
        'Licencia expirada',
        undefined,
        dto.empresa_id,
      );
      throw new BadRequestException('Licencia inválida');
    }

    const claveHash = this.cryptoService.generateSHA256Hash(
      dto.clave_activacion,
    );
    const existing = await this.licenciaModel.findOne({
      clave_hash: claveHash,
    });

    let licencia: LicenciaDocument;
    if (existing) {
      if (existing.revocada) {
        await auditRechazo(
          'revocada',
          'Licencia revocada',
          existing._id,
          existing.empresa_id,
        );
        throw new BadRequestException('Licencia inválida');
      }

      // P1-2: no rebinding empresa_id.
      if (dto.empresa_id !== existing.empresa_id) {
        await auditRechazo(
          'empresa-mismatch',
          'Re-vinculación no permitida',
          existing._id,
          dto.empresa_id,
        );
        throw new ForbiddenException('Licencia inválida');
      }

      // P0-3: hardware_id enforcement.
      let hardwareHash: string;
      if (existing.hardware_id) {
        if (
          !this.validatorService.validateHardwareId(
            existing.hardware_id,
            dto.hardware_id,
          )
        ) {
          await auditRechazo(
            'hardware-mismatch',
            'Hardware no coincide con la activación registrada',
            existing._id,
            existing.empresa_id,
          );
          throw new ForbiddenException('Licencia inválida');
        }
        hardwareHash = existing.hardware_id;
      } else {
        hardwareHash = this.cryptoService.generateSHA256Hash(dto.hardware_id);
      }

      // Aplicar campos firmados del artefacto (renovación posible) y persistir
      // la firma de XILEF verbatim (sin re-firmar).
      existing.tipo = dto.tipo;
      existing.fecha_inicio = fechaInicio;
      existing.fecha_vencimiento = fechaVencimiento;
      existing.max_usuarios = maxUsuarios;
      existing.empresa_nombre = dto.empresa_nombre ?? existing.empresa_nombre;
      existing.hardware_id = hardwareHash;
      existing.activa = true;
      existing.firma_ed25519 = dto.firma_ed25519;
      existing.version_firma = 2;
      existing.dias_restantes =
        this.generatorService.calculateRemainingDays(fechaVencimiento);
      const now = Date.now();
      const efectivaPrev = existing.ultima_verificacion_efectiva?.getTime();
      existing.ultima_verificacion = new Date(now);
      existing.ultima_verificacion_efectiva = new Date(
        efectivaPrev && efectivaPrev > now ? efectivaPrev : now,
      );
      existing.ultima_verificacion_monotonic_ms = this.monotonicMs();

      await existing.save();
      licencia = existing;
    } else {
      // Primera activación: crear el registro desde el artefacto firmado.
      const hardwareHash = this.cryptoService.generateSHA256Hash(
        dto.hardware_id,
      );
      licencia = await this.licenciaModel.create({
        clave_hash: claveHash,
        // AES cleanup diferido: campo vestigial (nunca se descifra); se
        // persiste la clave en claro como identificador único temporal.
        clave_activacion_encriptada: dto.clave_activacion,
        empresa_nombre: dto.empresa_nombre ?? '',
        empresa_id: dto.empresa_id,
        tipo: dto.tipo,
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVencimiento,
        activa: true,
        dias_restantes:
          this.generatorService.calculateRemainingDays(fechaVencimiento),
        max_usuarios: maxUsuarios,
        hardware_id: hardwareHash,
        firma_ed25519: dto.firma_ed25519,
        version_firma: 2,
        requiere_re_firma: false,
        metadata: dto.metadata ?? {},
      });
    }

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'activacion',
      empresa_id: licencia.empresa_id,
      exitoso: true,
      ip_origen: ipOrig,
      user_agent: userAgent,
      detalles: { hardware_bound: !!dto.hardware_id },
    });

    await this.offlineService.syncFromDb(licencia);

    return {
      mensaje: 'Licencia activada exitosamente',
      valida: true,
      vigente: true,
      dias_restantes: licencia.dias_restantes,
      tipo: licencia.tipo,
      empresa: licencia.empresa_nombre,
      fecha_vencimiento: licencia.fecha_vencimiento,
    };
  }

  async verificarEstado(
    empresaId: string,
    ipOrig?: string,
    userAgent?: string,
  ): Promise<EstadoLicenciaResponse> {
    try {
      return await this.verificarEstadoDesdeDb(empresaId, ipOrig, userAgent);
    } catch (error) {
      this.logger.warn(
        `Fallo de base de datos en verificarEstado, usando .lic offline: ${(error as Error).message}`,
      );
      const result = await this.offlineService.isOfflineLicenseValidWithGrace();
      if (!result || !result.valida) {
        return {
          valida: false,
          vigente: false,
          dias_restantes: 0,
          tipo: null,
          empresa: null,
          fecha_vencimiento: null,
          max_usuarios: 0,
        };
      }
      return {
        valida: true,
        vigente: true,
        dias_restantes: result.diasRestantes,
        tipo: result.data!.tipo,
        empresa: result.data!.empresa_nombre,
        fecha_vencimiento: new Date(result.data!.fecha_vencimiento),
        max_usuarios: result.data!.max_usuarios,
      };
    }
  }

  private async verificarEstadoDesdeDb(
    empresaId: string,
    ipOrig?: string,
    userAgent?: string,
  ): Promise<EstadoLicenciaResponse> {
    const licencia = await this.licenciaModel.findOne({
      empresa_id: empresaId,
      activa: true,
      revocada: false,
    });

    if (!licencia) {
      return {
        valida: false,
        vigente: false,
        dias_restantes: 0,
        tipo: null,
        empresa: null,
        fecha_vencimiento: null,
        max_usuarios: 0,
      };
    }

    if (!this.validatorService.validateIntegrity(licencia)) {
      await this.auditService.logAccion({
        licencia_id: licencia._id,
        accion: 'rechazo',
        empresa_id: empresaId,
        exitoso: false,
        error: 'Integridad de licencia comprometida en verificación',
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { motivo: 'integridad' },
      });
      licencia.activa = false;
      try {
        await licencia.save();
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'VersionError') {
          this.logger.warn(
            'Conflicto de versión en verificarEstado (integridad), se ignora actualización',
          );
        } else {
          throw err;
        }
      }
      return {
        valida: false,
        vigente: false,
        dias_restantes: 0,
        tipo: null,
        empresa: null,
        fecha_vencimiento: null,
        max_usuarios: 0,
      };
    }

    // Anti clock-skew: max(Date.now(), ultima_verificacion_efectiva).
    const nowReal = Date.now();
    const efectivaPrev = licencia.ultima_verificacion_efectiva?.getTime();
    const skew = efectivaPrev !== undefined && efectivaPrev > nowReal;
    if (skew) {
      licencia.skew_detectado = true;
      await this.auditService.logAccion({
        licencia_id: licencia._id,
        accion: 'skew',
        empresa_id: empresaId,
        exitoso: true,
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { skew_ms: efectivaPrev - nowReal },
      });
    }

    const vigente = !this.validatorService.isExpired(
      licencia.fecha_vencimiento,
      licencia.ultima_verificacion_efectiva,
    );
    const diasRestantes = this.generatorService.calculateRemainingDays(
      licencia.fecha_vencimiento,
    );

    const efectivaNew =
      efectivaPrev && efectivaPrev > nowReal ? efectivaPrev : nowReal;
    licencia.ultima_verificacion = new Date(nowReal);
    licencia.ultima_verificacion_efectiva = new Date(efectivaNew);
    licencia.ultima_verificacion_monotonic_ms = this.monotonicMs();
    if (licencia.dias_restantes !== diasRestantes) {
      licencia.dias_restantes = diasRestantes;
    }

    try {
      await licencia.save();
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'VersionError') {
        this.logger.warn(
          'Conflicto de versión en verificarEstado, se ignora actualización',
        );
      } else {
        throw err;
      }
    }

    return {
      valida: true,
      vigente,
      dias_restantes: diasRestantes,
      tipo: licencia.tipo,
      empresa: licencia.empresa_nombre,
      fecha_vencimiento: licencia.fecha_vencimiento,
      max_usuarios: licencia.max_usuarios,
    };
  }

  async findAll(): Promise<LicenciaDocument[]> {
    const licencias = await this.licenciaModel
      .find()
      .select('-clave_activacion_encriptada -firma_ed25519')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return licencias as LicenciaDocument[];
  }

  async findOne(empresaId: string): Promise<LicenciaDocument | null> {
    const licencia = await this.licenciaModel
      .findOne({ empresa_id: empresaId })
      .select('-clave_activacion_encriptada -firma_ed25519')
      .lean()
      .exec();
    return licencia as LicenciaDocument | null;
  }

  async desactivarLicenciasVencidas(): Promise<number> {
    const result = await this.licenciaModel.updateMany(
      {
        activa: true,
        fecha_vencimiento: { $lt: new Date() },
        tipo: { $ne: 'perpetua' },
      },
      {
        $set: { activa: false, dias_restantes: 0 },
      },
    );
    return result.modifiedCount;
  }

  async getAuditoria(params?: {
    limit?: number;
    offset?: number;
    empresa_id?: string;
    accion?: string;
  }): Promise<AuditoriaLicenciaDocument[]> {
    return this.auditService.getTodasAuditorias(params ?? {});
  }

  /**
   * fixedTimeResponse envuelve una operación y garantiza que siempre tarde al
   * menos `minMs` ms, incluso cuando lanza. El delay se ejecuta en el bloque
   * `finally`, así que el path de error también respeta el tiempo mínimo.
   */
  private async fixedTimeResponse<T>(
    fn: () => Promise<T>,
    minMs = 150,
  ): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < minMs) {
        await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
      }
    }
  }

  /**
   * estadoPublico: endpoint público (sin auth). Responde SOLO `{ valida, vigente }`.
   * Anti timing-attack: envuelve TODO con fixedTimeResponse (150ms mínimo).
   *
   * `valida = licencia.activa && !licencia.revocada && firmaValida && vigente`.
   */
  async estadoPublico(clave: string): Promise<EstadoPublicoResponse> {
    return this.fixedTimeResponse(async () => {
      if (!clave) {
        return { valida: false, vigente: false };
      }
      const claveHash = this.cryptoService.generateSHA256Hash(clave);
      const licencia = await this.licenciaModel
        .findOne({ clave_hash: claveHash })
        .select(
          '+firma_ed25519 +activa +revocada +fecha_vencimiento +hardware_id +max_usuarios +ultima_verificacion_efectiva +version_firma +tipo +fecha_inicio +empresa_id',
        )
        .lean();

      if (!licencia) {
        return { valida: false, vigente: false };
      }

      const firmaValida = this.validatorService.validateIntegrity(licencia);
      if (!firmaValida) {
        return { valida: false, vigente: false };
      }

      const vigente = !this.validatorService.isExpired(
        licencia.fecha_vencimiento,
        (licencia as { ultima_verificacion_efectiva?: Date })
          .ultima_verificacion_efectiva,
      );
      const valida =
        licencia.activa && !licencia.revocada && firmaValida && vigente;
      return { valida, vigente };
    });
  }

  private monotonicMs(): number {
    return Number(process.hrtime.bigint()) / 1_000_000;
  }
}
