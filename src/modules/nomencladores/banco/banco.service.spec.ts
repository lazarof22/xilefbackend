import { Test, TestingModule } from '@nestjs/testing';
import { BancoService } from './banco.service';

describe('BancoService', () => {
  let service: BancoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BancoService],
    }).compile();

    service = module.get<BancoService>(BancoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
