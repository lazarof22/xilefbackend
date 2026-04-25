import { Test, TestingModule } from '@nestjs/testing';
import { PlanCuentasController } from './plan_cuentas.controller';
import { PlanCuentasService } from './plan_cuentas.service';

describe('PlanCuentasController', () => {
  let controller: PlanCuentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanCuentasController],
      providers: [PlanCuentasService],
    }).compile();

    controller = module.get<PlanCuentasController>(PlanCuentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
