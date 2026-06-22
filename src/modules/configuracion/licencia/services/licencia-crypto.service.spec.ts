import { Test, TestingModule } from '@nestjs/testing';
import { LicenciaCryptoService } from './licencia-crypto.service';

const TEST_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
const TEST_SIGN_SECRET = 'test-sign-secret-min-32-chars!!';

describe('LicenciaCryptoService', () => {
  let service: LicenciaCryptoService;

  beforeAll(() => {
    process.env.LICENSE_SECRET_KEY = TEST_SECRET_KEY;
    process.env.LICENSE_SIGN_SECRET = TEST_SIGN_SECRET;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaCryptoService],
    }).compile();

    service = module.get<LicenciaCryptoService>(LicenciaCryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encryptAES256GCM / decryptAES256GCM', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const original = 'XILEF-A1B2-C3D4-E5F6';
      const encrypted = service.encryptAES256GCM(original);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(original);
      expect(typeof encrypted).toBe('string');

      const decrypted = service.decryptAES256GCM(encrypted);
      expect(decrypted).toBe(original);
    });

    it('should produce different ciphertexts for the same plaintext (random IV)', () => {
      const plaintext = 'test-license-key-12345';
      const c1 = service.encryptAES256GCM(plaintext);
      const c2 = service.encryptAES256GCM(plaintext);
      expect(c1).not.toBe(c2);
    });

    it('should throw on tampered data', () => {
      const original = 'my-secret-key';
      const encrypted = service.encryptAES256GCM(original);
      const tampered = encrypted.slice(0, -5) + 'XXXXX';
      expect(() => service.decryptAES256GCM(tampered)).toThrow();
    });
  });

  describe('generateSHA256Hash', () => {
    it('should generate a consistent hash', () => {
      const h1 = service.generateSHA256Hash('hello');
      const h2 = service.generateSHA256Hash('hello');
      expect(h1).toBe(h2);
      expect(h1.length).toBe(64); // SHA256 hex = 64 chars
    });

    it('should produce different hashes for different inputs', () => {
      const h1 = service.generateSHA256Hash('hello');
      const h2 = service.generateSHA256Hash('world');
      expect(h1).not.toBe(h2);
    });
  });

  describe('signHMAC / verifyHMAC', () => {
    it('should sign and verify a payload', () => {
      const payload = 'test-payload-123';
      const signature = service.signHMAC(payload);
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // HMAC-SHA256 hex
      expect(service.verifyHMAC(payload, signature)).toBe(true);
    });

    it('should reject tampered payloads', () => {
      const payload = 'original-data';
      const signature = service.signHMAC(payload);
      expect(service.verifyHMAC('tampered-data', signature)).toBe(false);
    });

    it('should reject tampered signatures', () => {
      const payload = 'original-data';
      const signature = service.signHMAC(payload);
      const fakeSig = 'a'.repeat(64);
      expect(service.verifyHMAC(payload, fakeSig)).toBe(false);
    });

    it('should reject signatures of wrong length', () => {
      const payload = 'test';
      expect(service.verifyHMAC(payload, 'short')).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const payload = 'sensitive-data';
      const realSig = service.signHMAC(payload);
      // Should not throw and should return false for invalid hex
      expect(service.verifyHMAC(payload, 'gg'.repeat(32))).toBe(false);
    });
  });

  describe('buildIntegrityPayload', () => {
    it('should build a consistent payload string', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = service.buildIntegrityPayload({
        empresa_id: '123',
        tipo: 'anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
      });
      expect(payload).toContain('123');
      expect(payload).toContain('anual');
      expect(payload).toContain(fechaInicio.toISOString());
      expect(payload).toContain(fechaVenc.toISOString());
      expect(payload.split('|').length).toBe(4);
    });
  });

  describe('generateNonce', () => {
    it('should generate unique nonces', () => {
      const n1 = service.generateNonce();
      const n2 = service.generateNonce();
      expect(n1).toBeDefined();
      expect(n2).toBeDefined();
      expect(n1).not.toBe(n2);
      // base64url encoded 32 bytes = ~43 chars
      expect(n1.length).toBeGreaterThan(30);
    });
  });

  describe('SECRET_KEY validation', () => {
    it('should throw if LICENSE_SECRET_KEY is too short', () => {
      const oldKey = process.env.LICENSE_SECRET_KEY;
      process.env.LICENSE_SECRET_KEY = 'short';
      expect(() => new LicenciaCryptoService()).toThrow();
      process.env.LICENSE_SECRET_KEY = oldKey;
    });
  });
});
