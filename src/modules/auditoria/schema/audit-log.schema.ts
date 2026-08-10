import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AccionAuditoria, ModuloAuditoria } from '../types/auditoria.types';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true, index: true })
  entidad!: string;

  @Prop({ required: true, index: true })
  entidadId!: string;

  @Prop({ required: true, enum: AccionAuditoria, index: true })
  accion!: AccionAuditoria;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Usuario', index: true })
  usuarioId!: Types.ObjectId;

  @Prop()
  usuarioNombre?: string;

  @Prop({ type: Object })
  valoresAnteriores?: Record<string, unknown>;

  @Prop({ type: Object })
  valoresNuevos?: Record<string, unknown>;

  @Prop({ enum: ModuloAuditoria, index: true })
  modulo?: ModuloAuditoria;

  @Prop()
  ip?: string;

  @Prop()
  descripcion?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ entidad: 1, createdAt: -1 });
AuditLogSchema.index({ usuarioId: 1, createdAt: -1 });
AuditLogSchema.index({ modulo: 1, accion: 1 });
