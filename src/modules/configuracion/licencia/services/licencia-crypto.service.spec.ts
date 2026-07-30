import { Test, TestingModule } from '@nestjs/testing';
import { LicenciaCryptoService } from './licencia-crypto.service';

const TEST_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
const TEST_SIGN_SECRET = 'test-sign-secret-min-32-chars!!!';
const TEST_SALT_B64 = Buffer.alloc(32, 0x05).toString('base64');

describe('LicenciaCryptoService', () => {
  let service: LicenciaCryptoService;

  beforeAll(() => {
    process.env.LICENSE_SECRET_KEY = TEST_SECRET_KEY;
    process.env.LICENSE_SIGN_SECRET = TEST_SIGN_SECRET;
    process.env.LICENSE_SALT = TEST_SALT_B64;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaCryptoService],
    }).compile();

    service = module.get<LicenciaCryptoService>(LicenciaCryptoService);
    // Disparar onModuleInit manualmente como hace NestJS runtime
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit env validation', () => {
    it('should throw if LICENSE_SECRET_KEY is too short', () => {
      const oldKey = process.env.LICENSE_SECRET_KEY;
      try {
        process.env.LICENSE_SECRET_KEY = 'short';
        expect(() => service.onModuleInit()).toThrow();
      } finally {
        process.env.LICENSE_SECRET_KEY = oldKey;
      }
    });

    it('should throw if LICENSE_SALT is missing', () => {
      const oldSalt = process.env.LICENSE_SALT;
      try {
        delete process.env.LICENSE_SALT;
        expect(() => service.onModuleInit()).toThrow('LICENSE_SALT');
      } finally {
        process.env.LICENSE_SALT = oldSalt;
      }
    });

    it('should throw if LICENSE_SIGN_SECRET is missing or too short', () => {
      const oldSign = process.env.LICENSE_SIGN_SECRET;
      try {
        delete process.env.LICENSE_SIGN_SECRET;
        expect(() => service.onModuleInit()).toThrow('LICENSE_SIGN_SECRET');
      } finally {
        process.env.LICENSE_SIGN_SECRET = oldSign;
      }
    });
  });

  describe('encryptAES256GCM / decryptAES256GCM', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const original = 'XILEF-A1B2-C3D4-E5F6';
      const encrypted = service.encryptAES256GCM(original);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(original);

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

    it('should reject empty signature without throwing', () => {
      expect(service.verifyHMAC('payload', '')).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const payload = 'sensitive-data';
      const realSig = service.signHMAC(payload);
      expect(service.verifyHMAC(payload, 'gg'.repeat(32))).toBe(false);
    });
  });

  describe('buildIntegrityPayload (canonical v1)', () => {
    it('should produce canonical JSON with sorted keys', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = service.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
        max_usuarios: 10,
        hardware_id: 'hw-hash',
        activa: true,
        revocada: false,
      });
      // Parsear el JSON: las keys deben aparecer ordenadas asc.
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      const keys = Object.keys(parsed);
      const sorted = [...keys].sort();
      expect(keys).toEqual(sorted);
      // Campos incluidos
      expect(parsed).toHaveProperty('activa');
      expect(parsed).toHaveProperty('empresa_id');
      expect(parsed).toHaveProperty('fecha_inicio');
      expect(parsed).toHaveProperty('fecha_vencimiento');
      expect(parsed).toHaveProperty('hardware_id');
      expect(parsed).toHaveProperty('max_usuarios');
      expect(parsed).toHaveProperty('revocada');
      expect(parsed).toHaveProperty('tipo');
      // Fechas normalizadas a ISO string
      expect(parsed.fecha_inicio).toBe(fechaInicio.toISOString());
      expect(parsed.fecha_vencimiento).toBe(fechaVenc.toISOString());
      // NO debe incluir firma_hmac
      expect(parsed).not.toHaveProperty('firma_hmac');
    });

    it('should include hardware_id, max_usuarios, activa, revocada in v1', () => {
      const payload = service.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'trial',
        fecha_inicio: new Date('2024-01-01'),
        fecha_vencimiento: new Date('2025-01-01'),
        max_usuarios: 5,
        hardware_id: 'abc',
        activa: true,
        revocada: false,
      });
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      expect(parsed.hardware_id).toBe('abc');
      expect(parsed.max_usuarios).toBe(5);
      expect(parsed.activa).toBe(true);
      expect(parsed.revocada).toBe(false);
    });

    it('alterar hardware_id invalida la firma (buildPayloadForVersion v1)', () => {
      const base = {
        empresa_id: 'EMP-001',
        tipo: 'trial',
        fecha_inicio: new Date('2024-01-01'),
        fecha_vencimiento: new Date('2025-01-01'),
        max_usuarios: 5,
        activa: true,
        revocada: false,
      };
      const p1 = service.buildPayloadForVersion(1, {
        ...base,
        hardware_id: 'hash-A',
      });
      const p2 = service.buildPayloadForVersion(1, {
        ...base,
        hardware_id: 'hash-B',
      });
      expect(p1).not.toBe(p2);
      const firma = service.signHMAC(p1);
      expect(service.verifyHMAC(p2, firma)).toBe(false);
    });

    it('alterar revocada invalida la firma (v1 covers revocada)', () => {
      const base = {
        empresa_id: 'EMP-001',
        tipo: 'trial',
        fecha_inicio: new Date('2024-01-01'),
        fecha_vencimiento: new Date('2025-01-01'),
        max_usuarios: 0,
        hardware_id: '',
        activa: true,
      };
      const p1 = service.buildPayloadForVersion(1, {
        ...base,
        revocada: false,
      });
      const p2 = service.buildPayloadForVersion(1, { ...base, revocada: true });
      const firma = service.signHMAC(p1);
      expect(service.verifyHMAC(p2, firma)).toBe(false);
    });
  });

  describe('buildLegacyIntegrityPayload (v0)', () => {
    it('should produce pipe-separated format with only 4 fields', () => {
      const fi = new Date('2024-01-01');
      const fv = new Date('2025-01-01');
      const payload = service.buildLegacyIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'trial',
        fecha_inicio: fi,
        fecha_vencimiento: fv,
      });
      expect(payload.split('|').length).toBe(4);
      expect(payload).toContain('EMP-001');
      expect(payload).toContain('trial');
      expect(payload).toContain(fi.toISOString());
      expect(payload).toContain(fv.toISOString());
    });
  });

  describe('generateNonce', () => {
    it('should generate unique nonces', () => {
      const n1 = service.generateNonce();
      const n2 = service.generateNonce();
      expect(n1).toBeDefined();
      expect(n2).toBeDefined();
      expect(n1).not.toBe(n2);
      expect(n1.length).toBeGreaterThan(30);
    });
  });
});
