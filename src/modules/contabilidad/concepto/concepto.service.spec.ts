import { Test, TestingModule } from '@nestjs/testing';
import { ConceptoService } from './concepto.service';

describe('ConceptoService', () => {
  let service: ConceptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConceptoService],
    }).compile();

    service = module.get<ConceptoService>(ConceptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
