import { Test, TestingModule } from '@nestjs/testing';
import { LicenciaCryptoService } from './licencia-crypto.service';

// Firma válida precalculada con la clave privada de DEV sobre el payload
// 'test-payload-123'. La firma es pública (verificable con la clave pública
// embebida); la clave privada NO vive en el cliente.
const VALID_PAYLOAD = 'test-payload-123';
const VALID_SIGNATURE =
  '26b5beb8166c4f2ba4c9cc2c705219fa2b0b6bfab4cc324c7c8475b449537b7b' +
  '6b898e9f1971ffcdbcfd47e44e2d2e936ca3b0744005c4a0766b0cd7d83e3f06';

describe('LicenciaCryptoService', () => {
  let service: LicenciaCryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaCryptoService],
    }).compile();

    service = module.get<LicenciaCryptoService>(LicenciaCryptoService);
    // Disparar onModuleInit manualmente como hace NestJS runtime (no-op).
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit (verify-only: sin gates de secretos)', () => {
    it('should NOT throw even when no secret env vars are set', () => {
      const oldKey = process.env.LICENSE_SECRET_KEY;
      const oldSign = process.env.LICENSE_SIGN_SECRET;
      const oldSalt = process.env.LICENSE_SALT;
      try {
        delete process.env.LICENSE_SECRET_KEY;
        delete process.env.LICENSE_SIGN_SECRET;
        delete process.env.LICENSE_SALT;
        expect(() => service.onModuleInit()).not.toThrow();
      } finally {
        if (oldKey) process.env.LICENSE_SECRET_KEY = oldKey;
        if (oldSign) process.env.LICENSE_SIGN_SECRET = oldSign;
        if (oldSalt) process.env.LICENSE_SALT = oldSalt;
      }
    });
  });

  describe('verifyEd25519', () => {
    it('should verify a valid Ed25519 signature', () => {
      expect(service.verifyEd25519(VALID_PAYLOAD, VALID_SIGNATURE)).toBe(true);
    });

    it('should reject a forged signature', () => {
      const bogus = 'a'.repeat(128);
      expect(service.verifyEd25519(VALID_PAYLOAD, bogus)).toBe(false);
    });

    it('should reject a signature over a different payload', () => {
      expect(service.verifyEd25519('other-payload', VALID_SIGNATURE)).toBe(
        false,
      );
    });

    it('should reject truncated / non-hex signatures without throwing', () => {
      expect(service.verifyEd25519(VALID_PAYLOAD, 'short')).toBe(false);
      expect(service.verifyEd25519(VALID_PAYLOAD, '')).toBe(false);
      expect(service.verifyEd25519(VALID_PAYLOAD, 'zz'.repeat(64))).toBe(false);
      expect(() => service.verifyEd25519(VALID_PAYLOAD, 'short')).not.toThrow();
    });
  });

  describe('forge-path hardening (dead-by-throw)', () => {
    it('should throw when signHMAC is called (no client signing path)', () => {
      expect(() => service.signHMAC('payload')).toThrow();
    });

    it('should throw when encryptAES256GCM is called (AES cleanup deferred)', () => {
      expect(() => service.encryptAES256GCM('key')).toThrow();
    });

    it('should throw when decryptAES256GCM is called', () => {
      expect(() => service.decryptAES256GCM('dGVzdA==')).toThrow();
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
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      const keys = Object.keys(parsed);
      const sorted = [...keys].sort();
      expect(keys).toEqual(sorted);
      expect(parsed).toHaveProperty('activa');
      expect(parsed).toHaveProperty('empresa_id');
      expect(parsed).toHaveProperty('fecha_inicio');
      expect(parsed).toHaveProperty('fecha_vencimiento');
      expect(parsed).toHaveProperty('hardware_id');
      expect(parsed).toHaveProperty('max_usuarios');
      expect(parsed).toHaveProperty('revocada');
      expect(parsed).toHaveProperty('tipo');
      expect(parsed.fecha_inicio).toBe(fechaInicio.toISOString());
      expect(parsed.fecha_vencimiento).toBe(fechaVenc.toISOString());
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
  });

  describe('buildEd25519Payload (canonical v2, 7 campos)', () => {
    it('should exclude hardware_id', () => {
      const payload = service.buildEd25519Payload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: new Date('2024-01-01'),
        fecha_vencimiento: new Date('2025-01-01'),
        max_usuarios: 10,
        activa: true,
        revocada: false,
      });
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      expect(parsed).not.toHaveProperty('hardware_id');
      expect(Object.keys(parsed)).toHaveLength(7);
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
