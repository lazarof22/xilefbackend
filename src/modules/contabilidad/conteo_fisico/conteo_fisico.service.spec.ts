import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConteoFisicoService } from './conteo_fisico.service';
import { ConteoFisico, EstadoConteo } from './schema/conteo_fisico.schema';
import { ConteoDetalle, ResultadoConteo } from './schema/conteo_detalle.schema';
import { Types } from 'mongoose';

describe('ConteoFisicoService', () => {
  let service: ConteoFisicoService;
  let mockConteoModel: any;
  let mockDetalleModel: any;
  let mockQueryBuilder: any;
  let mockSave: jest.Mock;

  const conteoId = new Types.ObjectId();
  const mockConteo = {
    _id: conteoId,
    codigoConteo: 'CONT-001',
    fechaProgramada: new Date('2025-06-01'),
    estado: EstadoConteo.PROGRAMADO,
    area: new Types.ObjectId(),
    observaciones: 'Conteo anual',
    totalActivosSistema: 100,
    totalActivosContados: 0,
    totalCoincidentes: 0,
    totalDiscrepancias: 0,
    totalSobrantes: 0,
    totalFaltantes: 0,
    realizadoPor: 'Admin',
    save: jest.fn(),
  };

  const mockDetalle = {
    _id: new Types.ObjectId(),
    conteoFisico: conteoId,
    activoFijo: new Types.ObjectId(),
    codigoActivoSistema: 'ACT-001',
    descripcionActivoSistema: 'Test Asset',
    resultado: ResultadoConteo.COINCIDE,
    cantidadSistema: 1,
    cantidadReal: 1,
  };

  beforeEach(async () => {
    mockSave = jest.fn();

    mockQueryBuilder = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockConteoModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockConteoModel.findOne = jest.fn(() => mockQueryBuilder);
    mockConteoModel.find = jest.fn(() => mockQueryBuilder);
    mockConteoModel.findById = jest.fn(() => mockQueryBuilder);
    mockConteoModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockConteoModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);

    mockDetalleModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockDetalleModel.find = jest.fn(() => mockQueryBuilder);
    mockDetalleModel.deleteMany = jest.fn(() => mockQueryBuilder);
    mockDetalleModel.aggregate = jest.fn(() => mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConteoFisicoService,
        { provide: getModelToken(ConteoFisico.name), useValue: mockConteoModel },
        { provide: getModelToken(ConteoDetalle.name), useValue: mockDetalleModel },
      ],
    }).compile();

    service = module.get<ConteoFisicoService>(ConteoFisicoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conteo', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockConteo);
      const dto = {
        codigoConteo: 'CONT-001',
        fechaProgramada: '2025-06-01',
        totalActivosSistema: 100,
      };
      const result = await service.create(dto);
      expect(mockConteoModel).toHaveBeenCalledWith(
        expect.objectContaining({ codigoConteo: 'CONT-001' }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockConteo);
    });

    it('should throw BadRequestException when codigoConteo already exists', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockConteo);
      await expect(service.create({
        codigoConteo: 'CONT-001',
        fechaProgramada: '2025-06-01',
        totalActivosSistema: 100,
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all conteos sorted by fechaProgramada desc', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockConteo]);
      const result = await service.findAll();
      expect(result).toEqual([mockConteo]);
      expect(mockConteoModel.find).toHaveBeenCalled();
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('area');
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ fechaProgramada: -1 });
    });
  });

  describe('findOne', () => {
    it('should return a single conteo', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockConteo);
      const result = await service.findOne(conteoId.toHexString());
      expect(result).toEqual(mockConteo);
      expect(mockConteoModel.findById).toHaveBeenCalledWith(conteoId.toHexString());
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when conteo does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.findOne(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a conteo', async () => {
      const updateDto = { observaciones: 'Updated observation' };
      mockQueryBuilder.exec.mockResolvedValue(mockConteo);
      const result = await service.update(conteoId.toHexString(), updateDto);
      expect(mockConteoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        conteoId.toHexString(),
        updateDto,
        { new: true },
      );
      expect(result).toEqual(mockConteo);
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when conteo to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.update(new Types.ObjectId().toHexString(), { observaciones: 'test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a conteo and its detalles', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce(mockConteo)
        .mockResolvedValueOnce({ deletedCount: 5 });
      const result = await service.remove(conteoId.toHexString());
      expect(mockConteoModel.findByIdAndDelete).toHaveBeenCalledWith(conteoId.toHexString());
      expect(mockDetalleModel.deleteMany).toHaveBeenCalledWith({ conteoFisico: conteoId.toHexString() });
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when conteo to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.remove(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('iniciarConteo', () => {
    it('should change estado from PROGRAMADO to EN_PROCESO', async () => {
      const conteoEnProceso = {
        ...mockConteo,
        estado: EstadoConteo.PROGRAMADO,
        save: jest.fn().mockResolvedValue({ ...mockConteo, estado: EstadoConteo.EN_PROCESO }),
      };
      mockQueryBuilder.exec.mockResolvedValue(conteoEnProceso);
      const result = await service.iniciarConteo(conteoId.toHexString());
      expect(result.estado).toBe(EstadoConteo.EN_PROCESO);
    });

    it('should throw BadRequestException when estado is not PROGRAMADO', async () => {
      const conteoEnProceso = { ...mockConteo, estado: EstadoConteo.EN_PROCESO };
      mockQueryBuilder.exec.mockResolvedValue(conteoEnProceso);
      await expect(service.iniciarConteo(conteoId.toHexString())).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when conteo not found', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.iniciarConteo(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('completarConteo', () => {
    it('should complete conteo and calculate totals', async () => {
      const conteoEnProceso = {
        ...mockConteo,
        estado: EstadoConteo.EN_PROCESO,
        save: jest.fn().mockResolvedValue({
          ...mockConteo,
          estado: EstadoConteo.COMPLETADO,
          totalActivosContados: 3,
          totalCoincidentes: 1,
          totalSobrantes: 1,
          totalFaltantes: 1,
          totalDiscrepancias: 2,
          fechaRealizacion: expect.any(Date),
        }),
      };

      const detalles = [
        { ...mockDetalle, resultado: ResultadoConteo.COINCIDE },
        { ...mockDetalle, resultado: ResultadoConteo.SOBRANTE },
        { ...mockDetalle, resultado: ResultadoConteo.FALTANTE },
      ];

      mockQueryBuilder.exec
        .mockResolvedValueOnce(conteoEnProceso)
        .mockResolvedValueOnce(detalles);

      const result = await service.completarConteo(conteoId.toHexString());

      expect(result.estado).toBe(EstadoConteo.COMPLETADO);
      expect(result.totalActivosContados).toBe(3);
      expect(result.totalCoincidentes).toBe(1);
      expect(result.totalSobrantes).toBe(1);
      expect(result.totalFaltantes).toBe(1);
      expect(result.totalDiscrepancias).toBe(2);
      expect(result.fechaRealizacion).toBeDefined();
    });

    it('should throw BadRequestException when estado is not EN_PROCESO', async () => {
      const conteoProgramado = { ...mockConteo, estado: EstadoConteo.PROGRAMADO };
      mockQueryBuilder.exec.mockResolvedValue(conteoProgramado);
      await expect(service.completarConteo(conteoId.toHexString())).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.completarConteo('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDetalles', () => {
    it('should return detalles populated with activoFijo', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDetalle]);
      const result = await service.getDetalles(conteoId.toHexString());
      expect(result).toEqual([mockDetalle]);
      expect(mockDetalleModel.find).toHaveBeenCalledWith({ conteoFisico: conteoId.toHexString() });
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('activoFijo');
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.getDetalles('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('agregarDetalle', () => {
    it('should create a new detalle', async () => {
      mockSave.mockResolvedValue(mockDetalle);
      const dto = {
        conteoFisico: conteoId.toHexString(),
        resultado: ResultadoConteo.COINCIDE,
        cantidadSistema: 1,
      };
      const result = await service.agregarDetalle(dto);
      expect(mockDetalleModel).toHaveBeenCalledWith(
        expect.objectContaining({ conteoFisico: conteoId.toHexString() }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDetalle);
    });
  });

  describe('getResumenDiscrepancias', () => {
    it('should return aggregation of discrepancies', async () => {
      const aggResult = [
        { _id: ResultadoConteo.SOBRANTE, total: 3 },
        { _id: ResultadoConteo.FALTANTE, total: 5 },
        { _id: ResultadoConteo.DANADO, total: 1 },
      ];
      mockQueryBuilder.exec.mockResolvedValue(aggResult);
      const result = await service.getResumenDiscrepancias();
      expect(result).toEqual(aggResult);
      expect(mockDetalleModel.aggregate).toHaveBeenCalled();
    });
  });
});
