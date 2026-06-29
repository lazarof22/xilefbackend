export enum TipoAnticipo {
  VIATICO = 'viatico',
  ANTICIPO_SUELDO = 'anticipo_sueldo',
  ANTICIPO_PROVEEDOR = 'anticipo_proveedor',
  OTRO = 'otro',
}

export enum EstadoAnticipo {
  ENTREGADO = 'entregado',
  PARCIALMENTE_LIQUIDADO = 'parcialmente_liquidado',
  LIQUIDADO = 'liquidado',
  CANCELADO = 'cancelado',
}

export enum ResultadoLiquidacion {
  SOBRANTE = 'sobrante',
  EXACTO = 'exacto',
  FALTANTE = 'faltante',
}

export enum EstadoLiquidacion {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

export interface GastoItem {
  descripcion: string;
  monto: number;
  categoria: any;
  fecha: Date;
}

export interface ResumenAnticiposViaticos {
  totalAnticipos: number;
  montoTotalEntregado: number;
  montoTotalLiquidado: number;
  montoPendienteLiquidar: number;
  cantidadPendientes: number;
  cantidadLiquidados: number;
}
