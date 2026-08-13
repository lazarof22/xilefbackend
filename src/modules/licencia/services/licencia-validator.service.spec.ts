import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LicenciaValidatorService } from './licencia-validator.service';
import { LicenciaCryptoService } from './licencia-crypto.service';
import { NonceUsado } from '../schemas/nonce-usado.schema';

// Firma Ed25519 válida precalculada con la clave privada de DEV sobre el
// payload canónico v2 de EMP-001 (suscripcion_anual 2024→2025, max_usuarios 10,
// activa=true, revocada=false). La firma es pública; la privada NO vive aquí.
const V2_FIRMA =
  '98f15d53d6460a638e87db25e44c0cf3d59ae93413e0633b6430bd1354962f91' +
  '350d8113c0514338e4eece618181608ec5168e5697359e214b2855e6ead7ce0c';

describe('LicenciaValidatorService', () => {
  let service: LicenciaValidatorService;
  let cryptoService: LicenciaCryptoService;
  let mockNonceInsert: jest.Mock;
  let mockNonceModel: any;

  beforeEach(async () => {
    mockNonceInsert = jest.fn();
    mockNonceModel = function MockNonceModel() {} as any;
    mockNonceModel.insertOne = mockNonceInsert;
    mockNonceInsert.mockImplementation((doc) => Promise.resolve(doc));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenciaValidatorService,
        LicenciaCryptoService,
        {
          provide: getModelToken(NonceUsado.name),
          useValue: mockNonceModel,
        },
      ],
    }).compile();

    service = module.get<LicenciaValidatorService>(LicenciaValidatorService);
    cryptoService = module.get<LicenciaCryptoService>(LicenciaCryptoService);
  });

  describe('validateKeyFormat', () => {
    it('should accept valid format', () => {
      expect(service.validateKeyFormat('XILEF-A1B2-C3D4-E5F6-F7A8')).toBe(true);
    });

    it('should reject lowercase', () => {
      expect(service.validateKeyFormat('xilef-a1b2-c3d4-e5f6-f7a8')).toBe(
        false,
      );
    });

    it('should reject wrong prefix', () => {
      expect(service.validateKeyFormat('OTHER-A1B2-C3D4-E5F6-F7A8')).toBe(
        false,
      );
    });

    it('should reject wrong segment count', () => {
      expect(service.validateKeyFormat('XILEF-A1B2-C3D4')).toBe(false);
    });

    it('should reject non-hex characters', () => {
      expect(service.validateKeyFormat('XILEF-G1B2-C3D4-E5F6-F7A8')).toBe(
        false,
      );
    });

    it('should reject empty string', () => {
      expect(service.validateKeyFormat('')).toBe(false);
    });

    it('should reject missing segments', () => {
      expect(service.validateKeyFormat('XILEF-A1B2-C3D4-E5F')).toBe(false);
    });
  });

  describe('validateNonce (MongoDB-backed)', () => {
    it('should accept a valid nonce first time', async () => {
      const ok = await service.validateNonce('unique-nonce-123', 'EMP-001');
      expect(ok).toBe(true);
      expect(mockNonceInsert).toHaveBeenCalled();
    });

    it('should reject replayed nonce (duplicate key error)', async () => {
      mockNonceInsert.mockImplementation(() =>
        Promise.reject(Object.assign(new Error('dup'), { code: 11000 })),
      );
      const ok = await service.validateNonce('reused-nonce', 'EMP-001');
      expect(ok).toBe(false);
    });

    it('should reject empty nonce', async () => {
      const ok = await service.validateNonce('');
      expect(ok).toBe(false);
      expect(mockNonceInsert).not.toHaveBeenCalled();
    });

    it('should fail-closed on unexpected DB error', async () => {
      mockNonceInsert.mockRejectedValue(new Error('connection lost'));
      const ok = await service.validateNonce('any-nonce', 'EMP-001');
      expect(ok).toBe(false);
    });
  });

  describe('validateIntegrity (v2 Ed25519)', () => {
    const baseLicencia = () => ({
      empresa_id: 'EMP-001',
      tipo: 'suscripcion_anual',
      fecha_inicio: new Date('2024-01-01T00:00:00.000Z'),
      fecha_vencimiento: new Date('2025-01-01T00:00:00.000Z'),
      max_usuarios: 10,
      activa: true,
      revocada: false,
      firma_ed25519: V2_FIRMA,
      version_firma: 2,
    });

    it('should validate a v2 license with a valid Ed25519 signature', () => {
      expect(service.validateIntegrity(baseLicencia())).toBe(true);
    });

    it('should reject a v2 license when fecha_vencimiento is tampered', () => {
      const lic = baseLicencia();
      lic.fecha_vencimiento = new Date('2099-12-31T00:00:00.000Z');
      expect(service.validateIntegrity(lic)).toBe(false);
    });

    it('should reject a v2 license when empresa_id is tampered', () => {
      const lic = baseLicencia();
      lic.empresa_id = 'EMP-HACKED';
      expect(service.validateIntegrity(lic)).toBe(false);
    });

    it('should reject a v2 license when revocada is tampered', () => {
      const lic = baseLicencia();
      lic.revocada = true;
      expect(service.validateIntegrity(lic)).toBe(false);
    });

    it('should reject a v2 license when max_usuarios is tampered', () => {
      const lic = baseLicencia();
      lic.max_usuarios = 9999;
      expect(service.validateIntegrity(lic)).toBe(false);
    });

    it('should reject empty firma_ed25519', () => {
      const lic = baseLicencia();
      lic.firma_ed25519 = '';
      expect(service.validateIntegrity(lic)).toBe(false);
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

    it('should reject different hardware (anti piracy)', () => {
      const hwHash = cryptoService.generateSHA256Hash('device-a');
      expect(service.validateHardwareId(hwHash, 'device-b')).toBe(false);
    });
  });

  describe('validateClockSkew', () => {
    it('should detect skew when ultima_verificacion_efectiva > now', () => {
      const futuro = new Date(Date.now() + 1000 * 60 * 60);
      const result = service.validateClockSkew({
        ultima_verificacion_efectiva: futuro,
      });
      expect(result.skew).toBe(true);
      expect(result.hayActualizar).toBe(true);
      expect(result.now).toBeInstanceOf(Date);
    });

    it('should not detect skew when no efectiva set', () => {
      const result = service.validateClockSkew({});
      expect(result.skew).toBe(false);
      expect(result.hayActualizar).toBe(true);
    });

    it('should not detect skew when efectiva is in the past', () => {
      const pasado = new Date(Date.now() - 1000 * 60);
      const result = service.validateClockSkew({
        ultima_verificacion_efectiva: pasado,
        skew_detectado: false,
      });
      expect(result.skew).toBe(false);
      expect(result.hayActualizar).toBe(false);
    });
  });

  describe('isExpired (with anti clock-skew)', () => {
    it('should return true for past dates', () => {
      expect(service.isExpired(new Date('2020-01-01'))).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(service.isExpired(future)).toBe(false);
    });

    it('should respect max-observed date when clock rewinds (skew)', () => {
      const future = new Date('2025-12-31');
      const efectiva = new Date('2099-01-01');
      const ok = service.isExpired(future, efectiva);
      expect(ok).toBe(true);
    });

    it('should keep future license valid when no skew', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      expect(service.isExpired(future, new Date())).toBe(false);
    });
  });
});
