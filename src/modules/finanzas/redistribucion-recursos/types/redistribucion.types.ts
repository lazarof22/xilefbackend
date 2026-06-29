import { Types } from 'mongoose';

export enum EstadoRedistribucion {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  EJECUTADA = 'ejecutada',
  ANULADA = 'anulada',
}

export interface RedistribucionItem {
  tipo: 'banco' | 'caja';
  cuentaId: Types.ObjectId;
  monto: number;
  accion: 'ORIGEN' | 'DESTINO';
}
