import { generateLicenciaKey, sha256 } from './licencia-key.util';

describe('licencia-key.util', () => {
  const fecha = new Date('2025-01-01T00:00:00.000Z');

  describe('sha256', () => {
    it('hash conocido', () => {
      expect(sha256('hello')).toBe(
        '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      );
    });

    it('determinista y sensible a la entrada', () => {
      expect(sha256('hello')).toBe(sha256('hello'));
      expect(sha256('hello')).not.toBe(sha256('world'));
    });
  });

  describe('generateLicenciaKey', () => {
    it('formato XILEF-XXXX-XXXX-XXXX-XXXX', () => {
      const key = generateLicenciaKey('EMP-001', 'trial', fecha);
      expect(key).toMatch(
        /^XILEF-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/,
      );
    });

    it('determinista con randomHex fijo', () => {
      const a = generateLicenciaKey('EMP-001', 'trial', fecha, 'a'.repeat(16));
      const b = generateLicenciaKey('EMP-001', 'trial', fecha, 'a'.repeat(16));
      expect(a).toBe(b);
    });

    it('diferente randomHex → clave distinta', () => {
      const a = generateLicenciaKey('EMP-001', 'trial', fecha, 'a'.repeat(16));
      const b = generateLicenciaKey('EMP-001', 'trial', fecha, 'b'.repeat(16));
      expect(a).not.toBe(b);
    });
  });
});
