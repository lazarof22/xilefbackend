import { Test, TestingModule } from '@nestjs/testing';
import { ActivoFijoService } from './activo_fijo.service';

describe('ActivoFijoService', () => {
  let service: ActivoFijoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivoFijoService],
    }).compile();

    service = module.get<ActivoFijoService>(ActivoFijoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
