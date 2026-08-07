import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LicenciaValidatorService } from './licencia-validator.service';
import { LicenciaCryptoService } from './licencia-crypto.service';
import { NonceUsado } from '../schemas/nonce-usado.schema';

describe('LicenciaValidatorService', () => {
  let service: LicenciaValidatorService;
  let cryptoService: LicenciaCryptoService;
  let mockNonceInsert: jest.Mock;
  let mockNonceModel: any;

  beforeAll(() => {
    process.env.LICENSE_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
    process.env.LICENSE_SIGN_SECRET = 'test-sign-secret-min-32-chars!!!';
    process.env.LICENSE_SALT = Buffer.alloc(32, 0x01).toString('base64');
  });

  beforeEach(async () => {
    mockNonceInsert = jest.fn();
    mockNonceModel = function MockNonceModel() {} as any;
    mockNonceModel.insertOne = mockNonceInsert;
    // insertOne en mongoose Model devuelve un documento tras await.
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

  describe('validateIntegrity', () => {
    it('should validate a license with canonical v1 signature', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
        max_usuarios: 10,
        hardware_id: 'hash-abc',
        activa: true,
        revocada: false,
      });
      const firma = cryptoService.signHMAC(payload);

      expect(
        service.validateIntegrity({
          empresa_id: 'EMP-001',
          tipo: 'suscripcion_anual',
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVenc,
          max_usuarios: 10,
          hardware_id: 'hash-abc',
          activa: true,
          revocada: false,
          firma_hmac: firma,
          version_firma: 1,
        }),
      ).toBe(true);
    });

    it('should validate a license with legacy signature when version_firma=0', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildLegacyIntegrityPayload({
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
          version_firma: 0,
        }),
      ).toBe(true);
    });

    it('should reject a v1 license when hardware_id is tampered', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
        max_usuarios: 10,
        hardware_id: 'original-hash',
        activa: true,
        revocada: false,
      });
      const firma = cryptoService.signHMAC(payload);

      expect(
        service.validateIntegrity({
          empresa_id: 'EMP-001',
          tipo: 'suscripcion_anual',
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVenc,
          max_usuarios: 10,
          hardware_id: 'tampered-hash',
          activa: true,
          revocada: false,
          firma_hmac: firma,
          version_firma: 1,
        }),
      ).toBe(false);
    });

    it('should reject tampered empresa_id', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
        max_usuarios: 0,
        hardware_id: '',
        activa: true,
        revocada: false,
      });
      const firma = cryptoService.signHMAC(payload);

      expect(
        service.validateIntegrity({
          empresa_id: 'EMP-HACKED',
          tipo: 'suscripcion_anual',
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVenc,
          max_usuarios: 0,
          hardware_id: '',
          activa: true,
          revocada: false,
          firma_hmac: firma,
          version_firma: 1,
        }),
      ).toBe(false);
    });

    it('should reject tampered revocada flag (v1 covers revocada)', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaVenc = new Date('2025-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
        max_usuarios: 0,
        hardware_id: '',
        activa: true,
        revocada: false,
      });
      const firma = cryptoService.signHMAC(payload);

      expect(
        service.validateIntegrity({
          empresa_id: 'EMP-001',
          tipo: 'suscripcion_anual',
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVenc,
          max_usuarios: 0,
          hardware_id: '',
          activa: true,
          revocada: true,
          firma_hmac: firma,
          version_firma: 1,
        }),
      ).toBe(false);
    });

    it('should reject empty firma_hmac', () => {
      const ok = service.validateIntegrity({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: new Date('2024-01-01'),
        fecha_vencimiento: new Date('2025-01-01'),
        firma_hmac: '',
        version_firma: 1,
      });
      expect(ok).toBe(false);
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
      // Licencia vencía en 2025-12-31. ultima_verificacion_efectiva estaba en 2099
      // (clock skew positivo). Date.now() retrocedió a 2024 → sigue vencida.
      const future = new Date('2025-12-31');
      const efectiva = new Date('2099-01-01');
      // Forzamos un now "retrocedido" relativo a efectiva probando que la
      // referencia de comparación es efectiva > now.
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
