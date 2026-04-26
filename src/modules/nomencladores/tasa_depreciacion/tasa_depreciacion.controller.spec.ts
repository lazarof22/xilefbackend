import { Test, TestingModule } from '@nestjs/testing';
import { TasaDepreciacionController } from './tasa_depreciacion.controller';
import { TasaDepreciacionService } from './tasa_depreciacion.service';

describe('TasaDepreciacionController', () => {
  let controller: TasaDepreciacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasaDepreciacionController],
      providers: [TasaDepreciacionService],
    }).compile();

    controller = module.get<TasaDepreciacionController>(TasaDepreciacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
