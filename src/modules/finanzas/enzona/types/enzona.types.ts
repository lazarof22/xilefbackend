export enum EnzonaEvento {
  PAGO_EXITOSO = 'pago_exitoso',
  PAGO_RECHAZADO = 'pago_rechazado',
  PAGO_REEMBOLSADO = 'pago_reembolsado',
}

export interface EnzonaWebhookPayload {
  evento: EnzonaEvento;
  id_transaccion: string;
  referencia: string;
  monto: number;
  moneda: string;
  fecha: string;
  cliente_nombre?: string;
  cliente_identificador?: string;
  metadata?: Record<string, string>;
}

export interface EnzonaWebhookResponse {
  recibido: boolean;
  mensaje: string;
  transaccionCreada?: string;
  abonoAplicado?: string;
}
