import { Test, TestingModule } from '@nestjs/testing';
import { ConteoFisicoController } from './conteo_fisico.controller';
import { ConteoFisicoService } from './conteo_fisico.service';
import { EstadoConteo } from './schema/conteo_fisico.schema';
import { ResultadoConteo } from './schema/conteo_detalle.schema';
import { Types } from 'mongoose';

describe('ConteoFisicoController', () => {
  let controller: ConteoFisicoController;
  let mockService: any;

  const conteoId = new Types.ObjectId().toHexString();

  const mockConteo = {
    _id: conteoId,
    codigoConteo: 'CONT-001',
    fechaProgramada: new Date('2025-06-01'),
    estado: EstadoConteo.PROGRAMADO,
    totalActivosSistema: 100,
    totalActivosContados: 0,
    totalCoincidentes: 0,
    totalDiscrepancias: 0,
    totalSobrantes: 0,
    totalFaltantes: 0,
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      iniciarConteo: jest.fn(),
      completarConteo: jest.fn(),
      getDetalles: jest.fn(),
      agregarDetalle: jest.fn(),
      getResumenDiscrepancias: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConteoFisicoController],
      providers: [{ provide: ConteoFisicoService, useValue: mockService }],
    }).compile();

    controller = module.get<ConteoFisicoController>(ConteoFisicoController);
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
        codigoConteo: 'CONT-001',
        fechaProgramada: '2025-06-01',
        totalActivosSistema: 100,
      };
      mockService.create.mockResolvedValue(mockConteo);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockConteo);
    });
  });

  describe('GET /', () => {
    it('should call service.findAll', async () => {
      mockService.findAll.mockResolvedValue([mockConteo]);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockConteo]);
    });
  });

  describe('GET /discrepancias', () => {
    it('should call service.getResumenDiscrepancias', async () => {
      const discrepancias = [
        { _id: ResultadoConteo.SOBRANTE, total: 3 },
      ];
      mockService.getResumenDiscrepancias.mockResolvedValue(discrepancias);

      const result = await controller.getResumenDiscrepancias();

      expect(mockService.getResumenDiscrepancias).toHaveBeenCalled();
      expect(result).toEqual(discrepancias);
    });
  });

  describe('GET /:id', () => {
    it('should call service.findOne with id', async () => {
      mockService.findOne.mockResolvedValue(mockConteo);

      const result = await controller.findOne(conteoId);

      expect(mockService.findOne).toHaveBeenCalledWith(conteoId);
      expect(result).toEqual(mockConteo);
    });
  });

  describe('GET /:id/detalles', () => {
    it('should call service.getDetalles with id', async () => {
      const detalles = [{ _id: new Types.ObjectId(), resultado: ResultadoConteo.COINCIDE }];
      mockService.getDetalles.mockResolvedValue(detalles);

      const result = await controller.getDetalles(conteoId);

      expect(mockService.getDetalles).toHaveBeenCalledWith(conteoId);
      expect(result).toEqual(detalles);
    });
  });

  describe('PATCH /:id', () => {
    it('should call service.update with id and DTO', async () => {
      const updateDto = { observaciones: 'Updated' };
      mockService.update.mockResolvedValue(mockConteo);

      const result = await controller.update(conteoId, updateDto);

      expect(mockService.update).toHaveBeenCalledWith(conteoId, updateDto);
      expect(result).toEqual(mockConteo);
    });
  });

  describe('POST /:id/iniciar', () => {
    it('should call service.iniciarConteo with id', async () => {
      const conteoIniciado = { ...mockConteo, estado: EstadoConteo.EN_PROCESO };
      mockService.iniciarConteo.mockResolvedValue(conteoIniciado);

      const result = await controller.iniciarConteo(conteoId);

      expect(mockService.iniciarConteo).toHaveBeenCalledWith(conteoId);
      expect(result).toEqual(conteoIniciado);
    });
  });

  describe('POST /:id/completar', () => {
    it('should call service.completarConteo with id', async () => {
      const conteoCompletado = { ...mockConteo, estado: EstadoConteo.COMPLETADO, totalActivosContados: 3 };
      mockService.completarConteo.mockResolvedValue(conteoCompletado);

      const result = await controller.completarConteo(conteoId);

      expect(mockService.completarConteo).toHaveBeenCalledWith(conteoId);
      expect(result).toEqual(conteoCompletado);
    });
  });

  describe('POST /detalles', () => {
    it('should call service.agregarDetalle with DTO', async () => {
      const detalleDto = {
        conteoFisico: conteoId,
        resultado: ResultadoConteo.COINCIDE,
        cantidadSistema: 1,
      };
      const mockDetalle = { _id: new Types.ObjectId(), ...detalleDto };
      mockService.agregarDetalle.mockResolvedValue(mockDetalle);

      const result = await controller.agregarDetalle(detalleDto);

      expect(mockService.agregarDetalle).toHaveBeenCalledWith(detalleDto);
      expect(result).toEqual(mockDetalle);
    });
  });

  describe('DELETE /:id', () => {
    it('should call service.remove with id', async () => {
      mockService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(conteoId);

      expect(mockService.remove).toHaveBeenCalledWith(conteoId);
      expect(result).toEqual({ deleted: true });
    });
  });
});
