import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExtraccionDocument = HydratedDocument<Extraccion>;

@Schema({ timestamps: true })
export class Extraccion {
  @Prop({ required: true })
  monto!: number;

  @Prop({ required: true })
  causa!: string;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop()
  responsable?: string;

  @Prop({ type: Types.ObjectId, ref: 'Empleado' })
  empleadoId?: Types.ObjectId;
}

export const ExtraccionSchema = SchemaFactory.createForClass(Extraccion);
