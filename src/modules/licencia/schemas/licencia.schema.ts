import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LicenciaDocument = HydratedDocument<Licencia>;

@Schema({ timestamps: true, collection: 'licencias' })
export class Licencia {
  @Prop({ required: true })
  clave_hash: string;

  @Prop({ required: true })
  clave_activacion_encriptada: string;

  @Prop({ required: true })
  empresa_nombre: string;

  @Prop({ required: true })
  empresa_id: string;

  @Prop({
    required: true,
    enum: ['trial', 'suscripcion_mensual', 'suscripcion_anual', 'perpetua'],
  })
  tipo: string;

  @Prop({ required: true })
  fecha_inicio: Date;

  @Prop({ required: true })
  fecha_vencimiento: Date;

  @Prop({ default: true })
  activa: boolean;

  @Prop({ default: 0 })
  dias_restantes: number;

  @Prop({ default: 0 })
  max_usuarios: number;

  @Prop()
  hardware_id: string;

  @Prop()
  ultima_verificacion: Date;

  @Prop()
  firma_hmac: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ default: false })
  revocada: boolean;

  @Prop()
  motivo_revocacion?: string;
}

export const LicenciaSchema = SchemaFactory.createForClass(Licencia);

LicenciaSchema.index({ clave_hash: 1 }, { unique: true });
LicenciaSchema.index({ empresa_id: 1 }, { unique: true });
LicenciaSchema.index({ activa: 1, fecha_vencimiento: 1 });
LicenciaSchema.index({ clave_activacion_encriptada: 1 }, { unique: true });
