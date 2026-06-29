import { Test, TestingModule } from '@nestjs/testing';
import { TransaccionController } from './transaccion.controller';
import { TransaccionService } from './transaccion.service';
import { TipoTransaccion, MetodoPago } from './types/transaccion.types';
import { Types } from 'mongoose';

describe('TransaccionController', () => {
  let controller: TransaccionController;
  let mockService: any;

  const mockDocument = {
    _id: new Types.ObjectId(),
    codigo: 'TRX-001',
    tipo: TipoTransaccion.INGRESO,
    categoria: new Types.ObjectId(),
    monto: 1000,
    moneda: new Types.ObjectId(),
    fecha: new Date('2024-01-15'),
    metodoPago: MetodoPago.TRANSFERENCIA,
    referencia: 'REF-001',
    descripcion: 'Test',
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getPorPeriodo: jest.fn(),
      getResumen: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransaccionController],
      providers: [{ provide: TransaccionService, useValue: mockService }],
    }).compile();

    controller = module.get<TransaccionController>(TransaccionController);
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
        codigo: 'TRX-002',
        tipo: TipoTransaccion.EGRESO,
        categoria: new Types.ObjectId().toHexString(),
        monto: 500,
        moneda: new Types.ObjectId().toHexString(),
        fecha: '2024-02-01',
        metodoPago: MetodoPago.EFECTIVO,
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

  describe('GET /periodo', () => {
    it('should call service.getPorPeriodo with query params', async () => {
      const desde = '2024-01-01';
      const hasta = '2024-01-31';
      mockService.getPorPeriodo.mockResolvedValue([mockDocument]);

      const result = await controller.getPorPeriodo(desde, hasta);

      expect(mockService.getPorPeriodo).toHaveBeenCalledWith(desde, hasta);
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('GET /resumen', () => {
    it('should call service.getResumen with optional query params', async () => {
      const desde = '2024-01-01';
      const hasta = '2024-01-31';
      const resumen = {
        totalIngresos: 10000,
        totalEgresos: 4000,
        saldoNeto: 6000,
        cantidadIngresos: 5,
        cantidadEgresos: 3,
      };
      mockService.getResumen.mockResolvedValue(resumen);

      const result = await controller.getResumen(desde, hasta);

      expect(mockService.getResumen).toHaveBeenCalledWith(desde, hasta);
      expect(result).toEqual(resumen);
    });

    it('should call service.getResumen without params', async () => {
      const resumen = {
        totalIngresos: 5000,
        totalEgresos: 2000,
        saldoNeto: 3000,
        cantidadIngresos: 2,
        cantidadEgresos: 1,
      };
      mockService.getResumen.mockResolvedValue(resumen);

      const result = await controller.getResumen();

      expect(mockService.getResumen).toHaveBeenCalledWith(undefined, undefined);
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
      const updateDto = { descripcion: 'Updated' };
      mockService.update.mockResolvedValue(mockDocument);
      const result = await controller.update(id, updateDto);
      expect(mockService.update).toHaveBeenCalledWith(id, updateDto);
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
