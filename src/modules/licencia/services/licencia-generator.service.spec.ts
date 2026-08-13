import { Test, TestingModule } from '@nestjs/testing';
import { LicenciaGeneratorService } from './licencia-generator.service';

describe('LicenciaGeneratorService', () => {
  let service: LicenciaGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaGeneratorService],
    }).compile();

    service = module.get<LicenciaGeneratorService>(LicenciaGeneratorService);
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
