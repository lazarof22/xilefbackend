import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum NaturalezaCuenta {
  DEUDORA = 'Deudora',
  ACREDORA = 'Acreedora',
}

export type CuentaDocument = HydratedDocument<Cuenta>;

@Schema({ timestamps: true })
export class Cuenta {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true, enum: NaturalezaCuenta })
  naturaleza!: NaturalezaCuenta;

  @Prop({ type: Types.ObjectId, ref: 'Cuenta', default: null })
  padre?: Types.ObjectId | null;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  moneda!: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  nivel!: number;
}

export const CuentaSchema = SchemaFactory.createForClass(Cuenta);
