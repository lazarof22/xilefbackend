import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoCuentaBancaria, EstadoCuentaBancaria } from '../types/banco.types';

export type BancoDocument = HydratedDocument<Banco>;

@Schema({ timestamps: true })
export class Banco {
  @Prop({ required: true, unique: true })
  codigoBanco!: string;

  @Prop({ required: true })
  nombreBanco!: string;

  @Prop({ required: true, unique: true })
  numeroCuenta!: string;

  @Prop({ required: true, enum: TipoCuentaBancaria })
  tipoCuenta!: TipoCuentaBancaria;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  moneda!: Types.ObjectId;

  @Prop({ default: 0 })
  saldoInicial!: number;

  @Prop({ default: 0 })
  saldoActual!: number;

  @Prop({ required: true })
  fechaApertura!: Date;

  @Prop({ required: true })
  titular!: string;

  @Prop({ default: true })
  activo!: boolean;
}

export const Bancochema = SchemaFactory.createForClass(Banco);
