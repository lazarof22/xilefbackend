import { Types } from 'mongoose';

export enum EstadoConciliacion {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  CONCILIADA = 'conciliada',
  DIFERENCIA = 'diferencia',
}

export interface ConciliacionExport {
  codigo: string;
  cuentaBancaria: Types.ObjectId | Record<string, unknown>;
  periodo: string;
  saldoBanco: number;
  saldoLibros: number;
  diferencia: number;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoConciliacion;
  observaciones?: string;
}

export interface DiferenciaConciliacion {
  tipo: 'falta_en_banco' | 'falta_en_libros' | 'diferencia_monto';
  referencia?: string;
  montoBanco: number;
  montoLibros: number;
  diferencia: number;
  descripcion?: string;
}
