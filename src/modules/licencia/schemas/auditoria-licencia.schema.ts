import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditoriaLicenciaDocument = HydratedDocument<AuditoriaLicencia>;

@Schema({ timestamps: true, collection: 'auditoria_licencias' })
export class AuditoriaLicencia {
  @Prop({ type: Types.ObjectId, ref: 'Licencia', required: true })
  licencia_id: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'activacion',
      'verificacion',
      'renovacion',
      'revocacion',
      'rechazo',
      'generacion',
    ],
  })
  accion: string;

  @Prop()
  empresa_id: string;

  @Prop({ type: Object })
  detalles: Record<string, any>;

  @Prop({ default: true })
  exitoso: boolean;

  @Prop()
  error: string;

  @Prop()
  ip_origen: string;

  @Prop()
  user_agent: string;
}

export const AuditoriaLicenciaSchema =
  SchemaFactory.createForClass(AuditoriaLicencia);

AuditoriaLicenciaSchema.index({ licencia_id: 1, createdAt: -1 });
AuditoriaLicenciaSchema.index({ empresa_id: 1 });
AuditoriaLicenciaSchema.index({ accion: 1, exitoso: 1 });
