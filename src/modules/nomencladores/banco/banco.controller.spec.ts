import { Test, TestingModule } from '@nestjs/testing';
import { BancoController } from './banco.controller';
import { BancoService } from './banco.service';

describe('BancoController', () => {
  let controller: BancoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BancoController],
      providers: [BancoService],
    }).compile();

    controller = module.get<BancoController>(BancoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
