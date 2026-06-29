import { Types } from 'mongoose';

export enum EstadoCambio {
  PENDIENTE = 'pendiente',
  EJECUTADA = 'ejecutada',
  ANULADA = 'anulada',
}

export interface CambioDivisaExport {
  codigo: string;
  monedaOrigen: Types.ObjectId | Record<string, unknown>;
  monedaDestino: Types.ObjectId | Record<string, unknown>;
  montoOrigen: number;
  montoDestino: number;
  tasaAplicada: number;
  tipoTasa: string;
  fecha: Date;
  cuentaOrigen?: Types.ObjectId | Record<string, unknown>;
  cuentaDestino?: Types.ObjectId | Record<string, unknown>;
  cajaOrigen?: Types.ObjectId | Record<string, unknown>;
  cajaDestino?: Types.ObjectId | Record<string, unknown>;
  estado: string;
  comprobante?: string;
  descripcion?: string;
}
