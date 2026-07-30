import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Licencia, LicenciaDocument } from './schemas/licencia.schema';
import { LicenciaCryptoService } from './services/licencia-crypto.service';
import { LicenciaGeneratorService } from './services/licencia-generator.service';
import { LicenciaAuditService } from './services/licencia-audit.service';
import { LicenciaValidator } from './types/licencia-validator.interface';
import { ActivarLicenciaDto } from './dto/activar-licencia.dto';
import { GenerarLicenciaDto } from './dto/generar-licencia.dto';
import { RenovarLicenciaDto } from './dto/renovar-licencia.dto';
import { FIRMA_VERSION_ACTUAL } from './constants/licencia.constants';
import {
  LicenciaGeneradaResponse,
  LicenciaActivadaResponse,
  EstadoLicenciaResponse,
  LicenciaRenovadaResponse,
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
  ) {}

  async generateLicencia(
    dto: GenerarLicenciaDto,
  ): Promise<LicenciaGeneradaResponse> {
    const existing = await this.licenciaModel.findOne({
      empresa_id: dto.empresa_id,
    });
    if (existing) {
      throw new ConflictException('Ya existe una licencia para esta empresa');
    }

    const fechaInicio = dto.fecha_inicio
      ? new Date(dto.fecha_inicio)
      : (() => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          return d;
        })();
    const fechaVencimiento = dto.fecha_vencimiento
      ? new Date(dto.fecha_vencimiento)
      : this.generatorService.calculateExpiryDate(dto.tipo, dto.duracion_dias);

    if (fechaVencimiento <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser posterior a la fecha de inicio',
      );
    }

    if (dto.tipo !== 'perpetua') {
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      if (fechaVencimiento <= ahora) {
        throw new BadRequestException(
          'La fecha de vencimiento no puede ser anterior a hoy',
        );
      }
      const maxFecha = new Date();
      maxFecha.setDate(maxFecha.getDate() + 30);
      maxFecha.setHours(23, 59, 59, 999);
      if (fechaVencimiento > maxFecha) {
        throw new BadRequestException(
          `La fecha de vencimiento no puede exceder 30 días a partir de hoy. Máximo: ${maxFecha.toISOString().split('T')[0]}`,
        );
      }
    }

    const clave = this.generatorService.generateLicenciaKey(
      dto.empresa_id,
      dto.tipo,
      fechaVencimiento,
    );

    const claveEncriptada = this.cryptoService.encryptAES256GCM(clave);
    const claveHash = this.cryptoService.generateSHA256Hash(clave);

    // Payload canónico v1: cubre empresa_id, tipo, fechas, max_usuarios,
    // hardware_id (vacío al generar, se re-firma en activar), activa, revocada.
    const firmaPayload = this.cryptoService.buildIntegrityPayload({
      empresa_id: dto.empresa_id,
      tipo: dto.tipo,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
      max_usuarios: dto.max_usuarios ?? 0,
      hardware_id: '',
      activa: true,
      revocada: false,
    });
    const firmaHmac = this.cryptoService.signHMAC(firmaPayload);

    const licencia = await this.licenciaModel.create({
      clave_hash: claveHash,
      clave_activacion_encriptada: claveEncriptada,
      empresa_nombre: dto.empresa_nombre,
      empresa_id: dto.empresa_id,
      tipo: dto.tipo,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
      activa: true,
      dias_restantes:
        this.generatorService.calculateRemainingDays(fechaVencimiento),
      max_usuarios: dto.max_usuarios ?? 0,
      hardware_id: '',
      firma_hmac: firmaHmac,
      version_firma: FIRMA_VERSION_ACTUAL,
      requiere_re_firma: false,
      metadata: dto.metadata ?? {},
    });

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'generacion',
      empresa_id: dto.empresa_id,
      exitoso: true,
      detalles: { tipo: dto.tipo, clave_hash: claveHash },
    });

    return {
      mensaje: 'Licencia generada exitosamente',
      licencia: {
        clave,
        empresa: licencia.empresa_nombre,
        tipo: licencia.tipo,
        fecha_inicio: licencia.fecha_inicio,
        fecha_vencimiento: licencia.fecha_vencimiento,
        dias_restantes: licencia.dias_restantes,
        max_usuarios: licencia.max_usuarios,
      },
    };
  }

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

    const claveHash = this.cryptoService.generateSHA256Hash(
      dto.clave_activacion,
    );
    const licencia = await this.licenciaModel.findOne({
      clave_hash: claveHash,
    });

    if (!licencia) {
      await auditRechazo(
        'no-existe',
        'Licencia no encontrada o inválida',
        undefined,
        dto.empresa_id,
      );
      throw new NotFoundException('Licencia inválida');
    }

    if (licencia.revocada) {
      await auditRechazo(
        'revocada',
        'Licencia revocada',
        licencia._id,
        licencia.empresa_id,
      );
      throw new BadRequestException('Licencia inválida');
    }

    if (
      this.validatorService.isExpired(
        licencia.fecha_vencimiento,
        licencia.ultima_verificacion_efectiva,
      )
    ) {
      await auditRechazo(
        'expirada',
        'Licencia expirada',
        licencia._id,
        licencia.empresa_id,
      );
      throw new BadRequestException('Licencia inválida');
    }

    // P1-2: no rebinding empresa_id (no-admin nunca; admin sólo por flujo
    // separado de regeneración admin explícita, no por este endpoint).
    if (dto.empresa_id && dto.empresa_id !== licencia.empresa_id) {
      await auditRechazo(
        'empresa-mismatch',
        'Re-vinculación no permitida',
        licencia._id,
        dto.empresa_id,
      );
      throw new ForbiddenException('Licencia inválida');
    }

    const isLegacy =
      licencia.version_firma === undefined || licencia.version_firma === 0;
    if (isLegacy) {
      licencia.requiere_re_firma = true;
      await this.auditService.logAccion({
        licencia_id: licencia._id,
        accion: 'firma-legacy',
        empresa_id: licencia.empresa_id,
        exitoso: true,
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { motivo: 'firma-legacy-en-activacion' },
      });
    }

    if (!this.validatorService.validateIntegrity(licencia)) {
      await auditRechazo(
        'integridad',
        'Firma HMAC inválida',
        licencia._id,
        licencia.empresa_id,
      );
      throw new BadRequestException('Licencia inválida');
    }

    // P0-3: hardware_id enforcement.
    let hardwareHash: string;
    if (licencia.hardware_id) {
      // Re-activación: comparar hash del dto.hardware_id con el guardado.
      if (
        !this.validatorService.validateHardwareId(
          licencia.hardware_id,
          dto.hardware_id,
        )
      ) {
        await auditRechazo(
          'hardware-mismatch',
          'Hardware no coincide con la activación registrada',
          licencia._id,
          licencia.empresa_id,
        );
        throw new ForbiddenException('Licencia inválida');
      }
      hardwareHash = licencia.hardware_id;
    } else {
      // Primera activación: persistir el hash.
      hardwareHash = this.cryptoService.generateSHA256Hash(dto.hardware_id);
    }

    const empresaNombre = dto.empresa_nombre ?? licencia.empresa_nombre;

    licencia.activa = true;
    licencia.empresa_nombre = empresaNombre;
    licencia.hardware_id = hardwareHash;
    const now = Date.now();
    const efectivaPrev = licencia.ultima_verificacion_efectiva?.getTime();
    const efectivaNew = efectivaPrev && efectivaPrev > now ? efectivaPrev : now;
    licencia.ultima_verificacion = new Date(now);
    licencia.ultima_verificacion_efectiva = new Date(efectivaNew);
    licencia.ultima_verificacion_monotonic_ms = this.monotonicMs();
    licencia.dias_restantes = this.generatorService.calculateRemainingDays(
      licencia.fecha_vencimiento,
    );

    // Re-firma tras toda mutación de campos firmados. Se preserva el
    // version_firma actual (legacy o v1) para no romper back-compat.
    const firmaPayload = this.cryptoService.buildPayloadForVersion(
      licencia.version_firma,
      {
        empresa_id: licencia.empresa_id,
        tipo: licencia.tipo,
        fecha_inicio: licencia.fecha_inicio,
        fecha_vencimiento: licencia.fecha_vencimiento,
        max_usuarios: licencia.max_usuarios,
        hardware_id: licencia.hardware_id,
        activa: licencia.activa,
        revocada: licencia.revocada,
      },
    );
    licencia.firma_hmac = this.cryptoService.signHMAC(firmaPayload);

    await licencia.save();

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'activacion',
      empresa_id: licencia.empresa_id,
      exitoso: true,
      ip_origen: ipOrig,
      user_agent: userAgent,
      detalles: { hardware_bound: !!dto.hardware_id },
    });

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
    // Si legacy, marcar requiere_re_firma para que un admin migre.
    const isLegacy =
      licencia.version_firma === undefined || licencia.version_firma === 0;
    if (isLegacy) {
      licencia.requiere_re_firma = true;
      await this.auditService.logAccion({
        licencia_id: licencia._id,
        accion: 'firma-legacy',
        empresa_id: empresaId,
        exitoso: true,
        ip_origen: ipOrig,
        user_agent: userAgent,
      });
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

  async renovarLicencia(
    dto: RenovarLicenciaDto,
    ipOrig?: string,
    userAgent?: string,
  ): Promise<LicenciaRenovadaResponse> {
    let licencia: LicenciaDocument | null = null;

    if (dto.clave_activacion) {
      const claveHash = this.cryptoService.generateSHA256Hash(
        dto.clave_activacion,
      );
      licencia = await this.licenciaModel.findOne({ clave_hash: claveHash });
    } else if (dto.empresa_id) {
      licencia = await this.licenciaModel.findOne({
        empresa_id: dto.empresa_id,
      });
    }

    if (!licencia) {
      await this.auditService.logAccion({
        accion: 'rechazo',
        empresa_id: dto.empresa_id ?? undefined,
        exitoso: false,
        error: 'No se encontró licencia para esta clave o empresa',
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { motivo: 'no-existe' },
      });
      throw new NotFoundException(
        'No se encontró licencia para esta clave o empresa',
      );
    }

    // P1-1: renovar NO resetea revocada. Si está revocada, no se puede renovar.
    if (licencia.revocada) {
      await this.auditService.logAccion({
        licencia_id: licencia._id,
        accion: 'rechazo',
        empresa_id: licencia.empresa_id,
        exitoso: false,
        error: 'Licencia revocada; use regeneración admin explícita',
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { motivo: 'revocada' },
      });
      throw new BadRequestException(
        'Licencia revocada; use regeneración admin explícita',
      );
    }

    if (!this.validatorService.validateIntegrity(licencia)) {
      await this.auditService.logAccion({
        licencia_id: licencia._id,
        accion: 'rechazo',
        empresa_id: licencia.empresa_id,
        exitoso: false,
        error: 'Integridad de licencia comprometida. Contacte al soporte.',
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { motivo: 'integridad' },
      });
      throw new BadRequestException(
        'Integridad de licencia comprometida. Contacte al soporte.',
      );
    }

    let nuevaFechaVencimiento: Date;
    let diasAgregados: number;

    if (dto.fecha_vencimiento) {
      nuevaFechaVencimiento = new Date(dto.fecha_vencimiento);
      nuevaFechaVencimiento.setHours(23, 59, 59, 999);
      const ahora = new Date();
      diasAgregados = Math.ceil(
        (nuevaFechaVencimiento.getTime() -
          (licencia.fecha_vencimiento < ahora
            ? ahora.getTime()
            : licencia.fecha_vencimiento.getTime())) /
          (1000 * 60 * 60 * 24),
      );
    } else {
      const dias = dto.dias || 30;
      diasAgregados = dias;
      const baseFecha =
        licencia.fecha_vencimiento < new Date()
          ? new Date()
          : licencia.fecha_vencimiento;
      nuevaFechaVencimiento = new Date(baseFecha);
      nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + dias);
      nuevaFechaVencimiento.setHours(23, 59, 59, 999);
    }

    if (licencia.tipo !== 'perpetua') {
      const maxFecha = new Date();
      maxFecha.setDate(maxFecha.getDate() + 30);
      maxFecha.setHours(23, 59, 59, 999);
      if (nuevaFechaVencimiento > maxFecha) {
        await this.auditService.logAccion({
          licencia_id: licencia._id,
          accion: 'rechazo',
          empresa_id: licencia.empresa_id,
          exitoso: false,
          error: 'La renovación excede 30 días a partir de hoy',
          ip_origen: ipOrig,
          user_agent: userAgent,
          detalles: { motivo: 'formato' },
        });
        throw new BadRequestException(
          `La renovación no puede exceder 30 días a partir de hoy. Máximo: ${maxFecha.toISOString().split('T')[0]}`,
        );
      }
    }

    const fechaInicio = dto.fecha_inicio
      ? new Date(dto.fecha_inicio)
      : licencia.fecha_inicio;

    // Re-firma con el version_firma existente (legacy o v1).
    const firmaPayload = this.cryptoService.buildPayloadForVersion(
      licencia.version_firma,
      {
        empresa_id: licencia.empresa_id,
        tipo: licencia.tipo,
        fecha_inicio: fechaInicio,
        fecha_vencimiento: nuevaFechaVencimiento,
        max_usuarios: licencia.max_usuarios,
        hardware_id: licencia.hardware_id,
        activa: true,
        revocada: licencia.revocada,
      },
    );
    const nuevaFirma = this.cryptoService.signHMAC(firmaPayload);

    licencia.fecha_vencimiento = nuevaFechaVencimiento;
    licencia.fecha_inicio = fechaInicio;
    licencia.firma_hmac = nuevaFirma;
    licencia.activa = true;
    licencia.dias_restantes = this.generatorService.calculateRemainingDays(
      nuevaFechaVencimiento,
    );

    const now = Date.now();
    const efectivaPrev = licencia.ultima_verificacion_efectiva?.getTime();
    licencia.ultima_verificacion = new Date(now);
    licencia.ultima_verificacion_efectiva = new Date(
      efectivaPrev && efectivaPrev > now ? efectivaPrev : now,
    );
    licencia.ultima_verificacion_monotonic_ms = this.monotonicMs();

    await licencia.save();

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'renovacion',
      empresa_id: licencia.empresa_id,
      exitoso: true,
      ip_origen: ipOrig,
      user_agent: userAgent,
      detalles: {
        dias_agregados: diasAgregados,
        nueva_fecha: nuevaFechaVencimiento,
      },
    });

    return {
      mensaje: 'Licencia renovada exitosamente',
      licencia: {
        empresa: licencia.empresa_nombre,
        tipo: licencia.tipo,
        fecha_inicio: licencia.fecha_inicio,
        fecha_vencimiento: licencia.fecha_vencimiento,
        dias_restantes: licencia.dias_restantes,
      },
    };
  }

  async revocarLicencia(
    empresaId: string,
    motivo: string,
    ipOrig?: string,
    userAgent?: string,
  ): Promise<{ mensaje: string }> {
    const licencia = await this.licenciaModel.findOne({
      empresa_id: empresaId,
    });

    if (!licencia) {
      await this.auditService.logAccion({
        accion: 'rechazo',
        empresa_id: empresaId,
        exitoso: false,
        error: 'No se encontró licencia para esta empresa',
        ip_origen: ipOrig,
        user_agent: userAgent,
        detalles: { motivo: 'no-existe' },
      });
      throw new NotFoundException('No se encontró licencia para esta empresa');
    }

    licencia.activa = false;
    licencia.revocada = true;
    if (motivo) licencia.motivo_revocacion = motivo;

    // Re-firma con version_firma actual: revocada es parte del payload v1
    // (no afecta legacy ya que revocada no está en payload legacy).
    const firmaPayload = this.cryptoService.buildPayloadForVersion(
      licencia.version_firma,
      {
        empresa_id: licencia.empresa_id,
        tipo: licencia.tipo,
        fecha_inicio: licencia.fecha_inicio,
        fecha_vencimiento: licencia.fecha_vencimiento,
        max_usuarios: licencia.max_usuarios,
        hardware_id: licencia.hardware_id,
        activa: licencia.activa,
        revocada: licencia.revocada,
      },
    );
    licencia.firma_hmac = this.cryptoService.signHMAC(firmaPayload);

    await licencia.save();

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'revocacion',
      empresa_id: empresaId,
      exitoso: true,
      ip_origen: ipOrig,
      user_agent: userAgent,
      detalles: { motivo },
    });

    return { mensaje: 'Licencia revocada exitosamente' };
  }

  async findAll(): Promise<LicenciaDocument[]> {
    const licencias = await this.licenciaModel
      .find()
      .select('-clave_activacion_encriptada -firma_hmac')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return licencias as LicenciaDocument[];
  }

  async findOne(empresaId: string): Promise<LicenciaDocument | null> {
    const licencia = await this.licenciaModel
      .findOne({ empresa_id: empresaId })
      .select('-clave_activacion_encriptada -firma_hmac')
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
          '+firma_hmac +activa +revocada +fecha_vencimiento +hardware_id +max_usuarios +ultima_verificacion_efectiva +version_firma',
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
