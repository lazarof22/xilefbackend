import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Licencia, LicenciaDocument } from './schemas/licencia.schema';
import { LicenciaCryptoService } from './services/licencia-crypto.service';
import { LicenciaGeneratorService } from './services/licencia-generator.service';
import { LicenciaValidatorService } from './services/licencia-validator.service';
import { LicenciaAuditService } from './services/licencia-audit.service';
import { ActivarLicenciaDto } from './dto/activar-licencia.dto';
import { GenerarLicenciaDto } from './dto/generar-licencia.dto';
import { RenovarLicenciaDto } from './dto/renovar-licencia.dto';
import { LicenciaTipo } from './constants/licencia.constants';
import {
  LicenciaGeneradaResponse,
  LicenciaActivadaResponse,
  EstadoLicenciaResponse,
  LicenciaRenovadaResponse,
  EstadoPublicoResponse,
} from './types/licencia.types';
import type { AuditoriaLicenciaDocument } from './schemas/auditoria-licencia.schema';

@Injectable()
export class LicenciaService {
  constructor(
    @InjectModel(Licencia.name)
    private readonly licenciaModel: Model<LicenciaDocument>,
    private readonly cryptoService: LicenciaCryptoService,
    private readonly generatorService: LicenciaGeneratorService,
    private readonly validatorService: LicenciaValidatorService,
    private readonly auditService: LicenciaAuditService,
  ) {}

