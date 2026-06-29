import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoCambio } from '../types/cambio-divisa.types';
import { TipoTasa } from '../../../nomencladores/tasa-cambio/types/tasa-cambio.types';

export type CambioDivisaDocument = HydratedDocument<CambioDivisa>;

@Schema({ timestamps: true })
export class CambioDivisa {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  monedaOrigen!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  monedaDestino!: Types.ObjectId;

  @Prop({ required: true })
  montoOrigen!: number;

  @Prop({ required: true })
  montoDestino!: number;

  @Prop({ required: true })
  tasaAplicada!: number;

  @Prop({ required: true, enum: TipoTasa, default: TipoTasa.OFICIAL })
  tipoTasa!: TipoTasa;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaOrigen?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaDestino?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja' })
  cajaOrigen?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja' })
  cajaDestino?: Types.ObjectId;

  @Prop({ required: true, enum: EstadoCambio, default: EstadoCambio.EJECUTADA })
  estado!: EstadoCambio;

  @Prop()
  comprobante?: string;

  @Prop()
  descripcion?: string;
}

export const CambioDivisaSchema = SchemaFactory.createForClass(CambioDivisa);
