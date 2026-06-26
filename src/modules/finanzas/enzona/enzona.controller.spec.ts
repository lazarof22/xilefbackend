import { Test, TestingModule } from '@nestjs/testing';
import { EnzonaController } from './enzona.controller';
import { EnzonaService } from './enzona.service';

describe('EnzonaController', () => {
  let controller: EnzonaController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      procesarWebhook: jest.fn().mockResolvedValue({ recibido: true, mensaje: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnzonaController],
      providers: [{ provide: EnzonaService, useValue: mockService }],
    }).compile();

    controller = module.get<EnzonaController>(EnzonaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /enzona/webhook', () => {
    it('should call service.procesarWebhook with payload', async () => {
      const payload = {
        evento: 'pago_exitoso',
        id_transaccion: 'TXN-001',
        referencia: 'REF-001',
        monto: 500,
        moneda: 'CUP',
        fecha: '2026-06-01',
      };

      const result = await controller.webhook(payload as any);
      expect(mockService.procesarWebhook).toHaveBeenCalledWith(payload);
      expect(result.recibido).toBe(true);
    });
  });
});
