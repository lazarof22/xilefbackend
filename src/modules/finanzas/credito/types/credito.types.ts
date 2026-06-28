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
