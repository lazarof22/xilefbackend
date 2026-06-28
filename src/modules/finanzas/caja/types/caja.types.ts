import { Types } from 'mongoose';

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
  OTROS = 'otros',
}

export enum EstadoArqueo {
  PENDIENTE = 'pendiente',
  CUADRADO = 'cuadrado',
  DIFERENCIA = 'diferencia',
}
