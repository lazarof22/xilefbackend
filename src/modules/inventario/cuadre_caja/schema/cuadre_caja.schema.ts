import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CuadreCajaDocument = HydratedDocument<CuadreCaja>;

@Schema({ _id: false })
export class DesgloseBilletes {
  @Prop({ required: true, default: 0 })
  billete5000!: number;

  @Prop({ required: true, default: 0 })
  billete2000!: number;

  @Prop({ required: true, default: 0 })
  billete1000!: number;

  @Prop({ required: true, default: 0 })
  billete500!: number;

  @Prop({ required: true, default: 0 })
  billete200!: number;

  @Prop({ required: true, default: 0 })
  billete100!: number;

  @Prop({ required: true, default: 0 })
  billete50!: number;

  @Prop({ required: true, default: 0 })
  billete20!: number;

  @Prop({ required: true, default: 0 })
  billete10!: number;

  @Prop({ required: true, default: 0 })
  billete5!: number;

  @Prop({ required: true, default: 0 })
  billete3!: number;

  @Prop({ required: true, default: 0 })
  billete1!: number;
}

@Schema({ _id: false })
export class OtroMotivo {
  @Prop({ required: true })
  concepto!: string;

  @Prop({ required: true, min: 0 })
  monto!: number;

  @Prop({ required: true, enum: ['ingreso', 'egreso'] })
  tipo!: string;
}

@Schema({ timestamps: true })
export class CuadreCaja {
  @Prop({ type: Date, default: Date.now })
  fecha!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  empleado!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  creditos!: number;

  @Prop({ required: true, min: 0 })
  total_ventas_dia!: number;

  @Prop({ required: true, min: 0 })
  total_extracciones_dia!: number;

  @Prop({ required: true, type: DesgloseBilletes })
  desglose_billetes!: DesgloseBilletes;

  @Prop({ required: true, min: 0 })
  valor_transferencias!: number;

  @Prop({ required: true, min: 0 })
  recargos!: number;

  @Prop({ required: true, min: 0 })
  descuentos!: number;

  @Prop({ type: [OtroMotivo], default: [] })
  otros_motivos!: OtroMotivo[];

  @Prop({ required: true, min: 0 })
  total_efectivo!: number;

  @Prop({ required: true, min: 0, default: 0 })
  efectivo_esperado!: number;

  @Prop({ required: true, default: 0 })
  diferencia!: number;

  @Prop({
    required: true,
    enum: ['cuadrado', 'diferencia'],
    default: 'cuadrado',
  })
  estado!: string;

}

export const CuadreCajaSchema = SchemaFactory.createForClass(CuadreCaja);
