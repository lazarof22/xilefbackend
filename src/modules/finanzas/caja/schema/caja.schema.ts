import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoMovimientoCaja, ConceptoCaja } from '../types/caja.types';

export type MovimientoCajaDocument = HydratedDocument<MovimientoCaja>;

@Schema({ timestamps: true })
export class MovimientoCaja {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja', index: true })
  cajaId?: Types.ObjectId;

  @Prop({ required: true, enum: TipoMovimientoCaja, index: true })
  tipo!: TipoMovimientoCaja;

  @Prop({ required: true, enum: ConceptoCaja })
  concepto!: ConceptoCaja;

  @Prop({ required: true })
  descripcion!: string;

  @Prop({ required: true })
  monto!: number;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop()
  referencia?: string;

  @Prop()
  responsable?: string;
}

export const MovimientoCajaSchema =
  SchemaFactory.createForClass(MovimientoCaja);
