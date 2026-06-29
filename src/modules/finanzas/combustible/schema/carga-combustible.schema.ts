import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CargaCombustibleDocument = HydratedDocument<CargaCombustible>;

@Schema({ timestamps: true })
export class CargaCombustible {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'TarjetaCombustible',
    index: true,
  })
  tarjeta!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Vehiculo', index: true })
  vehiculo!: Types.ObjectId;

  @Prop({ required: true })
  fecha!: Date;

  @Prop({ required: true })
  litros!: number;

  @Prop({ required: true })
  monto!: number;

  @Prop({ required: true })
  precioPorLitro!: number;

  @Prop({ required: true })
  servicentro!: string;

  @Prop({ required: true })
  kilometraje!: number;
}

export const CargaCombustibleSchema =
  SchemaFactory.createForClass(CargaCombustible);
