import { LicenciaIntegrityData } from './licencia.types';

export abstract class LicenciaValidator {
  abstract validateKeyFormat(clave: string): boolean;

  /**
   * Valida nonce anti-replay. Async porque persiste en MongoDB.
   * Retorna false si el nonce ya fue usado (duplicate key) o está vacío.
   */
  abstract validateNonce(nonce: string, empresaId?: string): Promise<boolean>;

  abstract validateIntegrity(
    licencia: LicenciaIntegrityData & {
      firma_hmac: string;
      version_firma?: number;
      max_usuarios?: number;
      hardware_id?: string;
      activa?: boolean;
      revocada?: boolean;
    },
  ): boolean;

  abstract validateHardwareId(
    storedId: string | undefined,
    providedId: string | undefined,
  ): boolean;

  /**
   * Anti clock-skew: si `ultimaVerificacionEfectiva` > Date.now() significa
   * que el reloj retrocedió. En ese caso se usa esa fecha como referencia
   * para no revivir licencias previamente vencidas.
   */
  abstract isExpired(
    fechaVencimiento: Date,
    ultimaVerificacionEfectiva?: Date,
  ): boolean;
}
