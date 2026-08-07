import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuditoriaLicencia,
  AuditoriaLicenciaDocument,
} from '../schemas/auditoria-licencia.schema';

export interface AuditQueryParams {
  limit?: number;
  offset?: number;
  empresa_id?: string;
  accion?: string;
}

@Injectable()
export class LicenciaAuditService {
  private static readonly MAX_LIMIT = 100;
  private static readonly DEFAULT_LIMIT = 100;
  private readonly logger = new Logger(LicenciaAuditService.name);

  constructor(
    @InjectModel(AuditoriaLicencia.name)
    private readonly auditoriaModel: Model<AuditoriaLicenciaDocument>,
  ) {}

  async logAccion(params: {
    licencia_id?: Types.ObjectId;
    accion: string;
    empresa_id?: string;
    detalles?: Record<string, unknown>;
    exitoso: boolean;
    error?: string;
    ip_origen?: string;
    user_agent?: string;
    motivo?: string;
  }): Promise<void> {
    try {
      await this.auditoriaModel.create({
        licencia_id: params.licencia_id,
        accion: params.accion,
        empresa_id: params.empresa_id,
        detalles: params.detalles ?? {},
        exitoso: params.exitoso,
        error: params.error ?? undefined,
        ip_origen: params.ip_origen ?? undefined,
        user_agent: params.user_agent ?? undefined,
      });
    } catch (error) {
      this.logger.error('Fallo al registrar auditoría de licencia', error);
      // Fail silently - audit should never break main flow
    }
  }

  async getAuditoriaPorLicencia(
    licenciaId: Types.ObjectId,
  ): Promise<AuditoriaLicenciaDocument[]> {
    return this.auditoriaModel
      .find({ licencia_id: licenciaId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Lista auditorías con paginación y filtros opcionales.
   * `limit` se acota a 100 máximo (default 100); `offset` default 0.
   * Filtros opcionales por `empresa_id` y `accion`.
   */
  async getTodasAuditorias(
    params: AuditQueryParams = {},
  ): Promise<AuditoriaLicenciaDocument[]> {
    const limit = Math.max(
      1,
      Math.min(
        LicenciaAuditService.MAX_LIMIT,
        params.limit ?? LicenciaAuditService.DEFAULT_LIMIT,
      ),
    );
    const offset = Math.max(0, params.offset ?? 0);
    const filter: Record<string, unknown> = {};
    if (params.empresa_id) filter.empresa_id = params.empresa_id;
    if (params.accion) filter.accion = params.accion;
    return this.auditoriaModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
  }

  async getIntentosRechazados(horas = 24): Promise<number> {
    const desde = new Date(Date.now() - horas * 60 * 60 * 1000);
    return this.auditoriaModel.countDocuments({
      accion: 'rechazo',
      exitoso: false,
      createdAt: { $gte: desde },
    });
  }
}
