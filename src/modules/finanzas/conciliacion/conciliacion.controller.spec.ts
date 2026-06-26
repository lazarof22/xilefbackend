import { Test, TestingModule } from '@nestjs/testing';
import { ConciliacionController } from './conciliacion.controller';
import { ConciliacionService } from './conciliacion.service';
import { EstadoConciliacion } from './types/conciliacion.types';
import { Types } from 'mongoose';

describe('ConciliacionController', () => {
  let controller: ConciliacionController;
  let mockService: any;

  const mockDocument = {
    _id: new Types.ObjectId(),
    codigo: 'CON-001',
    cuentaBancaria: new Types.ObjectId(),
    periodo: '3-2024',
    saldoBanco: 50000,
    saldoLibros: 50000,
    diferencia: 0,
    fechaInicio: new Date('2024-03-01'),
    fechaFin: new Date('2024-03-31'),
    estado: EstadoConciliacion.PENDIENTE,
    observaciones: 'Test',
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      procesar: jest.fn(),
      getPendientes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConciliacionController],
      providers: [{ provide: ConciliacionService, useValue: mockService }],
    }).compile();

    controller = module.get<ConciliacionController>(ConciliacionController);
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
        codigo: 'CON-002',
        cuentaBancaria: new Types.ObjectId().toHexString(),
        periodo: '3-2024',
        saldoBanco: 50000,
        saldoLibros: 48000,
        observaciones: 'New conciliacion',
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

  describe('GET /pendientes', () => {
    it('should call service.getPendientes', async () => {
      mockService.getPendientes.mockResolvedValue([mockDocument]);
      const result = await controller.getPendientes();
      expect(mockService.getPendientes).toHaveBeenCalled();
      expect(result).toEqual([mockDocument]);
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
      const updateDto = { observaciones: 'Updated' };
      mockService.update.mockResolvedValue(mockDocument);
      const result = await controller.update(id, updateDto);
      expect(mockService.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('POST /:id/procesar', () => {
    it('should call service.procesar with id', async () => {
      const id = new Types.ObjectId().toHexString();
      mockService.procesar.mockResolvedValue(mockDocument);
      const result = await controller.procesar(id);
      expect(mockService.procesar).toHaveBeenCalledWith(id);
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
