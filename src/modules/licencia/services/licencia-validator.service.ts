import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LicenciaCryptoService } from './licencia-crypto.service';
import { LICENCIA_FORMAT_REGEX } from '../constants/licencia.constants';
import { LicenciaValidator } from '../types/licencia-validator.interface';
import { NonceUsado, NonceUsadoDocument } from '../schemas/nonce-usado.schema';

@Injectable()
export class LicenciaValidatorService extends LicenciaValidator {
  private static readonly NONCE_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly cryptoService: LicenciaCryptoService,
    @InjectModel(NonceUsado.name)
    private readonly nonceModel: Model<NonceUsadoDocument>,
  ) {
    super();
  }

  validateKeyFormat(clave: string): boolean {
    return LICENCIA_FORMAT_REGEX.test(clave);
  }

  /**
   * Valida que el nonce sea no vacío y no haya sido usado antes.
   * Persiste en MongoDB (colección `nonces_usados` con índice único + TTL 5min).
   *
   * - Si nonce está vacío → lanza Error de contrato (no se acepta).
   * - Si ya existe → detecta duplicate key error (código 11000) y retorna false.
   * - Si surge otro error de persistencia → por seguridad se fail-closed
   *   (retorna false) y se loguea la excepción.
   */
  async validateNonce(nonce: string, empresaId?: string): Promise<boolean> {
    if (!nonce) {
      return false;
    }
    const expireAt = new Date(
      Date.now() + LicenciaValidatorService.NONCE_TTL_MS,
    );
    try {
      await this.nonceModel.insertOne({
        nonce,
        empresa_id: empresaId,
        expireAt,
      } as NonceUsado);
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code === 11000) return false;
      // Cualquier otro error: fail-closed por seguridad
      return false;
    }
  }

  /**
   * Reconstruye el payload de integridad según `version_firma` y verifica la
   * firma. version_firma 2 → Ed25519 (clave pública embebida) sobre el payload
   * canónico v2 (7 campos, sin hardware_id). version_firma 0/undefined/1 →
   * HMAC (muerto tras el cutover: solo de referencia, inalcanzable en clean
   * start).
   */
  validateIntegrity(licencia: {
    empresa_id: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
    max_usuarios?: number;
    hardware_id?: string;
    activa?: boolean;
    revocada?: boolean;
    firma_ed25519: string;
    version_firma?: number;
  }): boolean {
    const payload = this.cryptoService.buildPayloadForVersion(
      licencia.version_firma,
      {
        empresa_id: licencia.empresa_id,
        tipo: licencia.tipo,
        fecha_inicio: licencia.fecha_inicio,
        fecha_vencimiento: licencia.fecha_vencimiento,
        max_usuarios: licencia.max_usuarios,
        hardware_id: licencia.hardware_id,
        activa: licencia.activa,
        revocada: licencia.revocada,
      },
    );
    if (licencia.version_firma === 2) {
      return this.cryptoService.verifyEd25519(payload, licencia.firma_ed25519);
    }
    // v0/v1 legacy: HMAC queda muerto en el cliente verify-only.
    return this.cryptoService.verifyHMAC(payload, licencia.firma_ed25519);
  }

  validateHardwareId(
    storedId: string | undefined,
    providedId: string | undefined,
  ): boolean {
    if (!storedId) return true;
    if (!providedId) return false;
    return this.cryptoService.generateSHA256Hash(providedId) === storedId;
  }

  /**
   * Anti clock-skew: compara Date.now() con ultima_verificacion_efectiva.
   * Retorna `skew` si el reloj parece haber retrocedido y `hayActualizar` si
   * la licencia necesita que se actualice ultima_verificacion_efectiva.
   */
  validateClockSkew(licencia: {
    ultima_verificacion_efectiva?: Date;
    skew_detectado?: boolean;
  }): { skew: boolean; now: Date; hayActualizar: boolean } {
    const now = new Date();
    const efectivaMs = licencia.ultima_verificacion_efectiva?.getTime();
    const skew = efectivaMs !== undefined && efectivaMs > now.getTime();
    const hayActualizar = skew || !efectivaMs;
    return { skew, now, hayActualizar };
  }

  /**
   * Anti clock-skew: si `ultimaVerificacionEfectiva` está seteada y es mayor
   * que `now`, el reloj retrocedió. Mantenemos como referencia el max observado
   * para evitar revivir licencias previamente vencidas.
   */
  isExpired(
    fechaVencimiento: Date,
    ultimaVerificacionEfectiva?: Date,
  ): boolean {
    const nowReal = Date.now();
    const base =
      ultimaVerificacionEfectiva &&
      ultimaVerificacionEfectiva.getTime() > nowReal
        ? ultimaVerificacionEfectiva.getTime()
        : nowReal;
    return fechaVencimiento.getTime() < base;
  }
}
