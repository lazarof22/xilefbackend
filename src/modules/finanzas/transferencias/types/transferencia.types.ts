import { Types } from 'mongoose';

export enum TipoTransferencia {
  BANCO_BANCO = 'banco_banco',
  BANCO_CAJA = 'banco_caja',
  CAJA_BANCO = 'caja_banco',
  CAJA_CAJA = 'caja_caja',
  OTRA = 'otra',
}

export enum TipoCuentaRef {
  BANCO = 'banco',
  CAJA = 'caja',
}

export enum EstadoTransferencia {
  PENDIENTE = 'pendiente',
  APLICADA = 'aplicada',
  RECHAZADA = 'rechazada',
  ANULADA = 'anulada',
}

export interface TransferenciaExport {
  codigo: string;
  tipo: TipoTransferencia;
  origen: Types.ObjectId | Record<string, unknown>;
  destino: Types.ObjectId | Record<string, unknown>;
  monto: number;
  moneda: Types.ObjectId | Record<string, unknown>;
  estado: EstadoTransferencia;
  fecha: Date;
}

export interface ResumenTransferencias {
  totalTransferencias: number;
  totalMonto: number;
  porTipo: Record<string, { cantidad: number; monto: number }>;
  porEstado: Record<string, { cantidad: number; monto: number }>;
}
