import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ActivoFijoDocument = HydratedDocument<ActivoFijo>;

@Schema()
export class ActivoFijo {

  @Prop({ required: true, unique: true })
  codigoActivo!: string;

  @Prop({ required: true })
  descripcionActivo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Empresa' })
  proveedor!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Area' })
  area!: Types.ObjectId;

  @Prop({ type: Date })
  fechaCompra!: Date;

  @Prop({ required: true })
  valor!: number;                    // Costo de adquisición

  @Prop({ required: true })
  valorResidual!: number;            // Valor residual (salvamento)

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tasa_Depreciacion' })
  depreciacionActivo!: Types.ObjectId;

  @Prop({ required: true })
  depreciacionAcumulada!: number;

  @Prop({ required: true })
  vidaUtil!: number;                // Años

  @Prop({ type: Types.ObjectId, ref: 'Pais', required: true })
  pais!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Concepto', required: true })
  concepto!: Types.ObjectId;

  @Prop({ required: true })
  compra!: string;

  @Prop({ required: true })
  ajusteValor!: number;

  @Prop({  type: Types.ObjectId, ref: 'Movimiento', required: true})
  movimiento!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Estado', required: true })
  estadoActivo!: Types.ObjectId;
}

export const Activo_FijoSchema = SchemaFactory.createForClass(ActivoFijo);