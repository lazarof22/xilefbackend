import { Test, TestingModule } from '@nestjs/testing';
import { ActivoFijoController } from './activo_fijo.controller';
import { ActivoFijoService } from './activo_fijo.service';
import { MetodoDepreciacion } from './schema/activo_fijo.schema';
import { Types } from 'mongoose';

describe('ActivoFijoController', () => {
  let controller: ActivoFijoController;
  let mockService: any;

  const mockDocument = {
    _id: new Types.ObjectId(),
    codigoActivo: 'ACT-001',
    descripcionActivo: 'Test Asset',
    valorAdquisicion: 10000,
    valorResidual: 1000,
    vidaUtil: 5,
    fechaCompra: new Date('2024-01-01'),
    proveedor: new Types.ObjectId(),
    area: new Types.ObjectId(),
    estadoActivo: new Types.ObjectId(),
    tasaDepreciacion: new Types.ObjectId(),
    moneda: new Types.ObjectId(),
    metodoDepreciacion: MetodoDepreciacion.LINEA_RECTA,
    depreciacionAnual: 1800,
    depreciacionMensual: 150,
    depreciacionAcumulada: 4350,
    valorEnLibros: 5650,
    activo: true,
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByArea: jest.fn(),
      findByEstado: jest.fn(),
      findActivos: jest.fn(),
      recalcularDepreciacion: jest.fn(),
      recalcularDepreciacionMasiva: jest.fn(),
      getEstadisticas: jest.fn(),
      getDepreciacionSchedule: jest.fn(),
      calcularDepreciacionLineaRecta: jest.fn(),
      calcularDepreciacionAcumuladaMensual: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivoFijoController],
      providers: [{ provide: ActivoFijoService, useValue: mockService }],
    }).compile();

    controller = module.get<ActivoFijoController>(ActivoFijoController);
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
        codigoActivo: 'ACT-002',
        descripcionActivo: 'New Asset',
        proveedor: new Types.ObjectId().toHexString(),
        area: new Types.ObjectId().toHexString(),
        fechaCompra: '2024-01-01',
        valorAdquisicion: 10000,
        valorResidual: 1000,
        vidaUtil: 5,
        tasaDepreciacion: new Types.ObjectId().toHexString(),
        moneda: new Types.ObjectId().toHexString(),
        estadoActivo: new Types.ObjectId().toHexString(),
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

  describe('GET /activos', () => {
    it('should call service.findActivos', async () => {
      mockService.findActivos.mockResolvedValue([mockDocument]);

      const result = await controller.findActivos();

      expect(mockService.findActivos).toHaveBeenCalled();
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('GET /estadisticas', () => {
    it('should call service.getEstadisticas', async () => {
      const stats = {
        totalActivos: 10,
        totalBajas: 2,
        valorAdquisicionTotal: 50000,
        depreciacionAcumuladaTotal: 15000,
        valorEnLibrosTotal: 35000,
        porEstado: [],
        porArea: [],
      };
      mockService.getEstadisticas.mockResolvedValue(stats);

      const result = await controller.getEstadisticas();

      expect(mockService.getEstadisticas).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('GET /depreciacion/schedule', () => {
    it('should call service.getDepreciacionSchedule', async () => {
      const schedule = [{ codigoActivo: 'ACT-001', depreciacionAnual: 1800 }];
      mockService.getDepreciacionSchedule.mockResolvedValue(schedule);

      const result = await controller.getDepreciacionSchedule();

      expect(mockService.getDepreciacionSchedule).toHaveBeenCalled();
      expect(result).toEqual(schedule);
    });
  });

  describe('GET /area/:areaId', () => {
    it('should call service.findByArea with areaId', async () => {
      const areaId = new Types.ObjectId().toHexString();
      mockService.findByArea.mockResolvedValue([mockDocument]);

      const result = await controller.findByArea(areaId);

      expect(mockService.findByArea).toHaveBeenCalledWith(areaId);
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('GET /estado/:estadoId', () => {
    it('should call service.findByEstado with estadoId', async () => {
      const estadoId = new Types.ObjectId().toHexString();
      mockService.findByEstado.mockResolvedValue([mockDocument]);

      const result = await controller.findByEstado(estadoId);

      expect(mockService.findByEstado).toHaveBeenCalledWith(estadoId);
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

  describe('GET /:id/depreciacion/anual', () => {
    it('should calculate annual depreciation', async () => {
      const id = new Types.ObjectId().toHexString();
      mockService.findOne.mockResolvedValue(mockDocument);
      mockService.calcularDepreciacionLineaRecta.mockReturnValue(1800);

      const result = await controller.calcularDepreciacionAnual(id);

      expect(mockService.findOne).toHaveBeenCalledWith(id);
      expect(mockService.calcularDepreciacionLineaRecta).toHaveBeenCalledWith(
        mockDocument.valorAdquisicion,
        mockDocument.valorResidual,
        mockDocument.vidaUtil,
      );
      expect(result).toEqual({
        activo: mockDocument.codigoActivo,
        descripcion: mockDocument.descripcionActivo,
        costoAdquisicion: mockDocument.valorAdquisicion,
        valorResidual: mockDocument.valorResidual,
        vidaUtilAnios: mockDocument.vidaUtil,
        depreciacionAnual: 1800,
      });
    });
  });

  describe('GET /:id/depreciacion/mensual', () => {
    it('should calculate monthly depreciation', async () => {
      const id = new Types.ObjectId().toHexString();
      mockService.findOne.mockResolvedValue(mockDocument);
      const depreciationResult = {
        depreciacionAnual: 1800,
        depreciacionMensual: 150,
        depreciacionAcumulada: 4350,
        valorEnLibros: 5650,
        fechaUltimaDepreciacion: new Date(),
      };
      mockService.calcularDepreciacionAcumuladaMensual.mockReturnValue(
        depreciationResult,
      );

      const result = await controller.calcularDepreciacionMensual(id);

      expect(mockService.findOne).toHaveBeenCalledWith(id);
      expect(
        mockService.calcularDepreciacionAcumuladaMensual,
      ).toHaveBeenCalledWith(
        mockDocument.valorAdquisicion,
        mockDocument.valorResidual,
        mockDocument.vidaUtil,
        mockDocument.fechaCompra,
      );
      expect(result).toEqual({
        activo: mockDocument.codigoActivo,
        descripcion: mockDocument.descripcionActivo,
        costoAdquisicion: mockDocument.valorAdquisicion,
        valorResidual: mockDocument.valorResidual,
        vidaUtilAnios: mockDocument.vidaUtil,
        fechaCompra: mockDocument.fechaCompra,
        ...depreciationResult,
      });
    });
  });

  describe('POST /:id/recalcular-depreciacion', () => {
    it('should call service.recalcularDepreciacion with id', async () => {
      const id = new Types.ObjectId().toHexString();
      mockService.recalcularDepreciacion.mockResolvedValue(mockDocument);

      const result = await controller.recalcularDepreciacion(id);

      expect(mockService.recalcularDepreciacion).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('POST /recalcular-depreciacion-masiva', () => {
    it('should call service.recalcularDepreciacionMasiva', async () => {
      const masivaResult = { modificados: 5 };
      mockService.recalcularDepreciacionMasiva.mockResolvedValue(masivaResult);

      const result = await controller.recalcularDepreciacionMasiva();

      expect(mockService.recalcularDepreciacionMasiva).toHaveBeenCalled();
      expect(result).toEqual(masivaResult);
    });
  });

  describe('PATCH /:id', () => {
    it('should call service.update with id and DTO', async () => {
      const id = new Types.ObjectId().toHexString();
      const updateDto = { descripcionActivo: 'Updated Asset' };
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
