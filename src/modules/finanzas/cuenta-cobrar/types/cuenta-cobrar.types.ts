import { Types } from 'mongoose';

export enum EstadoCxC {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADA = 'pagada',
  VENCIDA = 'vencida',
  CASTIGADA = 'castigada',
}

export interface CxCExport {
  codigo: string;
  cliente: Types.ObjectId | Record<string, unknown>;
  concepto: Types.ObjectId | Record<string, unknown>;
  montoOriginal: number;
  saldoPendiente: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
  diasVencido: number;
  estado: EstadoCxC;
  notas?: string;
}

export interface EnvejecimientoCxC {
  rango: string;
  cantidad: number;
  montoTotal: number;
  porcentaje: number;
}

export interface AbonoDto {
  monto: number;
  fechaPago?: string;
  referencia?: string;
}
