export enum TipoOperacionFinanciera {
  ARIE = 'arie',
  SEGURIDAD_SOCIAL = 'seguridad_social',
  ONAT = 'onat',
  OTRO = 'otro',
}

export enum EstadoOperacion {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADA = 'pagada',
  VENCIDA = 'vencida',
  ANULADA = 'anulada',
}

export interface OperacionFinancieraExport {
  codigo: string;
  tipo: TipoOperacionFinanciera;
  periodo: string;
  monto: number;
  montoPagado: number;
  saldoPendiente: number;
  fechaLimite: Date;
  estado: EstadoOperacion;
}
