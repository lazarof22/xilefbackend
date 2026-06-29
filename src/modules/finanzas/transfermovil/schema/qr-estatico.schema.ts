import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QrEstaticoDocument = HydratedDocument<QrEstatico>;

@Schema({ timestamps: true })
export class QrEstatico {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  telefono!: string;

  @Prop({ required: true })
  identificadorComerciante!: string;

  @Prop({ required: true })
  payload!: string;

  @Prop({ default: true })
  activo!: boolean;

  @Prop({ required: true })
  fechaGeneracion!: Date;
}

export const QrEstaticoSchema = SchemaFactory.createForClass(QrEstatico);
