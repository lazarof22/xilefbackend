import { LicenciaIntegrityData } from './licencia.types';

export abstract class LicenciaValidator {
  abstract validateKeyFormat(clave: string): boolean;

  abstract validateNonce(nonce: string): boolean;

  abstract validateIntegrity(
    licencia: LicenciaIntegrityData & { firma_hmac: string },
  ): boolean;

  abstract validateHardwareId(
    storedId: string | undefined,
    providedId: string | undefined,
  ): boolean;

  abstract isExpired(fechaVencimiento: Date): boolean;
}
