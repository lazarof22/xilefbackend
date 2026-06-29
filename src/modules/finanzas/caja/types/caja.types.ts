export enum TipoMovimientoCaja {
  APERTURA = 'apertura',
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
  CIERRE = 'cierre',
}

export enum ConceptoCaja {
  VENTAS_EFECTIVO = 'ventas_efectivo',
  PAGOS_MENORES = 'pagos_menores',
  VIATICOS = 'viaticos',
  COMBUSTIBLE = 'combustible',
  COMEDOR = 'comedor',
  FONDO_FIJO_REPOSICION = 'fondo_fijo_reposicion',
  ANTICIPO = 'anticipo',
  REEMBOLSO = 'reembolso',
  OTROS = 'otros',
}

export enum EstadoArqueo {
  PENDIENTE = 'pendiente',
  CUADRADO = 'cuadrado',
  DIFERENCIA = 'diferencia',
}

export enum TipoCuentaCaja {
  PRINCIPAL = 'principal',
  FONDO_FIJO = 'fondo_fijo',
  CHICA = 'chica',
  OTRA = 'otra',
}

export enum EstadoReposicion {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  EJECUTADA = 'ejecutada',
}
