import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AsientoDocument = HydratedDocument<Asiento>;

@Schema({ timestamps: true })
export class Asiento {
  @Prop({ required: true })
  fecha!: Date;

  @Prop({ required: true })
  numero!: string;

  @Prop({ required: true })
  concepto!: string;

  @Prop({ required: true })
  cuenta!: string;

  @Prop({ required: true, default: 0 })
  debe!: number;

  @Prop({ required: true, default: 0 })
  haber!: number;
}

export const AsientoSchema = SchemaFactory.createForClass(Asiento);
