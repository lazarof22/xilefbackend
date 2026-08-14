import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  buildEd25519Payload as buildEd25519PayloadFromBuilder,
  buildIntegrityPayload as buildIntegrityPayloadFromBuilder,
  buildLegacyIntegrityPayload as buildLegacyIntegrityPayloadFromBuilder,
  buildPayloadForVersion as buildPayloadForVersionFromBuilder,
  LicenciaPayloadFields,
} from './payload-builder';
import { LICENCIA_ED25519_PUBLIC_KEY } from '../constants/licencia.constants';

/**
 * Prefijo X.509 SPKI fijo de una clave pública Ed25519 (RFC 8032). Antepuesto a
 * los 32 bytes crudos de la clave reconstruye el DER completo para cargar con
 * `crypto.createPublicKey({ format: 'der', type: 'spki' })`.
 */
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

const ED25519_SIGNATURE_HEX = /^[0-9a-f]{128}$/i;

/**
 * Servicio criptográfico del cliente — VERIFY-ONLY.
 *
 * Tras el cutover asimétrico el backend cliente NO firma: la clave privada
 * Ed25519 vive únicamente en la máquina de XILEF. Este servicio solo expone la
 * verificación Ed25519 (clave pública embebida) y el hash SHA-256.
 *
 * Los métodos de firma HMAC / cifrado AES se conservan por ahora (limpieza
 * diferida) pero son inalcanzables: `getKeyMaterial` lanza, de modo que no
 * existe ruta de falsificación en el cliente.
 */
@Injectable()
export class LicenciaCryptoService implements OnModuleInit {
  private readonly logger = new Logger(LicenciaCryptoService.name);
  private readonly AES_ALGORITHM = 'aes-256-gcm';
  private readonly HMAC_ALGORITHM = 'sha256';
  private readonly IV_LENGTH = 16;
  private readonly AUTH_TAG_LENGTH = 16;
  private publicKey: crypto.KeyObject | null = null;

  onModuleInit(): void {
    // El cliente es verify-only: no requiere secretos en .env. Sin gates.
  }

  private getKeyMaterial(): { key: Buffer; sign: string } {
    throw new InternalServerErrorException(
      'El backend cliente es verify-only: no posee material de firma. ' +
        'La firma (Ed25519) se realiza únicamente en la CLI de XILEF.',
    );
  }

  encryptAES256GCM(plaintext: string): string {
    const { key } = this.getKeyMaterial();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.AES_ALGORITHM, key, iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]).toString(
      'base64',
    );
  }

  decryptAES256GCM(encryptedData: string): string {
    const { key } = this.getKeyMaterial();
    const buffer = Buffer.from(encryptedData, 'base64');
    const iv = buffer.subarray(0, this.IV_LENGTH);
    const authTag = buffer.subarray(
      this.IV_LENGTH,
      this.IV_LENGTH + this.AUTH_TAG_LENGTH,
    );
    const encrypted = buffer.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(this.AES_ALGORITHM, key, iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateSHA256Hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  signHMAC(payload: string): string {
    const { sign } = this.getKeyMaterial();
    return crypto
      .createHmac(this.HMAC_ALGORITHM, sign)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verifica firma HMAC con comparación temporal-constante. Muerto tras el
   * cutover: `signHMAC` (y por tanto `getKeyMaterial`) lanza.
   */
  verifyHMAC(payload: string, signature: string): boolean {
    if (!signature || typeof signature !== 'string') return false;
    const expected = this.signHMAC(payload);
    const expectedBuf = Buffer.from(expected, 'hex');
    let sigBuf: Buffer;
    try {
      sigBuf = Buffer.from(signature, 'hex');
    } catch {
      return false;
    }
    if (expectedBuf.length !== sigBuf.length) return false;
    try {
      return crypto.timingSafeEqual(expectedBuf, sigBuf);
    } catch {
      return false;
    }
  }

  /**
   * Verifica una firma Ed25519 sobre `payload` con la clave pública embebida de
   * XILEF. La firma debe ser hex de 128 caracteres (64 bytes). Cualquier firma
   * malformada o falsa retorna `false` sin lanzar.
   */
  verifyEd25519(payload: string, signature: string): boolean {
    if (!signature || typeof signature !== 'string') return false;
    if (!ED25519_SIGNATURE_HEX.test(signature)) return false;
    try {
      return crypto.verify(
        null,
        Buffer.from(payload, 'utf8'),
        this.getPublicKey(),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  /**
   * Construye el payload canónico de integridad de una licencia (versión 1,
   * 8 campos con `hardware_id`). Solo de referencia: el flujo v1 (HMAC) queda
   * inalcanzable tras el cutover. Delegado en `payload-builder`.
   */
  buildIntegrityPayload(datos: LicenciaPayloadFields): string {
    return buildIntegrityPayloadFromBuilder(datos);
  }

  /**
   * Payload legacy (versión 0) para back-compat con licencias existentes.
   * Formato pipe-separated. Delegado en `payload-builder`.
   */
  buildLegacyIntegrityPayload(datos: {
    empresa_id: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
  }): string {
    return buildLegacyIntegrityPayloadFromBuilder(datos);
  }

  /**
   * Payload canónico versión 2 (7 campos, SIN `hardware_id`), firmado por XILEF
   * con Ed25519. Delegado en `payload-builder`.
   */
  buildEd25519Payload(
    datos: Omit<LicenciaPayloadFields, 'hardware_id'>,
  ): string {
    return buildEd25519PayloadFromBuilder(datos);
  }

  /**
   * Despacha según `version_firma`: v0/undefined → legacy, v1 → canónico v1,
   * v2 → canónico v2 (Ed25519). Delegado en `payload-builder`.
   */
  buildPayloadForVersion(
    version: number | undefined,
    datos: LicenciaPayloadFields,
  ): string {
    return buildPayloadForVersionFromBuilder(version, datos);
  }

  generateNonce(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private getPublicKey(): crypto.KeyObject {
    if (!this.publicKey) {
      // La clave pública puede sobrescribirse vía env (LICENCIA_ED25519_PUBLIC_KEY)
      // para permitir pruebas e2e autocontenidas y despliegues configurables.
      // El default sigue siendo la constante embebida. En ambos casos el cliente
      // SOLO verifica (nunca firma).
      const rawB64 =
        process.env.LICENCIA_ED25519_PUBLIC_KEY ?? LICENCIA_ED25519_PUBLIC_KEY;
      const raw = Buffer.from(rawB64, 'base64');
      this.publicKey = crypto.createPublicKey({
        key: Buffer.concat([ED25519_SPKI_PREFIX, raw]),
        format: 'der',
        type: 'spki',
      });
    }
    return this.publicKey;
  }
}