  async generateLicencia(dto: GenerarLicenciaDto): Promise<LicenciaGeneradaResponse> {
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
      : this.generatorService.calculateExpiryDate(
          dto.tipo,
          dto.duracion_dias,
        );

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

    const firmaPayload = this.cryptoService.buildIntegrityPayload({
      empresa_id: dto.empresa_id,
      tipo: dto.tipo,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
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
      dias_restantes: this.generatorService.calculateRemainingDays(
        fechaVencimiento,
      ),
      max_usuarios: dto.max_usuarios ?? 0,
      firma_hmac: firmaHmac,
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
    ip?: string,
    userAgent?: string,
  ): Promise<LicenciaActivadaResponse> {
    if (!this.validatorService.validateKeyFormat(dto.clave_activacion)) {
      throw new BadRequestException(
        'Formato de clave inválido. Debe ser XILEF-XXXX-XXXX-XXXX-XXXX',
      );
    }

    if (!this.validatorService.validateNonce(dto.nonce ?? '')) {
      throw new BadRequestException(
        'Nonce inválido o ya utilizado. Posible ataque de replay.',
      );
    }

    const claveHash = this.cryptoService.generateSHA256Hash(dto.clave_activacion);

    const licencia = await this.licenciaModel.findOne({
      clave_hash: claveHash,
    });

    if (!licencia) {
      throw new NotFoundException('Licencia no encontrada o inválida');
    }

    const empresaId = dto.empresa_id ?? licencia.empresa_id;
    const empresaNombre = dto.empresa_nombre ?? licencia.empresa_nombre;

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'activacion',
      empresa_id: empresaId,
      exitoso: false,
      error: 'Intento de activación',
      ip_origen: ip,
      user_agent: userAgent,
    });

    if (licencia.revocada) {
      throw new BadRequestException(
        'Licencia no encontrada o inválida',
      );
    }

    if (this.validatorService.isExpired(licencia.fecha_vencimiento)) {
      throw new BadRequestException(
        'Licencia no encontrada o inválida',
      );
    }

    if (licencia.activa && dto.empresa_id && licencia.empresa_id !== dto.empresa_id) {
      throw new BadRequestException(
        'Licencia no encontrada o inválida',
      );
    }

    const firmaPayload = this.cryptoService.buildIntegrityPayload({
      empresa_id: licencia.empresa_id,
      tipo: licencia.tipo,
      fecha_inicio: licencia.fecha_inicio,
      fecha_vencimiento: licencia.fecha_vencimiento,
    });

    if (!this.validatorService.validateIntegrity(licencia)) {
      throw new BadRequestException(
        'Licencia no encontrada o inválida',
      );
    }

    const hardwareId = dto.hardware_id
      ? this.cryptoService.generateSHA256Hash(dto.hardware_id)
      : licencia.hardware_id;

    licencia.activa = true;
    licencia.empresa_nombre = empresaNombre;
    licencia.empresa_id = empresaId;
    licencia.hardware_id = hardwareId;
    licencia.ultima_verificacion = new Date();
    licencia.dias_restantes = this.generatorService.calculateRemainingDays(
      licencia.fecha_vencimiento,
    );

    await licencia.save();

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'activacion',
      empresa_id: empresaId,
      exitoso: true,
      ip_origen: ip,
      user_agent: userAgent,
      detalles: {
        hardware_bound: !!dto.hardware_id,
      },
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

  async verificarEstado(empresaId: string): Promise<EstadoLicenciaResponse> {
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
      licencia.activa = false;
      await licencia.save();
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

    const vigente = !this.validatorService.isExpired(licencia.fecha_vencimiento);
    const diasRestantes = this.generatorService.calculateRemainingDays(
      licencia.fecha_vencimiento,
    );

    if (licencia.dias_restantes !== diasRestantes) {
      licencia.dias_restantes = diasRestantes;
      licencia.ultima_verificacion = new Date();
      await licencia.save();
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

  async renovarLicencia(dto: RenovarLicenciaDto): Promise<LicenciaRenovadaResponse> {
    let licencia: LicenciaDocument | null = null;

    if (dto.clave_activacion) {
      const claveHash = this.cryptoService.generateSHA256Hash(dto.clave_activacion);
      licencia = await this.licenciaModel.findOne({ clave_hash: claveHash });
    } else if (dto.empresa_id) {
      licencia = await this.licenciaModel.findOne({ empresa_id: dto.empresa_id });
    }

    if (!licencia) {
      throw new NotFoundException(
        'No se encontró licencia para esta clave o empresa',
      );
    }

    if (!this.validatorService.validateIntegrity(licencia)) {
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
        (nuevaFechaVencimiento.getTime() - (licencia.fecha_vencimiento < ahora ? ahora.getTime() : licencia.fecha_vencimiento.getTime())) /
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
        throw new BadRequestException(
          `La renovación no puede exceder 30 días a partir de hoy. Máximo: ${maxFecha.toISOString().split('T')[0]}`,
        );
      }
    }

    const fechaInicio = dto.fecha_inicio
      ? new Date(dto.fecha_inicio)
      : licencia.fecha_inicio;

    const firmaPayload = this.cryptoService.buildIntegrityPayload({
      empresa_id: licencia.empresa_id,
      tipo: licencia.tipo,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: nuevaFechaVencimiento,
    });
    const nuevaFirma = this.cryptoService.signHMAC(firmaPayload);

    licencia.fecha_vencimiento = nuevaFechaVencimiento;
    licencia.fecha_inicio = fechaInicio;
    licencia.firma_hmac = nuevaFirma;
    licencia.activa = true;
    licencia.revocada = false;
    licencia.motivo_revocacion = undefined;
    licencia.dias_restantes =
      this.generatorService.calculateRemainingDays(nuevaFechaVencimiento);

    await licencia.save();

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'renovacion',
      empresa_id: licencia.empresa_id,
      exitoso: true,
      detalles: { dias_agregados: diasAgregados, nueva_fecha: nuevaFechaVencimiento },
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
  ): Promise<{ mensaje: string }> {
    const licencia = await this.licenciaModel.findOne({
      empresa_id: empresaId,
    });

    if (!licencia) {
      throw new NotFoundException(
        'No se encontró licencia para esta empresa',
      );
    }

    licencia.activa = false;
    licencia.revocada = true;
    licencia.motivo_revocacion = motivo || 'Revocada por administrador';

    await licencia.save();

    await this.auditService.logAccion({
      licencia_id: licencia._id,
      accion: 'revocacion',
      empresa_id: empresaId,
      exitoso: true,
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

  async getAuditoria(): Promise<AuditoriaLicenciaDocument[]> {
    return this.auditService.getTodasAuditorias();
  }

  private async timingSafeDelay(): Promise<void> {
    const ms = crypto.randomInt(30, 80);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fixedTimeResponse<T>(fn: () => Promise<T>, minMs = 150): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;
    if (elapsed < minMs) {
      await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
    }
    return result;
  }

  async estadoPublico(clave: string): Promise<EstadoPublicoResponse> {
    return this.fixedTimeResponse(async () => {
    if (!clave) {
      return {
        valida: false, vigente: false, dias_restantes: 0,
        tipo: null, empresa: null, empresa_id: null,
        fecha_inicio: null, fecha_vencimiento: null,
        max_usuarios: 0, activa: false, revocada: false,
      };
    }
    const claveHash = this.cryptoService.generateSHA256Hash(clave);
    const licencia = await this.licenciaModel
      .findOne({ clave_hash: claveHash })
      .select('-clave_activacion_encriptada -firma_hmac -hardware_id -clave_hash')
      .lean()
      .exec();

    if (!licencia || licencia.revocada) {
      return {
        valida: false, vigente: false, dias_restantes: 0,
        tipo: licencia?.tipo || null,
        empresa: licencia?.empresa_nombre || null,
        empresa_id: licencia?.empresa_id || null,
        fecha_inicio: licencia?.fecha_inicio || null,
        fecha_vencimiento: licencia?.fecha_vencimiento || null,
        max_usuarios: licencia?.max_usuarios || 0,
        activa: false, revocada: licencia?.revocada || false,
      };
    }
    const ahora = new Date();
    const vigente = licencia.fecha_vencimiento >= ahora;
    const diasRestantes = Math.max(0, Math.ceil(
      (licencia.fecha_vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24),
    ));
    return {
      valida: true, vigente,
      dias_restantes: diasRestantes,
      tipo: licencia.tipo,
      empresa: licencia.empresa_nombre,
      empresa_id: licencia.empresa_id,
      fecha_inicio: licencia.fecha_inicio,
      fecha_vencimiento: licencia.fecha_vencimiento,
      max_usuarios: licencia.max_usuarios,
      activa: licencia.activa,
      revocada: false,
    };
    });
  }
}
