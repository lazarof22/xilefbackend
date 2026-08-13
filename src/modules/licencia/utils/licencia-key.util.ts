import * as crypto from 'crypto';
import { LICENCIA_PREFIX } from '../constants/licencia.constants';

/**
 * SHA-256 hex de un string. Equivalente a `generateSHA256Hash` del crypto
 * service, pero puro y sin DI para poder compartirse con la CLI de firma.
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Genera la clave de activación con formato `XILEF-XXXX-XXXX-XXXX-XXXX`
 * a partir de empresa|tipo|fecha_vencimiento|random. Puro y sin DI.
 *
 * `randomHex` opcional solo para determinismo en tests / CLI; en producción se
 * usa `crypto.randomBytes(8)`.
 */
export function generateLicenciaKey(
  empresaId: string,
  tipo: string,
  fechaVencimiento: Date,
  randomHex?: string,
): string {
  const randomPart = randomHex ?? crypto.randomBytes(8).toString('hex');
  const data = `${empresaId}|${tipo}|${fechaVencimiento.toISOString()}|${randomPart}`;
  const hash = sha256(data).substring(0, 16).toUpperCase();
  const parts = hash.match(/.{1,4}/g) as RegExpMatchArray;
  return `${LICENCIA_PREFIX}-${parts.join('-')}`;
}
