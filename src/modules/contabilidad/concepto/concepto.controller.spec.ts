import { Test, TestingModule } from '@nestjs/testing';
import { ConceptoController } from './concepto.controller';
import { ConceptoService } from './concepto.service';

describe('ConceptoController', () => {
  let controller: ConceptoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConceptoController],
      providers: [ConceptoService],
    }).compile();

    controller = module.get<ConceptoController>(ConceptoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
