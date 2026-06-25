import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ActivoFijoService } from './activo_fijo.service';
import { ActivoFijo, MetodoDepreciacion } from './schema/activo_fijo.schema';
import { Types } from 'mongoose';

describe('ActivoFijoService', () => {
  let service: ActivoFijoService;
  let mockActivoModel: any;
  let mockQueryBuilder: any;
  let mockSave: jest.Mock;
  let mockDocument: any;

  beforeEach(async () => {
    mockSave = jest.fn();

    mockQueryBuilder = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockActivoModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockActivoModel.find = jest.fn(() => mockQueryBuilder);
    mockActivoModel.findOne = jest.fn(() => mockQueryBuilder);
    mockActivoModel.findById = jest.fn(() => mockQueryBuilder);
    mockActivoModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockActivoModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);
    mockActivoModel.countDocuments = jest.fn(() => mockQueryBuilder);
    mockActivoModel.aggregate = jest.fn(() => mockQueryBuilder);
    mockActivoModel.insertMany = jest.fn();

    mockDocument = {
      _id: new Types.ObjectId(),
      codigoActivo: 'ACT-001',
      descripcionActivo: 'Test Asset',
      marca: 'Test Brand',
      modelo: 'Test Model',
      numeroSerie: 'SN-001',
      proveedor: new Types.ObjectId(),
      area: new Types.ObjectId(),
      grupoActivo: new Types.ObjectId(),
      fechaCompra: new Date('2024-01-01'),
      fechaPuestaMarcha: new Date('2024-01-15'),
      valorAdquisicion: 10000,
      valorResidual: 1000,
      vidaUtil: 5,
      tasaDepreciacion: new Types.ObjectId(),
      metodoDepreciacion: MetodoDepreciacion.LINEA_RECTA,
      depreciacionAnual: 1800,
      depreciacionMensual: 150,
      depreciacionAcumulada: 4350,
      valorEnLibros: 5650,
      moneda: new Types.ObjectId(),
      pais: new Types.ObjectId(),
      concepto: new Types.ObjectId(),
      estadoActivo: new Types.ObjectId(),
      cuentaDebe: new Types.ObjectId(),
      cuentaHaber: new Types.ObjectId(),
      cuentaDepreciacion: new Types.ObjectId(),
      numeroFactura: 'FAC-001',
      ordenCompra: 'OC-001',
      observaciones: 'Test observation',
      ajusteValor: 0,
      fechaUltimaDepreciacion: new Date('2024-06-01'),
      activo: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivoFijoService,
        { provide: getModelToken(ActivoFijo.name), useValue: mockActivoModel },
      ],
    }).compile();

    service = module.get<ActivoFijoService>(ActivoFijoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new activo with depreciation calculation', async () => {
      const createDto = {
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

      mockSave.mockResolvedValue(mockDocument);
      const result = await service.create(createDto);

      expect(mockActivoModel).toHaveBeenCalledWith(
        expect.objectContaining({
          codigoActivo: 'ACT-002',
          valorAdquisicion: 10000,
          valorResidual: 1000,
          vidaUtil: 5,
          depreciacionAnual: expect.any(Number),
          depreciacionMensual: expect.any(Number),
          depreciacionAcumulada: expect.any(Number),
          valorEnLibros: expect.any(Number),
          activo: true,
          ajusteValor: 0,
          fechaUltimaDepreciacion: expect.any(Date),
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should throw BadRequestException when valorResidual >= valorAdquisicion', async () => {
      const createDto = {
        codigoActivo: 'ACT-003',
        descripcionActivo: 'Bad Asset',
        proveedor: new Types.ObjectId().toHexString(),
        area: new Types.ObjectId().toHexString(),
        fechaCompra: '2024-01-01',
        valorAdquisicion: 1000,
        valorResidual: 1000,
        vidaUtil: 5,
        tasaDepreciacion: new Types.ObjectId().toHexString(),
        moneda: new Types.ObjectId().toHexString(),
        estadoActivo: new Types.ObjectId().toHexString(),
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all activos populated', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockActivoModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single activo', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.findOne(mockDocument._id.toHexString());
      expect(result).toEqual(mockDocument);
      expect(mockActivoModel.findById).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when activo does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.findOne(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update without recalculation when depreciation fields are not changed', async () => {
      const updateDto = { descripcionActivo: 'Updated Description' };
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      const result = await service.update(
        mockDocument._id.toHexString(),
        updateDto,
      );

      expect(mockActivoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        { descripcionActivo: 'Updated Description' },
        { new: true },
      );
      expect(result).toEqual(mockDocument);
    });

    it('should update with recalculation when depreciation fields change', async () => {
      const updateDto = { valorAdquisicion: 20000, vidaUtil: 10 };
      mockQueryBuilder.exec
        .mockResolvedValueOnce(mockDocument)
        .mockResolvedValueOnce(mockDocument);

      const result = await service.update(
        mockDocument._id.toHexString(),
        updateDto,
      );

      expect(mockActivoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        expect.objectContaining({
          valorAdquisicion: 20000,
          vidaUtil: 10,
          depreciacionAnual: expect.any(Number),
        }),
        { new: true },
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when activo to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.update(new Types.ObjectId().toHexString(), {
          descripcionActivo: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an activo', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.remove(mockDocument._id.toHexString());
      expect(result).toEqual({ deleted: true });
      expect(mockActivoModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when activo to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.remove(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByArea', () => {
    it('should find activos by area', async () => {
      const areaId = new Types.ObjectId();
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findByArea(areaId.toHexString());
      expect(result).toEqual([mockDocument]);
      expect(mockActivoModel.find).toHaveBeenCalledWith({
        area: areaId.toHexString(),
      });
    });

    it('should throw NotFoundException for invalid area ObjectId', async () => {
      await expect(service.findByArea('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEstado', () => {
    it('should find activos by estado', async () => {
      const estadoId = new Types.ObjectId();
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findByEstado(estadoId.toHexString());
      expect(result).toEqual([mockDocument]);
      expect(mockActivoModel.find).toHaveBeenCalledWith({
        estadoActivo: estadoId.toHexString(),
      });
    });

    it('should throw NotFoundException for invalid estado ObjectId', async () => {
      await expect(service.findByEstado('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findActivos', () => {
    it('should return only active assets', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findActivos();
      expect(result).toEqual([mockDocument]);
      expect(mockActivoModel.find).toHaveBeenCalledWith({ activo: true });
    });
  });

  describe('recalcularDepreciacion', () => {
    it('should recalculate depreciation and update the activo', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce(mockDocument)
        .mockResolvedValueOnce(mockDocument);

      const result = await service.recalcularDepreciacion(
        mockDocument._id.toHexString(),
      );

      expect(mockActivoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        expect.objectContaining({
          depreciacionAnual: expect.any(Number),
          fechaUltimaDepreciacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(
        service.recalcularDepreciacion('invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recalcularDepreciacionMasiva', () => {
    it('should recalculate depreciation for all active activos', async () => {
      const secondDoc = { ...mockDocument, _id: new Types.ObjectId() };
      mockQueryBuilder.exec
        .mockResolvedValueOnce([mockDocument, secondDoc])
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await service.recalcularDepreciacionMasiva();

      expect(result).toEqual({ modificados: 2 });
      expect(mockActivoModel.find).toHaveBeenCalledWith({ activo: true });
    });
  });

  describe('getEstadisticas', () => {
    it('should return aggregated statistics', async () => {
      const estadoId1 = new Types.ObjectId();
      const estadoId2 = new Types.ObjectId();
      const areaId1 = new Types.ObjectId();
      mockQueryBuilder.exec
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce([{ total: 50000 }])
        .mockResolvedValueOnce([{ total: 15000 }])
        .mockResolvedValueOnce([{ total: 35000 }])
        .mockResolvedValueOnce([
          { _id: estadoId1, count: 5 },
          { _id: estadoId2, count: 3 },
        ])
        .mockResolvedValueOnce([{ _id: areaId1, count: 4, totalValor: 40000 }]);

      const result = await service.getEstadisticas();

      expect(result).toEqual({
        totalActivos: 10,
        totalBajas: 2,
        valorAdquisicionTotal: 50000,
        depreciacionAcumuladaTotal: 15000,
        valorEnLibrosTotal: 35000,
        porEstado: [
          { _id: estadoId1, count: 5 },
          { _id: estadoId2, count: 3 },
        ],
        porArea: [{ _id: areaId1, count: 4, totalValor: 40000 }],
      });
    });

    it('should return zero totals when aggregates are empty', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getEstadisticas();

      expect(result.valorAdquisicionTotal).toBe(0);
      expect(result.depreciacionAcumuladaTotal).toBe(0);
      expect(result.valorEnLibrosTotal).toBe(0);
    });
  });

  describe('getDepreciacionSchedule', () => {
    it('should return depreciation schedule', async () => {
      const scheduleData = [
        {
          codigoActivo: 'ACT-001',
          descripcionActivo: 'Test Asset',
          valorAdquisicion: 10000,
          valorResidual: 1000,
          vidaUtil: 5,
          depreciacionAnual: 1800,
          depreciacionMensual: 150,
          depreciacionAcumulada: 4350,
          valorEnLibros: 5650,
          fechaCompra: new Date('2024-01-01'),
          anosTranscurridos: 2,
        },
      ];
      mockQueryBuilder.exec.mockResolvedValue(scheduleData);

      const result = await service.getDepreciacionSchedule();

      expect(result).toEqual(scheduleData);
      expect(mockActivoModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('calcularDepreciacionLineaRecta', () => {
    it('should calculate straight-line depreciation correctly', () => {
      const result = service.calcularDepreciacionLineaRecta(10000, 1000, 5);
      expect(result).toBe(1800);
    });

    it('should handle zero valorResidual', () => {
      const result = service.calcularDepreciacionLineaRecta(5000, 0, 10);
      expect(result).toBe(500);
    });

    it('should handle vidaUtil of 1 year', () => {
      const result = service.calcularDepreciacionLineaRecta(2000, 500, 1);
      expect(result).toBe(1500);
    });

    it('should throw BadRequestException when valorResidual >= valorAdquisicion', () => {
      expect(() =>
        service.calcularDepreciacionLineaRecta(1000, 1000, 5),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when valorResidual is negative', () => {
      expect(() => service.calcularDepreciacionLineaRecta(1000, -1, 5)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when vidaUtil is zero', () => {
      expect(() =>
        service.calcularDepreciacionLineaRecta(1000, 100, 0),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when vidaUtil is negative', () => {
      expect(() =>
        service.calcularDepreciacionLineaRecta(1000, 100, -1),
      ).toThrow(BadRequestException);
    });
  });

  describe('calcularDepreciacionAcumuladaMensual', () => {
    it('should return complete depreciation data', () => {
      const result = service.calcularDepreciacionAcumuladaMensual(
        10000,
        1000,
        5,
        '2024-01-01',
      );

      expect(result).toEqual(
        expect.objectContaining({
          depreciacionAnual: expect.any(Number),
          depreciacionMensual: expect.any(Number),
          depreciacionAcumulada: expect.any(Number),
          valorEnLibros: expect.any(Number),
          fechaUltimaDepreciacion: expect.any(Date),
        }),
      );
      expect(result.depreciacionAnual).toBe(1800);
      expect(result.depreciacionMensual).toBe(150);
    });

    it('should throw BadRequestException for invalid depreciation data', () => {
      expect(() =>
        service.calcularDepreciacionAcumuladaMensual(
          1000,
          1000,
          5,
          '2024-01-01',
        ),
      ).toThrow(BadRequestException);
    });
  });
});
