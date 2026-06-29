import { Types } from 'mongoose';

export enum EstadoCxP {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADA = 'pagada',
  VENCIDA = 'vencida',
  CASTIGADA = 'castigada',
}

export interface CxPExport {
  codigo: string;
  proveedor: Types.ObjectId | Record<string, unknown>;
  concepto: Types.ObjectId | Record<string, unknown>;
  montoOriginal: number;
  saldoPendiente: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
  estado: EstadoCxP;
  notas?: string;
}

export interface EnvejecimientoCxP {
  rango: string;
  cantidad: number;
  montoTotal: number;
}
