import { Test, TestingModule } from '@nestjs/testing';
import { LicenciaGeneratorService } from './licencia-generator.service';
import { LicenciaCryptoService } from './licencia-crypto.service';

describe('LicenciaGeneratorService', () => {
  let service: LicenciaGeneratorService;

  beforeAll(() => {
    process.env.LICENSE_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
    process.env.LICENSE_SIGN_SECRET = 'test-sign-secret-min-32-chars!!';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaGeneratorService, LicenciaCryptoService],
    }).compile();

    service = module.get<LicenciaGeneratorService>(LicenciaGeneratorService);
  });

  describe('generateLicenciaKey', () => {
    it('should generate a key with XILEF prefix', () => {
      const key = service.generateLicenciaKey(
        'EMPRESA-001',
        'suscripcion_anual',
        new Date('2025-12-31'),
      );
      expect(key).toMatch(/^XILEF-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
    });

    it('should generate different keys for different empresas', () => {
      const key1 = service.generateLicenciaKey('EMP-001', 'perpetua', new Date('2099-01-01'));
      const key2 = service.generateLicenciaKey('EMP-002', 'perpetua', new Date('2099-01-01'));
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for same empresa with different dates', () => {
      const key1 = service.generateLicenciaKey('EMP-001', 'trial', new Date('2025-06-01'));
      const key2 = service.generateLicenciaKey('EMP-001', 'trial', new Date('2025-06-02'));
      expect(key1).not.toBe(key2);
    });
  });

  describe('getDurationForType', () => {
    it('should return 30 for trial', () => {
      expect(service.getDurationForType('trial')).toBe(30);
    });

    it('should return 30 for suscripcion_mensual', () => {
      expect(service.getDurationForType('suscripcion_mensual')).toBe(30);
    });

    it('should return 365 for suscripcion_anual', () => {
      expect(service.getDurationForType('suscripcion_anual')).toBe(365);
    });

    it('should return 36500 for perpetua', () => {
      expect(service.getDurationForType('perpetua')).toBe(36500);
    });

    it('should use custom days when provided', () => {
      expect(service.getDurationForType('trial', 60)).toBe(60);
    });

    it('should ignore custom days when 0 or negative', () => {
      expect(service.getDurationForType('trial', 0)).toBe(30);
      expect(service.getDurationForType('trial', -5)).toBe(30);
    });
  });

  describe('calculateExpiryDate', () => {
    it('should set expiry date to future', () => {
      const result = service.calculateExpiryDate('suscripcion_anual');
      const oneYearFromNow = new Date();
      oneYearFromNow.setDate(oneYearFromNow.getDate() + 365);
      // Should be roughly 365 days from now (allow 1 day variance)
      const diffMs = Math.abs(result.getTime() - oneYearFromNow.getTime());
      expect(diffMs).toBeLessThan(24 * 60 * 60 * 1000 + 1000); // 1 day + 1 sec tolerance
    });

    it('should set time to end of day', () => {
      const result = service.calculateExpiryDate('trial');
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('calculateRemainingDays', () => {
    it('should return positive days for future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const days = service.calculateRemainingDays(future);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(11);
    });

    it('should return 0 for past date', () => {
      const past = new Date('2020-01-01');
      expect(service.calculateRemainingDays(past)).toBe(0);
    });

    it('should return 1 for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const days = service.calculateRemainingDays(tomorrow);
      expect(days).toBe(1);
    });
  });
});
