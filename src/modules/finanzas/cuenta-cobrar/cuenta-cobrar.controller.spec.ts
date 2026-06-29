import { Test, TestingModule } from '@nestjs/testing';
import { CuentaCobrarController } from './cuenta-cobrar.controller';
import { CuentaCobrarService } from './cuenta-cobrar.service';
import { EstadoCxC } from './types/cuenta-cobrar.types';
import { Types } from 'mongoose';

describe('CuentaCobrarController', () => {
  let controller: CuentaCobrarController;
  let mockService: any;

  const mockDocument = {
    _id: new Types.ObjectId(),
    codigo: 'CXC-001',
    cliente: new Types.ObjectId(),
    concepto: new Types.ObjectId(),
    montoOriginal: 5000,
    saldoPendiente: 5000,
    fechaEmision: new Date('2024-01-01'),
    fechaVencimiento: new Date('2024-02-01'),
    estado: EstadoCxC.PENDIENTE,
    notas: 'Test note',
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getVencidas: jest.fn(),
      getEnvejecimiento: jest.fn(),
      abonar: jest.fn(),
      getResumen: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentaCobrarController],
      providers: [{ provide: CuentaCobrarService, useValue: mockService }],
    }).compile();

    controller = module.get<CuentaCobrarController>(CuentaCobrarController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /', () => {
    it('should call service.create with the DTO', async () => {
      const dto = {
        codigo: 'CXC-002',
        cliente: new Types.ObjectId().toHexString(),
        concepto: new Types.ObjectId().toHexString(),
        montoOriginal: 3000,
        fechaEmision: '2024-03-01',
        fechaVencimiento: '2024-04-01',
      };
      mockService.create.mockResolvedValue(mockDocument);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('GET /', () => {
    it('should call service.findAll', async () => {
      mockService.findAll.mockResolvedValue([mockDocument]);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('GET /vencidas', () => {
    it('should call service.getVencidas', async () => {
      mockService.getVencidas.mockResolvedValue([mockDocument]);

      const result = await controller.getVencidas();

      expect(mockService.getVencidas).toHaveBeenCalled();
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('GET /envejecimiento', () => {
    it('should call service.getEnvejecimiento', async () => {
      const aging = [
        { rango: '0-30 días', cantidad: 2, montoTotal: 5000, porcentaje: 0 },
      ];
      mockService.getEnvejecimiento.mockResolvedValue(aging);

      const result = await controller.getEnvejecimiento();

      expect(mockService.getEnvejecimiento).toHaveBeenCalled();
      expect(result).toEqual(aging);
    });
  });

  describe('GET /resumen', () => {
    it('should call service.getResumen', async () => {
      const resumen = { totalPendiente: 15000, porEstado: [] };
      mockService.getResumen.mockResolvedValue(resumen);

      const result = await controller.getResumen();

      expect(mockService.getResumen).toHaveBeenCalled();
      expect(result).toEqual(resumen);
    });
  });

  describe('GET /:id', () => {
    it('should call service.findOne with id', async () => {
      const id = new Types.ObjectId().toHexString();
      mockService.findOne.mockResolvedValue(mockDocument);

      const result = await controller.findOne(id);

      expect(mockService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('PATCH /:id', () => {
    it('should call service.update with id and DTO', async () => {
      const id = new Types.ObjectId().toHexString();
      const updateDto = { notas: 'Updated' };
      mockService.update.mockResolvedValue(mockDocument);

      const result = await controller.update(id, updateDto);

      expect(mockService.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('POST /:id/abonar', () => {
    it('should call service.abonar with id and abono', async () => {
      const id = new Types.ObjectId().toHexString();
      const abono = {
        monto: 2000,
        fechaPago: '2024-03-01',
        referencia: 'PAG-001',
      };
      mockService.abonar.mockResolvedValue(mockDocument);

      const result = await controller.abonar(id, abono);

      expect(mockService.abonar).toHaveBeenCalledWith(id, abono);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('DELETE /:id', () => {
    it('should call service.remove with id', async () => {
      const id = new Types.ObjectId().toHexString();
      mockService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(id);

      expect(mockService.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ deleted: true });
    });
  });
});
