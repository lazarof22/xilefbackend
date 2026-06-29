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

export enum TipoOperacionCambio {
  COMPRA_DIVISA = 'compra_divisa',
  VENTA_DIVISA = 'venta_divisa',
  CONTRAVALOR = 'contravalor',
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
  tipoCambio?: number;
  monedaOrigen?: Types.ObjectId | Record<string, unknown>;
  tipoOperacionCambio?: TipoOperacionCambio;
}

export interface ResumenTransacciones {
  totalIngresos: number;
  totalEgresos: number;
  saldoNeto: number;
  cantidadIngresos: number;
  cantidadEgresos: number;
}
