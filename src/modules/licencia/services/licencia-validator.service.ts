import { Injectable } from '@nestjs/common';
import { LicenciaCryptoService } from './licencia-crypto.service';
import { LICENCIA_FORMAT_REGEX } from '../constants/licencia.constants';

interface NonceEntry {
  nonce: string;
  expiresAt: number;
}

@Injectable()
export class LicenciaValidatorService {
  private readonly usedNonces: Map<string, NonceEntry> = new Map();

  constructor(private readonly cryptoService: LicenciaCryptoService) {}

  validateKeyFormat(clave: string): boolean {
    return LICENCIA_FORMAT_REGEX.test(clave);
  }

  validateNonce(nonce: string): boolean {
    if (!nonce) return true;
    this.cleanExpiredNonces();
    if (this.usedNonces.has(nonce)) return false;
    this.usedNonces.set(nonce, {
      nonce,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return true;
  }

  validateIntegrity(licencia: {
    empresa_id: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
    firma_hmac: string;
  }): boolean {
    const payload = this.cryptoService.buildIntegrityPayload({
      empresa_id: licencia.empresa_id,
      tipo: licencia.tipo,
      fecha_inicio: licencia.fecha_inicio,
      fecha_vencimiento: licencia.fecha_vencimiento,
    });
    return this.cryptoService.verifyHMAC(payload, licencia.firma_hmac);
  }

  validateHardwareId(storedId: string | undefined, providedId: string | undefined): boolean {
    if (!storedId) return true;
    if (!providedId) return false;
    return this.cryptoService.generateSHA256Hash(providedId) === storedId;
  }

  isExpired(fechaVencimiento: Date): boolean {
    return fechaVencimiento < new Date();
  }

  private cleanExpiredNonces(): void {
    const now = Date.now();
    for (const [key, entry] of this.usedNonces) {
      if (entry.expiresAt < now) {
        this.usedNonces.delete(key);
      }
    }
  }
}
