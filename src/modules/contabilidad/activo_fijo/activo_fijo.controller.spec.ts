import { Test, TestingModule } from '@nestjs/testing';
import { ActivoFijoController } from './activo_fijo.controller';
import { ActivoFijoService } from './activo_fijo.service';

describe('ActivoFijoController', () => {
  let controller: ActivoFijoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivoFijoController],
      providers: [ActivoFijoService],
    }).compile();

    controller = module.get<ActivoFijoController>(ActivoFijoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
