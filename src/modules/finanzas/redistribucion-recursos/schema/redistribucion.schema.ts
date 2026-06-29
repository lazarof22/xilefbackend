import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoRedistribucion } from '../types/redistribucion.types';

export type RedistribucionDocument = HydratedDocument<Redistribucion>;

@Schema({ timestamps: true })
export class Redistribucion {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  descripcion!: string;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop({
    required: true,
    enum: EstadoRedistribucion,
    default: EstadoRedistribucion.PENDIENTE,
  })
  estado!: EstadoRedistribucion;

  @Prop([
    {
      tipo: { type: String, enum: ['banco', 'caja'], required: true },
      cuentaId: { type: Types.ObjectId, required: true },
      monto: { type: Number, required: true },
      accion: { type: String, enum: ['ORIGEN', 'DESTINO'], required: true },
    },
  ])
  items!: {
    tipo: 'banco' | 'caja';
    cuentaId: Types.ObjectId;
    monto: number;
    accion: 'ORIGEN' | 'DESTINO';
  }[];

  @Prop({ required: true })
  montoTotal!: number;

  @Prop()
  justificacion?: string;

  @Prop({ type: Types.ObjectId, ref: 'Empleado' })
  aprobadoPor?: Types.ObjectId;
}

export const RedistribucionSchema =
  SchemaFactory.createForClass(Redistribucion);
