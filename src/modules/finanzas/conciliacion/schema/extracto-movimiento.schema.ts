import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoExtracto, EstadoExtracto } from '../types/conciliacion.types';

export type ExtractoMovimientoDocument = HydratedDocument<ExtractoMovimiento>;

@Schema({ timestamps: true })
export class ExtractoMovimiento {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Banco', index: true })
  cuentaBancaria!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conciliacion', index: true })
  conciliacion?: Types.ObjectId;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop()
  descripcion?: string;

  @Prop({ required: true })
  monto!: number;

  @Prop({ required: true, enum: TipoExtracto })
  tipo!: TipoExtracto;

  @Prop()
  numeroReferencia?: string;

  @Prop({
    required: true,
    enum: EstadoExtracto,
    default: EstadoExtracto.PENDIENTE,
  })
  estado!: EstadoExtracto;

  @Prop({ type: Types.ObjectId, ref: 'Transaccion' })
  transaccionVinculada?: Types.ObjectId;
}

export const ExtractoMovimientoSchema =
  SchemaFactory.createForClass(ExtractoMovimiento);
