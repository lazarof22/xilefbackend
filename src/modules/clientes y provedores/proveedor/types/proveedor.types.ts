export enum EstadoProveedor {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
  EVALUACION = 'evaluacion',
}

export enum CondicionPago {
  CONTADO = 'contado',
  QUINCE_DIAS = '15_dias',
  TREINTA_DIAS = '30_dias',
  CUARENTA_CINCO_DIAS = '45_dias',
  SESENTA_DIAS = '60_dias',
  NOVENTA_DIAS = '90_dias',
}

export interface ProveedorExport {
  codigo: string;
  nombre: string;
  nit: string;
  codigoREU: string;
  empresa: Record<string, unknown>;
  tipo: string;
  estado: EstadoProveedor;
  calificacion: number;
}
