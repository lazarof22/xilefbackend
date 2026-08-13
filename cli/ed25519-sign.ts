import * as crypto from 'crypto';
import * as fs from 'fs';

/**
 * Helpers criptográficos de la CLI de firma de XILEF (Ed25519).
 *
 * Este módulo vive en `cli/` (fuera de `src/`) y SOLO lo usa la herramienta de
 * firma que corre en la máquina de XILEF. El backend cliente (verify-only)
 * NUNCA importa este archivo: aquí reside la clave privada.
 *
 * Sin DI ni dependencias de NestJS: puro `node:crypto`.
 */

export interface Ed25519Keypair {
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;
}

/** Prefijo X.509 SPKI fijo de una clave pública Ed25519 (RFC 8032). */
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

/**
 * Genera un keypair Ed25519 con la API nativa de Node.
 * `crypto.generateKeyPairSync('ed25519')` retorna:
 *   - publicKey: KeyObject SPKI (DER de 44 bytes: 12 de prefijo + 32 crudos).
 *   - privateKey: KeyObject PKCS#8 (la clave privada, 32 bytes).
 */
export function generateEd25519Keypair(): Ed25519Keypair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  return { publicKey, privateKey };
}

/**
 * Serializa una clave privada a PEM PKCS#8. Este es el formato que el operador
 * resguarda en disco (fuera del repo) y que `loadPrivateKeyFromPem` recarga.
 */
export function privateKeyToPkcs8Pem(privateKey: crypto.KeyObject): string {
  return privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
}

/**
 * Exporta la clave pública Ed25519 como raw base64 (los 32 bytes crudos).
 * Es el formato embebido en el backend cliente como `LICENCIA_ED25519_PUBLIC_KEY`.
 */
export function publicKeyToRawBase64(publicKey: crypto.KeyObject): string {
  const jwk = publicKey.export({ format: 'jwk' }) as { x?: string };
  if (!jwk.x) {
    throw new Error('No se pudo extraer la clave pública Ed25519 (JWK x)');
  }
  // `jwk.x` es base64url de los 32 bytes crudos; lo convertimos a base64 estándar.
  return Buffer.from(jwk.x, 'base64url').toString('base64');
}

/**
 * Reconstruye una `KeyObject` pública Ed25519 a partir de raw base64 (32 bytes).
 * Antepone el prefijo SPKI fijo y carga con `crypto.createPublicKey`.
 */
export function publicKeyFromRawBase64(rawBase64: string): crypto.KeyObject {
  const raw = Buffer.from(rawBase64, 'base64');
  if (raw.length !== 32) {
    throw new Error(
      'Clave pública Ed25519 inválida: debe ser raw base64 de 32 bytes',
    );
  }
  return crypto.createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, raw]),
    format: 'der',
    type: 'spki',
  });
}

/**
 * Carga una clave privada Ed25519 desde su PEM PKCS#8 en memoria.
 */
export function loadPrivateKeyFromPem(pem: string): crypto.KeyObject {
  return crypto.createPrivateKey(pem);
}

/**
 * Carga la clave privada Ed25519 desde un archivo PEM PKCS#8.
 * El archivo vive SOLO en la máquina de XILEF (nunca en el repo).
 */
export function loadPrivateKeyFromPath(path: string): crypto.KeyObject {
  const pem = fs.readFileSync(path, 'utf8');
  return loadPrivateKeyFromPem(pem);
}

/**
 * Firma `payload` con Ed25519 usando la clave privada.
 * Retorna la firma como hex (128 caracteres = 64 bytes).
 *
 * `crypto.sign(null, data, privateKey)`: el `null` indica que el algoritmo ya
 * está implícito en la key. Ed25519 es determinista (sin nonce aleatorio),
 * por lo que la misma clave + payload producen siempre la misma firma.
 */
export function signEd25519(
  payload: string,
  privateKey: crypto.KeyObject,
): string {
  return crypto
    .sign(null, Buffer.from(payload, 'utf8'), privateKey)
    .toString('hex');
}
