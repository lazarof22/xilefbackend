export enum EstadoPlanPago {
  PROGRAMADO = 'programado',
  CONFIRMADO = 'confirmado',
  EJECUTADO = 'ejecutado',
  CANCELADO = 'cancelado',
  REPROGRAMADO = 'reprogramado',
}

export interface PlanPagoExport {
  codigo: string;
  proveedor: any;
  montoProgramado: number;
  montoPagado: number;
  saldoProgramado: number;
  fechaProgramada: Date;
  estado: EstadoPlanPago;
}

export interface ProyeccionPagos {
  periodo: string;
  totalProgramado: number;
  cantidad: number;
}
