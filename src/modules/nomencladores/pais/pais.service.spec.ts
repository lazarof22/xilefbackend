import { Test, TestingModule } from '@nestjs/testing';
import { PaisService } from './pais.service';

describe('PaisService', () => {
  let service: PaisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaisService],
    }).compile();

    service = module.get<PaisService>(PaisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
