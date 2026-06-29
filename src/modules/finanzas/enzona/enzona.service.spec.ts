import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EnzonaService } from './enzona.service';
import { Transaccion } from '../transaccion/schema/transaccion.schema';
import { CuentaCobrar } from '../cuenta-cobrar/schema/cuenta-cobrar.schema';
import { EnzonaEvento } from './types/enzona.types';

describe('EnzonaService', () => {
  let service: EnzonaService;
  let mockTransaccionModel: any;
  let mockCxcModel: any;

  const mockTransaccion = {
    _id: new Types.ObjectId(),
    codigo: 'ENZ-TXN-001',
    tipo: 'ingreso',
    monto: 500,
    fecha: new Date(),
    referencia: 'TXN-001',
    toString: function () {
      return this._id.toString();
    },
  };

  const mockCxc = {
    _id: new Types.ObjectId(),
    codigo: 'CXC-001',
    saldoPendiente: 1000,
    estado: 'pendiente',
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mockMonedaModel = {
      findOne: jest.fn(() => ({ exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), tipo_moneda: 'CUP' }) })),
    };

    mockTransaccionModel = {
      db: { model: jest.fn(() => mockMonedaModel) },
      findOne: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(null) })),
      create: jest.fn().mockResolvedValue(mockTransaccion),
    };

    mockCxcModel = {
      findOne: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(null) })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnzonaService,
        {
          provide: getModelToken(Transaccion.name),
          useValue: mockTransaccionModel,
        },
        { provide: getModelToken(CuentaCobrar.name), useValue: mockCxcModel },
      ],
    }).compile();

    service = module.get<EnzonaService>(EnzonaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('procesarWebhook', () => {
    it('should process successful payment webhook', async () => {
      const payload = {
        evento: EnzonaEvento.PAGO_EXITOSO,
        id_transaccion: 'TXN-001',
        referencia: 'REF-001',
        monto: 500,
        moneda: 'CUP',
        fecha: '2026-06-01',
      };

      const result = await service.procesarWebhook(payload as any);

      expect(result.recibido).toBe(true);
      expect(result.mensaje).toContain('exitosa');
      expect(mockTransaccionModel.create).toHaveBeenCalled();
    });

    it('should skip non-pago_exitoso events', async () => {
      const payload = {
        evento: EnzonaEvento.PAGO_RECHAZADO,
        id_transaccion: 'TXN-002',
        referencia: 'REF-002',
        monto: 500,
        moneda: 'CUP',
        fecha: '2026-06-01',
      };

      const result = await service.procesarWebhook(payload as any);
      expect(result.mensaje).toContain('no se procesa');
      expect(mockTransaccionModel.create).not.toHaveBeenCalled();
    });

    it('should skip duplicate webhook', async () => {
      mockTransaccionModel.findOne = jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(mockTransaccion),
      }));

      const payload = {
        evento: EnzonaEvento.PAGO_EXITOSO,
        id_transaccion: 'TXN-001',
        referencia: 'REF-001',
        monto: 500,
        moneda: 'CUP',
        fecha: '2026-06-01',
      };

      const result = await service.procesarWebhook(payload as any);
      expect(result.mensaje).toContain('ya procesada');
      expect(mockTransaccionModel.create).not.toHaveBeenCalled();
    });

    it('should apply abono to CxC if referencia matches', async () => {
      const cxcWithRef = {
        ...mockCxc,
        save: jest.fn().mockResolvedValue(true),
      };
      mockCxcModel.findOne = jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(cxcWithRef),
      }));

      const payload = {
        evento: EnzonaEvento.PAGO_EXITOSO,
        id_transaccion: 'TXN-003',
        referencia: 'CXC-001',
        monto: 300,
        moneda: 'CUP',
        fecha: '2026-06-01',
      };

      const result = await service.procesarWebhook(payload as any);
      expect(result.abonoAplicado).toBeDefined();
      expect(cxcWithRef.saldoPendiente).toBe(700);
      expect(cxcWithRef.save).toHaveBeenCalled();
    });
  });
});
