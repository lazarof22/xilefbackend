import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ActivoFijoDocument = HydratedDocument<ActivoFijo>;

@Schema({ timestamps: true })
export class ActivoFijo {

  @Prop({ required: true, unique: true })
  codigoActivo!: string;

  @Prop({ required: true })
  descripcionActivo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Empresa' })
  proveedor!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Area' })
  area!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  fechaCompra!: Date;

  @Prop({ required: true })
  valor!: number;                    // Costo de adquisición

  @Prop({ required: true })
  valorResidual!: number;            // Valor residual (salvamento)

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tasa_Depreciacion' })
  depreciacionActivo!: Types.ObjectId;

  // ─── CAMPOS DE DEPRECIACIÓN AUTO-CALCULADOS ──────
  @Prop({ required: true, default: 0 })
  depreciacionAnual!: number;        // (valor - valorResidual) / vidaUtil

  @Prop({ required: true, default: 0 })
  depreciacionMensual!: number;      // depreciacionAnual / 12

  @Prop({ required: true, default: 0 })
  depreciacionAcumulada!: number;

  @Prop({ required: true, default: 0 })
  valorEnLibros!: number;            // valor - depreciacionAcumulada

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  moneda!: Types.ObjectId;

  @Prop({ required: true })
  vidaUtil!: number;                // Años

  @Prop({ type: Types.ObjectId, ref: 'Pais', required: true })
  pais!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Concepto', required: true })
  concepto!: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  ajusteValor!: number;

  @Prop({ type: Types.ObjectId, ref: 'Movimiento', required: true })
  movimiento!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Estado', required: true })
  estadoActivo!: Types.ObjectId;
}

export const Activo_FijoSchema = SchemaFactory.createForClass(ActivoFijo);