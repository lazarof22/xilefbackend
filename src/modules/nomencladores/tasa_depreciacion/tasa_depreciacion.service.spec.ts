import { Test, TestingModule } from '@nestjs/testing';
import { TasaDepreciacionService } from './tasa_depreciacion.service';

describe('TasaDepreciacionService', () => {
  let service: TasaDepreciacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasaDepreciacionService],
    }).compile();

    service = module.get<TasaDepreciacionService>(TasaDepreciacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
