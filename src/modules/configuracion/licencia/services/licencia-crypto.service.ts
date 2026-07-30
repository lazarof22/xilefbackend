import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class LicenciaCryptoService implements OnModuleInit {
  private readonly logger = new Logger(LicenciaCryptoService.name);
  private SECRET_KEY: Buffer | null = null;
  private SIGN_SECRET: string | null = null;
  private readonly AES_ALGORITHM = 'aes-256-gcm';
  private readonly HMAC_ALGORITHM = 'sha256';
  private readonly IV_LENGTH = 16;
  private readonly AUTH_TAG_LENGTH = 16;

  onModuleInit(): void {
    const key = process.env.LICENSE_SECRET_KEY;
    if (!key || key.length < 32) {
      throw new InternalServerErrorException(
        'LICENSE_SECRET_KEY debe estar definida en .env y tener al menos 32 caracteres',
      );
    }

    const saltB64 = process.env.LICENSE_SALT;
    if (!saltB64) {
      throw new InternalServerErrorException(
        'LICENSE_SALT no definida en .env. Generar con: openssl rand -base64 32',
      );
    }
    const salt = Buffer.from(saltB64, 'base64');
    if (salt.length < 32) {
      throw new InternalServerErrorException(
        'LICENSE_SALT debe ser base64 de al menos 32 bytes. Generar con: openssl rand -base64 32',
      );
    }

    const signSecret = process.env.LICENSE_SIGN_SECRET;
    if (!signSecret || signSecret.length < 32) {
      throw new InternalServerErrorException(
        'LICENSE_SIGN_SECRET no definida (o demasiado corta) en .env. Debe tener al menos 32 caracteres. Generar con: openssl rand -base64 32',
      );
    }

    this.SECRET_KEY = crypto.scryptSync(key, salt, 32);
    this.SIGN_SECRET = signSecret;
  }

  private getKeyMaterial(): { key: Buffer; sign: string } {
    if (!this.SECRET_KEY || !this.SIGN_SECRET) {
      // Fallback para escenarios de tests sin onModuleInit:
      // se inicializan perezosamente desde env vars (con warning silencioso).
      const key = process.env.LICENSE_SECRET_KEY;
      if (!key || key.length < 32) {
        throw new InternalServerErrorException(
          'LICENSE_SECRET_KEY no inicializada',
        );
      }
      const saltB64 = process.env.LICENSE_SALT;
      if (!saltB64) {
        throw new InternalServerErrorException('LICENSE_SALT no inicializada');
      }
      this.SECRET_KEY = crypto.scryptSync(
        key,
        Buffer.from(saltB64, 'base64'),
        32,
      );
      const signSecret = process.env.LICENSE_SIGN_SECRET;
      if (!signSecret || signSecret.length < 32) {
        throw new InternalServerErrorException(
          'LICENSE_SIGN_SECRET no inicializada (o demasiado corta)',
        );
      }
      this.SIGN_SECRET = signSecret;
    }
    return { key: this.SECRET_KEY, sign: this.SIGN_SECRET };
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
   * Verifica firma HMAC con comparación temporal-constante.
   * Valida longitud de buffers antes de timingSafeEqual (que requiere mismo
   * length). Acepta solo firmas hex de 64 chars (HMAC-SHA256).
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
   * Construye el payload canónico de integridad de una licencia (versión 1).
   *
   * Formato: `JSON.stringify` de un objeto con keys ordenadas ascendentemente
   * (sortKeys_ASC) y fechas normalizadas a ISO string UTC. La canonicalización
   * garantiza que dos ocurrencias del mismo estado generen el mismo string
   * sin importar el orden de inserción de propiedades.
   *
   * Campos firmados (v1):
   *   activa, empresa_id, fecha_inicio, fecha_vencimiento, hardware_id,
   *   max_usuarios, revocada, tipo
   *
   * Excluidos a propósito:
   *   firma_hmac, dias_restantes, ultima_verificacion*,
   *   ultima_verificacion_efectiva, skew_detectado, motivo_revocacion,
   *   metadata, version_firma, requiere_re_firma, *_at (timestamps mongoose).
   */
  buildIntegrityPayload(datos: {
    empresa_id: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
    max_usuarios?: number;
    hardware_id?: string;
    activa?: boolean;
    revocada?: boolean;
  }): string {
    const payload: Record<string, unknown> = {
      activa: datos.activa,
      empresa_id: datos.empresa_id,
      fecha_inicio: datos.fecha_inicio.toISOString(),
      fecha_vencimiento: datos.fecha_vencimiento.toISOString(),
      hardware_id: datos.hardware_id ?? '',
      max_usuarios: datos.max_usuarios ?? 0,
      revocada: datos.revocada ?? false,
      tipo: datos.tipo,
    };
    return this.canonicalStringify(payload);
  }

  /**
   * Payload legacy (versión 0) para back-compat con licencias existentes
   * que no tienen `version_firma` (undefined o 0). Formato pipe-separated.
   */
  buildLegacyIntegrityPayload(datos: {
    empresa_id: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
  }): string {
    return `${datos.empresa_id}|${datos.tipo}|${datos.fecha_inicio.toISOString()}|${datos.fecha_vencimiento.toISOString()}`;
  }

  /**
   * Returns true si el payload de la firma es el legacy (pipe) o el canónico.
   */
  buildPayloadForVersion(
    version: number | undefined,
    datos: {
      empresa_id: string;
      tipo: string;
      fecha_inicio: Date;
      fecha_vencimiento: Date;
      max_usuarios?: number;
      hardware_id?: string;
      activa?: boolean;
      revocada?: boolean;
    },
  ): string {
    if (version === undefined || version === 0) {
      return this.buildLegacyIntegrityPayload(datos);
    }
    return this.buildIntegrityPayload(datos);
  }

  private canonicalStringify(payload: Record<string, unknown>): string {
    const keys = Object.keys(payload).sort();
    const sorted: Record<string, unknown> = {};
    for (const k of keys) sorted[k] = payload[k];
    return JSON.stringify(sorted);
  }

  generateNonce(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
}
