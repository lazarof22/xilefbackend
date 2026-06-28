import { Types } from 'mongoose';

export enum EstadoTarjeta {
  ACTIVA = 'activa',
  BLOQUEADA = 'bloqueada',
  PERDIDA = 'perdida',
  CANCELADA = 'cancelada',
}

export enum TipoCombustible {
  REGULAR = 'regular',
  ESPECIAL = 'especial',
  DIESEL = 'diesel',
}
