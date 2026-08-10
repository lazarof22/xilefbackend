import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoProveedor, CondicionPago } from '../types/proveedor.types';

export type ProveedorDocument = HydratedDocument<Proveedor>;

@Schema({ timestamps: true })
export class Proveedor {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true, unique: true })
  nit!: string;

  @Prop({ required: true, unique: true })
  codigoREU!: string;

  @Prop({ type: Types.ObjectId, ref: 'Empresa', required: true, index: true })
  empresa!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoProveedor', required: true })
  tipo!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Categoria', default: [] })
  categoriasProducto?: Types.ObjectId[];

  @Prop({ required: true, enum: CondicionPago, default: CondicionPago.CONTADO })
  condicionPago!: CondicionPago;

  @Prop({ type: Types.ObjectId, ref: 'Moneda' })
  monedaPreferida?: Types.ObjectId;

  @Prop({ min: 0, max: 100, default: 0 })
  descuentoHabitual?: number;

  @Prop()
  cuentaBancariaMLC?: string;

  @Prop()
  cuentaBancariaCUP?: string;

  @Prop({
    required: true,
    enum: EstadoProveedor,
    default: EstadoProveedor.ACTIVO,
    index: true,
  })
  estado!: EstadoProveedor;

  @Prop({ min: 0, max: 5, default: 3 })
  calificacion?: number;

  @Prop()
  contactoNombre?: string;

  @Prop()
  contactoTelefono?: string;

  @Prop()
  contactoEmail?: string;

  @Prop()
  contratoVigente?: string;

  @Prop()
  fechaVencimientoContrato?: Date;

  @Prop({ type: Types.ObjectId, ref: 'TipoContrato' })
  tipoContrato?: Types.ObjectId;

  @Prop()
  notas?: string;
}

export const ProveedorSchema = SchemaFactory.createForClass(Proveedor);
