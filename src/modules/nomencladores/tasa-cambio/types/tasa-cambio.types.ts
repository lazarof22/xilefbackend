export enum TipoTasa {
  OFICIAL = 'oficial',
  PARALELO = 'paralelo',
  CADECA = 'cadeca',
}

export interface ConversionResult {
  montoConvertido: number;
  tasa: number;
  fechaTasa: Date;
  monedaOrigen: string;
  monedaDestino: string;
}
