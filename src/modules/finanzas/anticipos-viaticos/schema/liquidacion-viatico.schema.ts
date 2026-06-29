import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ResultadoLiquidacion,
  EstadoLiquidacion,
} from '../types/anticipos-viaticos.types';

export type LiquidacionViaticoDocument = HydratedDocument<LiquidacionViatico>;

@Schema({ timestamps: true })
export class LiquidacionViatico {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Anticipo', index: true })
  anticipo!: Types.ObjectId;

  @Prop({ required: true })
  fecha!: Date;

  @Prop({ required: true })
  montoAnticipo!: number;

  @Prop({ required: true })
  gastoReal!: number;

  @Prop({ required: true })
  diferencia!: number;

  @Prop({ required: true, enum: ResultadoLiquidacion })
  resultado!: ResultadoLiquidacion;

  @Prop({
    type: [
      {
        descripcion: { type: String, required: true },
        monto: { type: Number, required: true },
        categoria: { type: Types.ObjectId, ref: 'Concepto', required: true },
        fecha: { type: Date, required: true },
      },
    ],
    default: [],
  })
  detalleGastos!: Array<{
    descripcion: string;
    monto: number;
    categoria: Types.ObjectId;
    fecha: Date;
  }>;

  @Prop({
    required: true,
    enum: EstadoLiquidacion,
    default: EstadoLiquidacion.PENDIENTE,
  })
  estado!: EstadoLiquidacion;

  @Prop()
  observaciones?: string;
}

export const LiquidacionViaticoSchema =
  SchemaFactory.createForClass(LiquidacionViatico);
