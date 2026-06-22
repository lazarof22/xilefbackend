import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuditoriaLicencia,
  AuditoriaLicenciaDocument,
} from '../schemas/auditoria-licencia.schema';
import { Types } from 'mongoose';

@Injectable()
export class LicenciaAuditService {
  constructor(
    @InjectModel(AuditoriaLicencia.name)
    private readonly auditoriaModel: Model<AuditoriaLicenciaDocument>,
  ) {}

  async logAccion(params: {
    licencia_id: Types.ObjectId;
    accion: string;
    empresa_id?: string;
    detalles?: Record<string, any>;
    exitoso: boolean;
    error?: string;
    ip_origen?: string;
    user_agent?: string;
  }): Promise<void> {
    try {
      await this.auditoriaModel.create({
        licencia_id: params.licencia_id,
        accion: params.accion,
        empresa_id: params.empresa_id,
        detalles: params.detalles || {},
        exitoso: params.exitoso,
        error: params.error || undefined,
        ip_origen: params.ip_origen || undefined,
        user_agent: params.user_agent || undefined,
      });
    } catch {
      // Fail silently - audit should never break main flow
    }
  }

  async getAuditoriaPorLicencia(licenciaId: Types.ObjectId): Promise<AuditoriaLicenciaDocument[]> {
    return this.auditoriaModel
      .find({ licencia_id: licenciaId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getTodasAuditorias(limit = 100): Promise<AuditoriaLicenciaDocument[]> {
    return this.auditoriaModel
      .find()
      .sort({ createdAt: -1 })
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
