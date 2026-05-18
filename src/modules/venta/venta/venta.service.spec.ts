import { Test, TestingModule } from '@nestjs/testing';
import { VentaService } from './venta.service';

describe('VentaService', () => {
  let service: VentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VentaService],
    }).compile();

    service = module.get<VentaService>(VentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
