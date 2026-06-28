import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoTarjeta } from '../types/combustible.types';

export type TarjetaCombustibleDocument = HydratedDocument<TarjetaCombustible>;

@Schema({ timestamps: true })
export class TarjetaCombustible {
  @Prop({ required: true, unique: true })
  numeroTarjeta!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Vehiculo', index: true })
  vehiculo!: Types.ObjectId;

  @Prop({ required: true, enum: EstadoTarjeta, default: EstadoTarjeta.ACTIVA })
  estado!: EstadoTarjeta;
}

export const TarjetaCombustibleSchema = SchemaFactory.createForClass(TarjetaCombustible);
