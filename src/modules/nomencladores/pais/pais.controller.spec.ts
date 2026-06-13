import { Test, TestingModule } from '@nestjs/testing';
import { PaisController } from './pais.controller';
import { PaisService } from './pais.service';

describe('PaisController', () => {
  let controller: PaisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaisController],
      providers: [PaisService],
    }).compile();

    controller = module.get<PaisController>(PaisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
