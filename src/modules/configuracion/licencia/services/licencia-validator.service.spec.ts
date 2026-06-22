import { Test, TestingModule } from '@nestjs/testing';
import { LicenciaValidatorService } from './licencia-validator.service';
import { LicenciaCryptoService } from './licencia-crypto.service';

describe('LicenciaValidatorService', () => {
  let service: LicenciaValidatorService;
  let cryptoService: LicenciaCryptoService;

  beforeAll(() => {
    process.env.LICENSE_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
    process.env.LICENSE_SIGN_SECRET = 'test-sign-secret-min-32-chars!!';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaValidatorService, LicenciaCryptoService],
    }).compile();

    service = module.get<LicenciaValidatorService>(LicenciaValidatorService);
    cryptoService = module.get<LicenciaCryptoService>(LicenciaCryptoService);
  });

  describe('validateKeyFormat', () => {
    it('should accept valid format', () => {
      expect(service.validateKeyFormat('XILEF-A1B2-C3D4-E5F6-F7A8')).toBe(true);
    });

    it('should reject lowercase', () => {
      expect(service.validateKeyFormat('xilef-a1b2-c3d4-e5f6-f7a8')).toBe(false);
    });

    it('should reject wrong prefix', () => {
      expect(service.validateKeyFormat('OTHER-A1B2-C3D4-E5F6-F7A8')).toBe(false);
    });

    it('should reject wrong segment count', () => {
      expect(service.validateKeyFormat('XILEF-A1B2-C3D4')).toBe(false);
    });

    it('should reject non-hex characters', () => {
      expect(service.validateKeyFormat('XILEF-G1B2-C3D4-E5F6-F7A8')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(service.validateKeyFormat('')).toBe(false);
    });

    it('should reject missing segments', () => {
      expect(service.validateKeyFormat('XILEF-A1B2-C3D4-E5F')).toBe(false);
    });
  });

  describe('validateNonce', () => {
    it('should accept a valid nonce first time', () => {
      expect(service.validateNonce('unique-nonce-123')).toBe(true);
    });

    it('should reject reused nonce (replay attack prevention)', () => {
      const nonce = 'another-nonce-456';
      expect(service.validateNonce(nonce)).toBe(true);
      expect(service.validateNonce(nonce)).toBe(false);
    });

    it('should accept empty nonce (optional)', () => {
      expect(service.validateNonce('')).toBe(true);
    });
  });

  describe('validateIntegrity', () => {
    it('should validate a correctly signed license', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
      });
      const firma = cryptoService.signHMAC(payload);

      expect(
        service.validateIntegrity({
          empresa_id: 'EMP-001',
          tipo: 'suscripcion_anual',
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVenc,
          firma_hmac: firma,
        }),
      ).toBe(true);
    });

    it('should reject tampered license data', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
      });
      const firma = cryptoService.signHMAC(payload);

      expect(
        service.validateIntegrity({
          empresa_id: 'EMP-HACKED',
          tipo: 'suscripcion_anual',
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVenc,
          firma_hmac: firma,
        }),
      ).toBe(false);
    });

    it('should reject tampered expiry date', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
      });
      const firma = cryptoService.signHMAC(payload);

      expect(
        service.validateIntegrity({
          empresa_id: 'EMP-001',
          tipo: 'suscripcion_anual',
          fecha_inicio: fechaInicio,
          fecha_vencimiento: new Date('2099-12-31'), // Tampered!
          firma_hmac: firma,
        }),
      ).toBe(false);
    });
  });

  describe('validateHardwareId', () => {
    it('should return true if no hardware ID is stored', () => {
      expect(service.validateHardwareId(undefined, 'any-device')).toBe(true);
    });

    it('should return false if hardware stored but none provided', () => {
      const hwHash = cryptoService.generateSHA256Hash('device-fingerprint');
      expect(service.validateHardwareId(hwHash, undefined)).toBe(false);
    });

    it('should validate matching hardware', () => {
      const hwId = 'my-device-fingerprint-abc';
      const hwHash = cryptoService.generateSHA256Hash(hwId);
      expect(service.validateHardwareId(hwHash, hwId)).toBe(true);
    });

    it('should reject different hardware', () => {
      const hwHash = cryptoService.generateSHA256Hash('device-a');
      expect(service.validateHardwareId(hwHash, 'device-b')).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return true for past dates', () => {
      expect(service.isExpired(new Date('2020-01-01'))).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(service.isExpired(future)).toBe(false);
    });
  });
});
