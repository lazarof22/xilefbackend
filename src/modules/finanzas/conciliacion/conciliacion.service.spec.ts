import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConciliacionService } from './conciliacion.service';
import { Conciliacion } from './schema/conciliacion.schema';
import { EstadoConciliacion } from './types/conciliacion.types';
import { Types } from 'mongoose';

describe('ConciliacionService', () => {
  let service: ConciliacionService;
  let mockConciliacionModel: any;
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

    mockConciliacionModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockConciliacionModel.find = jest.fn(() => mockQueryBuilder);
    mockConciliacionModel.findOne = jest.fn(() => mockQueryBuilder);
    mockConciliacionModel.findById = jest.fn(() => mockQueryBuilder);
    mockConciliacionModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockConciliacionModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);

    mockDocument = {
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
      save: mockSave,
    };

    mockSave.mockResolvedValue(mockDocument);

    const mockExtractoModel = {
      find: jest.fn(() => mockQueryBuilder),
      findOne: jest.fn(() => mockQueryBuilder),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciliacionService,
        {
          provide: getModelToken(Conciliacion.name),
          useValue: mockConciliacionModel,
        },
        {
          provide: getModelToken('ExtractoMovimiento'),
          useValue: mockExtractoModel,
        },
      ],
    }).compile();

    service = module.get<ConciliacionService>(ConciliacionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conciliacion with auto-calculated fields', async () => {
      const createDto = {
        codigo: 'CON-002',
        cuentaBancaria: new Types.ObjectId().toHexString(),
        periodo: '3-2024',
        saldoBanco: 50000,
        saldoLibros: 48000,
        observaciones: 'Test conciliacion',
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      const result = await service.create(createDto);

      expect(mockConciliacionModel.findOne).toHaveBeenCalledWith({
        codigo: 'CON-002',
      });
      expect(mockConciliacionModel).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: 'CON-002',
          saldoBanco: 50000,
          saldoLibros: 48000,
          diferencia: 2000,
          fechaInicio: new Date(2024, 2, 1),
          fechaFin: new Date(2024, 3, 0),
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should calculate diferencia=0 when saldos are equal', async () => {
      const createDto = {
        codigo: 'CON-003',
        cuentaBancaria: new Types.ObjectId().toHexString(),
        periodo: '1-2024',
        saldoBanco: 30000,
        saldoLibros: 30000,
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      await service.create(createDto);

      expect(mockConciliacionModel).toHaveBeenCalledWith(
        expect.objectContaining({
          diferencia: 0,
        }),
      );
    });

    it('should handle December periodo correctly', async () => {
      const createDto = {
        codigo: 'CON-004',
        cuentaBancaria: new Types.ObjectId().toHexString(),
        periodo: '12-2024',
        saldoBanco: 10000,
        saldoLibros: 10000,
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      await service.create(createDto);

      expect(mockConciliacionModel).toHaveBeenCalledWith(
        expect.objectContaining({
          fechaInicio: new Date(2024, 11, 1),
          fechaFin: new Date(2024, 11, 31),
        }),
      );
    });

    it('should throw BadRequestException when codigo already exists', async () => {
      const createDto = {
        codigo: 'CON-001',
        cuentaBancaria: new Types.ObjectId().toHexString(),
        periodo: '3-2024',
        saldoBanco: 50000,
        saldoLibros: 50000,
      };

      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all conciliaciones populated and sorted', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockConciliacionModel.find).toHaveBeenCalled();
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('cuentaBancaria');
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ fechaFin: -1 });
    });
  });

  describe('findOne', () => {
    it('should return a single conciliacion', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.findOne(mockDocument._id.toHexString());
      expect(result).toEqual(mockDocument);
      expect(mockConciliacionModel.findById).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when conciliacion does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.findOne(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and recalculate diferencia when both saldos provided', async () => {
      const updateDto = { saldoBanco: 60000, saldoLibros: 55000 };
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      const result = await service.update(
        mockDocument._id.toHexString(),
        updateDto,
      );

      expect(mockConciliacionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        { saldoBanco: 60000, saldoLibros: 55000, diferencia: 5000 },
        { new: true },
      );
      expect(result).toEqual(mockDocument);
    });

    it('should update and recalculate when only saldoBanco provided', async () => {
      const existingDoc = {
        ...mockDocument,
        saldoLibros: 50000,
        save: mockSave,
      };
      mockConciliacionModel.findById = jest.fn(() => mockQueryBuilder);
      mockQueryBuilder.exec
        .mockResolvedValueOnce(existingDoc)
        .mockResolvedValueOnce(mockDocument);

      const updateDto = { saldoBanco: 55000 };

      await service.update(mockDocument._id.toHexString(), updateDto);

      expect(mockConciliacionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        { saldoBanco: 55000, diferencia: 5000 },
        { new: true },
      );
    });

    it('should update and recalculate when only saldoLibros provided', async () => {
      const existingDoc = {
        ...mockDocument,
        saldoBanco: 50000,
        save: mockSave,
      };
      mockConciliacionModel.findById = jest.fn(() => mockQueryBuilder);
      mockQueryBuilder.exec
        .mockResolvedValueOnce(existingDoc)
        .mockResolvedValueOnce(mockDocument);

      const updateDto = { saldoLibros: 45000 };

      await service.update(mockDocument._id.toHexString(), updateDto);

      expect(mockConciliacionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        { saldoLibros: 45000, diferencia: 5000 },
        { new: true },
      );
    });

    it('should update without recalculation when saldos not changed', async () => {
      const updateDto = { observaciones: 'Updated obs' };
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await service.update(mockDocument._id.toHexString(), updateDto);

      expect(mockConciliacionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        { observaciones: 'Updated obs' },
        { new: true },
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when conciliacion to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.update(new Types.ObjectId().toHexString(), {
          observaciones: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a conciliacion', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.remove(mockDocument._id.toHexString());
      expect(result).toEqual({ deleted: true });
      expect(mockConciliacionModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when conciliacion to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.remove(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('procesar', () => {
    it('should set estado to CONCILIADA when diferencia is 0', async () => {
      const doc = {
        ...mockDocument,
        saldoBanco: 50000,
        saldoLibros: 50000,
        diferencia: 0,
        estado: EstadoConciliacion.PENDIENTE,
        save: mockSave,
      };
      mockSave.mockResolvedValue(doc);
      mockQueryBuilder.exec.mockResolvedValue(doc);

      const result = await service.procesar(doc._id.toHexString());

      expect(doc.estado).toBe(EstadoConciliacion.CONCILIADA);
      expect(doc.diferencia).toBe(0);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should set estado to DIFERENCIA when diferencia is not 0', async () => {
      const doc = {
        ...mockDocument,
        saldoBanco: 50000,
        saldoLibros: 48000,
        diferencia: 2000,
        estado: EstadoConciliacion.PENDIENTE,
        save: mockSave,
      };
      mockSave.mockResolvedValue(doc);
      mockQueryBuilder.exec.mockResolvedValue(doc);

      const result = await service.procesar(doc._id.toHexString());

      expect(doc.estado).toBe(EstadoConciliacion.DIFERENCIA);
      expect(doc.diferencia).toBe(2000);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should recalculate diferencia before updating estado', async () => {
      const doc = {
        ...mockDocument,
        saldoBanco: 50000,
        saldoLibros: 50000,
        diferencia: 9999,
        estado: EstadoConciliacion.PENDIENTE,
        save: mockSave,
      };
      mockSave.mockResolvedValue(doc);
      mockQueryBuilder.exec.mockResolvedValue(doc);

      await service.procesar(doc._id.toHexString());

      expect(doc.diferencia).toBe(0);
      expect(doc.estado).toBe(EstadoConciliacion.CONCILIADA);
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.procesar('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when conciliacion does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.procesar(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPendientes', () => {
    it('should return pending conciliaciones', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.getPendientes();
      expect(mockConciliacionModel.find).toHaveBeenCalledWith({
        estado: {
          $in: [EstadoConciliacion.PENDIENTE, EstadoConciliacion.EN_PROCESO],
        },
      });
      expect(result).toEqual([mockDocument]);
    });

    it('should return empty array when no pending conciliaciones', async () => {
      mockQueryBuilder.exec.mockResolvedValue([]);
      const result = await service.getPendientes();
      expect(result).toEqual([]);
    });
  });
});
