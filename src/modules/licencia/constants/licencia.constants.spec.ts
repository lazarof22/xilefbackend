import * as crypto from 'crypto';
import {
  FIRMA_VERSION_ACTUAL,
  FIRMA_VERSION_LEGACY,
  LICENCIA_ED25519_PAYLOAD_FIELDS,
  LICENCIA_ED25519_PUBLIC_KEY,
} from './licencia.constants';

describe('licencia.constants', () => {
  it('FIRMA_VERSION_ACTUAL es 2', () => {
    expect(FIRMA_VERSION_ACTUAL).toBe(2);
  });

  it('FIRMA_VERSION_LEGACY es 0', () => {
    expect(FIRMA_VERSION_LEGACY).toBe(0);
  });

  it('LICENCIA_ED25519_PUBLIC_KEY es base64 de 32 bytes', () => {
    const raw = Buffer.from(LICENCIA_ED25519_PUBLIC_KEY, 'base64');
    expect(raw.length).toBe(32);
  });

  it('el payload v2 tiene 7 campos y no incluye hardware_id', () => {
    expect(LICENCIA_ED25519_PAYLOAD_FIELDS).toHaveLength(7);
    expect(LICENCIA_ED25519_PAYLOAD_FIELDS).not.toContain('hardware_id');
  });

  it('la clave pública es una clave Ed25519 válida (reconstrucción SPKI)', () => {
    const raw = Buffer.from(LICENCIA_ED25519_PUBLIC_KEY, 'base64');
    const spki = Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      raw,
    ]);
    const pub = crypto.createPublicKey({
      key: spki,
      format: 'der',
      type: 'spki',
    });
    expect(pub.asymmetricKeyType).toBe('ed25519');
  });
});
