export enum EstadoTransfermovil {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  RECHAZADO = 'rechazado',
  REEMBOLSO = 'reembolso',
}

export enum TransfermovilEvento {
  PAGO_CONFIRMADO = 'pago_confirmado',
  PAGO_RECHAZADO = 'pago_rechazado',
  REEMBOLSO = 'reembolso',
}

export interface TransfermovilWebhookPayload {
  evento: TransfermovilEvento;
  id_operacion: string;
  monto: number;
  moneda: string;
  fecha: string;
  telefono?: string;
  identificador_cliente?: string;
  referencia?: string;
  metadata?: Record<string, string>;
}

export interface TransfermovilWebhookResponse {
  recibido: boolean;
  mensaje: string;
  transaccionCreada?: string;
  abonoAplicado?: string;
}

export interface QrDinamicoPayload {
  telefono: string;
  monto: number;
  referencia: string;
  empresaId: string;
  vencimiento: string;
  hash: string;
}
