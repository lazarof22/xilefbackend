import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { LicenciaCryptoService } from './licencia-crypto.service';
import {
  LICENCIA_PREFIX,
  LicenciaTipo,
} from '../constants/licencia.constants';

@Injectable()
export class LicenciaGeneratorService {
  constructor(private readonly cryptoService: LicenciaCryptoService) {}

  generateLicenciaKey(empresaId: string, tipo: LicenciaTipo, fechaVencimiento: Date): string {
    const randomPart = crypto.randomBytes(8).toString('hex');
    const data = `${empresaId}|${tipo}|${fechaVencimiento.toISOString()}|${randomPart}`;
    const hash = this.cryptoService
      .generateSHA256Hash(data)
      .substring(0, 16)
      .toUpperCase();
    const parts = hash.match(/.{1,4}/g) as RegExpMatchArray;
    return `${LICENCIA_PREFIX}-${parts.join('-')}`;
  }

  getDurationForType(tipo: LicenciaTipo, customDays?: number): number {
    if (customDays && customDays > 0) return customDays;
    switch (tipo) {
      case 'trial':
        return 30;
      case 'suscripcion_mensual':
        return 30;
      case 'suscripcion_anual':
        return 365;
      case 'perpetua':
        return 36500;
      default:
        return 30;
    }
  }

  calculateExpiryDate(tipo: LicenciaTipo, customDays?: number): Date {
    const days = this.getDurationForType(tipo, customDays);
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  calculateRemainingDays(fechaVencimiento: Date): number {
    const now = new Date();
    const diff = fechaVencimiento.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
