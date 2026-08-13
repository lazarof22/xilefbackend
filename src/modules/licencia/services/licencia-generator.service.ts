import { Injectable } from '@nestjs/common';

/**
 * Servicio residual del cliente: solo cálculos de fecha para el flujo de
 * verificación/estado. La generación de claves de activación y el cálculo de
 * duraciones se movieron a la CLI de firma de XILEF (PR3) y a los util puros
 * (`licencia-key.util.ts`).
 */
@Injectable()
export class LicenciaGeneratorService {
  calculateRemainingDays(fechaVencimiento: Date): number {
    const now = new Date();
    const diff = fechaVencimiento.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
