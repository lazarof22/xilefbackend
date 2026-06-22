import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class LicenciaCryptoService {
  private readonly SECRET_KEY: Buffer;
  private readonly SIGN_SECRET: string;
  private readonly AES_ALGORITHM = 'aes-256-gcm';
  private readonly HMAC_ALGORITHM = 'sha256';
  private readonly IV_LENGTH = 16;
  private readonly AUTH_TAG_LENGTH = 16;

  constructor() {
    const key = process.env.LICENSE_SECRET_KEY;
    if (!key || key.length < 32) {
      throw new Error(
        'LICENSE_SECRET_KEY debe tener al menos 32 caracteres y estar definida en .env',
      );
    }
    this.SECRET_KEY = crypto.scryptSync(key, 'xilef-license-salt', 32);
    this.SIGN_SECRET = process.env.LICENSE_SIGN_SECRET || key;
    if (!process.env.LICENSE_SIGN_SECRET) {
      console.warn(
        'LICENSE_SIGN_SECRET no definida, usando LICENSE_SECRET_KEY como fallback',
      );
    }
  }

  encryptAES256GCM(plaintext: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      this.AES_ALGORITHM,
      this.SECRET_KEY,
      iv,
      { authTagLength: this.AUTH_TAG_LENGTH },
    );
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]).toString(
      'base64',
    );
  }

  decryptAES256GCM(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const iv = buffer.subarray(0, this.IV_LENGTH);
    const authTag = buffer.subarray(
      this.IV_LENGTH,
      this.IV_LENGTH + this.AUTH_TAG_LENGTH,
    );
    const encrypted = buffer.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(
      this.AES_ALGORITHM,
      this.SECRET_KEY,
      iv,
      { authTagLength: this.AUTH_TAG_LENGTH },
    );
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateSHA256Hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  signHMAC(payload: string): string {
    return crypto
      .createHmac(this.HMAC_ALGORITHM, this.SIGN_SECRET)
      .update(payload)
      .digest('hex');
  }

  verifyHMAC(payload: string, signature: string): boolean {
    const expected = this.signHMAC(payload);
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  buildIntegrityPayload(datos: {
    empresa_id: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
  }): string {
    return `${datos.empresa_id}|${datos.tipo}|${datos.fecha_inicio.toISOString()}|${datos.fecha_vencimiento.toISOString()}`;
  }

  generateNonce(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
}
