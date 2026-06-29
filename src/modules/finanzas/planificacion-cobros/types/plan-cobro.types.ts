import { Types } from 'mongoose';

export enum EstadoPlanCobro {
  PROGRAMADO = 'programado',
  CONFIRMADO = 'confirmado',
  COBRADO = 'cobrado',
  CANCELADO = 'cancelado',
  REPROGRAMADO = 'reprogramado',
}

export interface PlanCobroExport {
  codigo: string;
  cliente: Types.ObjectId | Record<string, unknown>;
  montoProgramado: number;
  montoCobrado: number;
  saldoProgramado: number;
  fechaProgramada: Date;
  estado: EstadoPlanCobro;
}

export interface ProyeccionCobros {
  periodo: string;
  totalProgramado: number;
  cantidad: number;
  probabilidadPromedio: number;
}
