import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TipoCombustible } from '../types/combustible.types';

export type VehiculoDocument = HydratedDocument<Vehiculo>;

@Schema({ timestamps: true })
export class Vehiculo {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  placa!: string;

  @Prop({ required: true })
  marca!: string;

  @Prop({ required: true })
  modelo!: string;

  @Prop({ required: true, enum: TipoCombustible })
  tipoCombustible!: TipoCombustible;

  @Prop({ default: 0 })
  consumoPromedio!: number;
}

export const VehiculoSchema = SchemaFactory.createForClass(Vehiculo);
