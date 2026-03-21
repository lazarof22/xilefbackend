import { Test, TestingModule } from '@nestjs/testing';
import { PlanCuentasService } from './plan_cuentas.service';

describe('PlanCuentasService', () => {
  let service: PlanCuentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanCuentasService],
    }).compile();

    service = module.get<PlanCuentasService>(PlanCuentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
