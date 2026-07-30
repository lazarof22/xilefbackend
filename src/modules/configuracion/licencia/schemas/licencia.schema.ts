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

  /**
   * Máximo histórico observado de ultima_verificacion. defensa anti clock-skew:
   * si Date.now() < ultima_verificacion_efectiva, se considera que el reloj
   * retrocedió y se usa esta fecha como referencia (max) para no revivir
   * licencias vencidas.
   */
  @Prop()
  ultima_verificacion_efectiva: Date;

  /**
   * True si se detectó que Date.now() < ultima_verificacion_efectiva en alguna
   * verificación (clock skew probable). No bloquea el servicio pero queda
   * registrado para auditoría.
   */
  @Prop({ default: false })
  skew_detectado: boolean;

  /**
   * Marca temporal monótona (ms) basada en process.hrtime.bigint() desde el
   * arranque del proceso. Solo se persiste si el server tiene uptime
   * reconocible. Sirve como referencia anti-rollback de reloj dentro del
   * proceso.
   */
  @Prop()
  ultima_verificacion_monotonic_ms: number;

  @Prop()
  firma_hmac: string;

  /**
   * Versión del formato de firma HMAC.
   * 1 = payload canónico (ordenado, JSON con hardware_id, max_usuarios, etc.)
   * 0 / undefined = payload legacy (pipe-separated) para back-compat.
   */
  @Prop({ default: 1 })
  version_firma: number;

  /**
   * Marcado en true cuando una licencia tiene firma legacy y necesita ser
   * re-firmada por un admin con el payload canónico nuevo.
   */
  @Prop({ default: false })
  requiere_re_firma: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

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
