import { Types } from 'mongoose';

export enum TipoTransaccion {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  CHEQUE = 'cheque',
  CREDITO = 'credito',
  OTRO = 'otro',
}

export interface TransaccionExport {
  codigo: string;
  tipo: TipoTransaccion;
  categoria: Types.ObjectId | Record<string, unknown>;
  monto: number;
  moneda: Types.ObjectId | Record<string, unknown>;
  fecha: Date;
  metodoPago: MetodoPago;
  referencia?: string;
  descripcion?: string;
  cuentaBancaria?: Types.ObjectId | Record<string, unknown>;
  cliente?: Types.ObjectId | Record<string, unknown>;
  proveedor?: Types.ObjectId | Record<string, unknown>;
}

export interface ResumenTransacciones {
  totalIngresos: number;
  totalEgresos: number;
  saldoNeto: number;
  cantidadIngresos: number;
  cantidadEgresos: number;
}
