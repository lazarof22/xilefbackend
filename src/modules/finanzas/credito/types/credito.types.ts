export enum TipoCredito {
  CAPITAL_TRABAJO = 'capital_trabajo',
  INVERSION = 'inversion',
}

export enum EstadoCredito {
  SOLICITADO = 'solicitado',
  APROBADO = 'aprobado',
  DESEMBOLSADO = 'desembolsado',
  EN_PAGO = 'en_pago',
  PAGADO = 'pagado',
  VENCIDO = 'vencido',
  CASTIGADO = 'castigado',
}

export enum ClasificacionRiesgo {
  NORMAL = 'normal',
  POTENCIAL = 'potencial',
  SUBESTANDAR = 'subestandar',
  DUDOSO = 'dudoso',
  PERDIDA = 'perdida',
}

export enum EstadoCuota {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADA = 'pagada',
  VENCIDA = 'vencida',
}
export enum MetodoAmortizacion {
  FRANCES = 'frances',
  ALEMAN = 'aleman',
}
export enum PeriodicidadCuota {
  MENSUAL = 'mensual',
  TRIMESTRAL = 'trimestral',
  SEMESTRAL = 'semestral',
  ANUAL = 'anual',
}
export interface CuotaCalculada {
  numero: number;
  fechaVencimiento: Date;
  capital: number;
  interes: number;
  cuotaTotal: number;
  saldoRestante: number;
}
export interface TablaAmortizacion {
  creditoId: string;
  metodo: MetodoAmortizacion;
  fechaInicio: Date;
  cuotas: CuotaCalculada[];
}
