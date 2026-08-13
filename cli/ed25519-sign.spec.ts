import * as crypto from 'crypto';
import {
  generateEd25519Keypair,
  privateKeyToPkcs8Pem,
  publicKeyToRawBase64,
  loadPrivateKeyFromPem,
  signEd25519,
} from './ed25519-sign';

/**
 * Prefijo X.509 SPKI fijo de una clave pública Ed25519 (RFC 8032). Antepuesto a
 * los 32 bytes crudos de la clave reconstruye el DER completo para cargar con
 * `crypto.createPublicKey({ format: 'der', type: 'spki' })`.
 */
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

describe('ed25519-sign (CLI de firma de XILEF)', () => {
  describe('signEd25519', () => {
    it('produce una firma hex de 128 caracteres (64 bytes)', () => {
      const { privateKey } = generateEd25519Keypair();
      const signature = signEd25519('payload-de-prueba', privateKey);
      expect(signature).toMatch(/^[0-9a-f]{128}$/i);
    });

    it('la firma verifica con la clave pública correspondiente', () => {
      const { publicKey, privateKey } = generateEd25519Keypair();
      const payload = '{"empresa_id":"1"}';
      const signature = signEd25519(payload, privateKey);
      const ok = crypto.verify(
        null,
        Buffer.from(payload, 'utf8'),
        publicKey,
        Buffer.from(signature, 'hex'),
      );
      expect(ok).toBe(true);
    });

    it('es determinista: dos firmas del mismo payload son idénticas', () => {
      const { privateKey } = generateEd25519Keypair();
      const payload = 'mismo-payload';
      const a = signEd25519(payload, privateKey);
      const b = signEd25519(payload, privateKey);
      expect(a).toBe(b);
    });

    it('rechaza la verificación con una clave pública distinta', () => {
      const { privateKey } = generateEd25519Keypair();
      const { publicKey: otherPublicKey } = generateEd25519Keypair();
      const payload = 'payload';
      const signature = signEd25519(payload, privateKey);
      const ok = crypto.verify(
        null,
        Buffer.from(payload, 'utf8'),
        otherPublicKey,
        Buffer.from(signature, 'hex'),
      );
      expect(ok).toBe(false);
    });
  });

  describe('generateEd25519Keypair', () => {
    it('genera un keypair que hace round-trip de firma/verificación', () => {
      const { publicKey, privateKey } = generateEd25519Keypair();
      const payload = 'canonical-payload';
      const signature = crypto.sign(
        null,
        Buffer.from(payload, 'utf8'),
        privateKey,
      );
      const ok = crypto.verify(
        null,
        Buffer.from(payload, 'utf8'),
        publicKey,
        signature,
      );
      expect(ok).toBe(true);
    });
  });

  describe('privateKeyToPkcs8Pem + loadPrivateKeyFromPem', () => {
    it('serializa la clave privada como PEM PKCS#8 y la recarga (round-trip)', () => {
      const { privateKey, publicKey } = generateEd25519Keypair();
      const pem = privateKeyToPkcs8Pem(privateKey);
      expect(pem).toContain('-----BEGIN PRIVATE KEY-----');

      const reloaded = loadPrivateKeyFromPem(pem);
      const payload = 'round-trip';
      const signature = signEd25519(payload, reloaded);

      const ok = crypto.verify(
        null,
        Buffer.from(payload, 'utf8'),
        publicKey,
        Buffer.from(signature, 'hex'),
      );
      expect(ok).toBe(true);
    });
  });

  describe('publicKeyToRawBase64', () => {
    it('exporta los 32 bytes crudos en base64 y reconstruye una clave SPKI válida', () => {
      const { publicKey, privateKey } = generateEd25519Keypair();
      const rawBase64 = publicKeyToRawBase64(publicKey);
      const raw = Buffer.from(rawBase64, 'base64');
      expect(raw.length).toBe(32);

      const spki = crypto.createPublicKey({
        key: Buffer.concat([ED25519_SPKI_PREFIX, raw]),
        format: 'der',
        type: 'spki',
      });
      const payload = 'spki-verification';
      const signature = signEd25519(payload, privateKey);
      const ok = crypto.verify(
        null,
        Buffer.from(payload, 'utf8'),
        spki,
        Buffer.from(signature, 'hex'),
      );
      expect(ok).toBe(true);
    });
  });
});
