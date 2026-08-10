export enum TipoPeriodoFlujo {
  DIARIO = 'diario',
  SEMANAL = 'semanal',
  MENSUAL = 'mensual',
}

export enum EstadoFlujo {
  PROYECTADO = 'proyectado',
  EN_EJECUCION = 'en_ejecucion',
  CERRADO = 'cerrado',
  AJUSTADO = 'ajustado',
}

export interface ComparativaFlujo {
  proyectado: number;
  real: number;
  desviacion: number;
  desviacionPorcentaje: number;
}

export interface ResumenFlujo {
  periodo: string;
  saldoInicial: number;
  ingresos: number;
  egresos: number;
  flujoNeto: number;
  saldoFinal: number;
}
