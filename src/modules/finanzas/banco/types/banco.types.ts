import { Types } from 'mongoose';

export enum TipoCuentaBancaria {
  CORRIENTE = 'corriente',
  AHORRO = 'ahorro',
  MLC = 'mlc',
}

export enum EstadoCuentaBancaria {
  ACTIVA = 'activa',
  CONGELADA = 'congelada',
  CERRADA = 'cerrada',
}

export interface BancoExport {
  codigoBanco: string;
  nombreBanco: string;
  numeroCuenta: string;
  tipoCuenta: TipoCuentaBancaria;
  moneda: Types.ObjectId | Record<string, unknown>;
  saldoInicial: number;
  saldoActual: number;
  fechaApertura: Date;
  titular: string;
  activo: boolean;
}

export interface SaldoResponse {
  cuentaId: string;
  numeroCuenta: string;
  nombreBanco: string;
  tipoCuenta: TipoCuentaBancaria;
  saldoActual: number;
}
