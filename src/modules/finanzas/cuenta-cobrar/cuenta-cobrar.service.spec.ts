import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CuentaCobrarService } from './cuenta-cobrar.service';
import { CuentaCobrar } from './schema/cuenta-cobrar.schema';
import { EstadoCxC } from './types/cuenta-cobrar.types';
import { Types } from 'mongoose';

describe('CuentaCobrarService', () => {
  let service: CuentaCobrarService;
  let mockCxcModel: any;
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

    mockCxcModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockCxcModel.find = jest.fn(() => mockQueryBuilder);
    mockCxcModel.findOne = jest.fn(() => mockQueryBuilder);
    mockCxcModel.findById = jest.fn(() => mockQueryBuilder);
    mockCxcModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockCxcModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);
    mockCxcModel.aggregate = jest.fn(() => mockQueryBuilder);

    mockDocument = {
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
      save: mockSave,
    };

    mockSave.mockResolvedValue(mockDocument);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentaCobrarService,
        { provide: getModelToken(CuentaCobrar.name), useValue: mockCxcModel },
      ],
    }).compile();

    service = module.get<CuentaCobrarService>(CuentaCobrarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cuenta-cobrar', async () => {
      const createDto = {
        codigo: 'CXC-002',
        cliente: new Types.ObjectId().toHexString(),
        concepto: new Types.ObjectId().toHexString(),
        montoOriginal: 3000,
        fechaEmision: '2024-03-01',
        fechaVencimiento: '2024-04-01',
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      const result = await service.create(createDto);

      expect(mockCxcModel.findOne).toHaveBeenCalledWith({ codigo: 'CXC-002' });
      expect(mockCxcModel).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: 'CXC-002',
          montoOriginal: 3000,
          saldoPendiente: 3000,
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should throw BadRequestException when codigo already exists', async () => {
      const createDto = {
        codigo: 'CXC-001',
        cliente: new Types.ObjectId().toHexString(),
        concepto: new Types.ObjectId().toHexString(),
        montoOriginal: 3000,
        fechaEmision: '2024-03-01',
        fechaVencimiento: '2024-04-01',
      };

      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all cuentas por cobrar populated and sorted', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockCxcModel.find).toHaveBeenCalled();
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('cliente');
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('concepto');
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ fechaEmision: -1 });
    });
  });

  describe('findOne', () => {
    it('should return a single cuenta-cobrar', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.findOne(mockDocument._id.toHexString());
      expect(result).toEqual(mockDocument);
      expect(mockCxcModel.findById).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when cuenta-cobrar does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.findOne(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cuenta-cobrar', async () => {
      const updateDto = { notas: 'Updated notes' };
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.update(
        mockDocument._id.toHexString(),
        updateDto,
      );
      expect(mockCxcModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        updateDto,
        { new: true },
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when cuenta-cobrar to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.update(new Types.ObjectId().toHexString(), { notas: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a cuenta-cobrar', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.remove(mockDocument._id.toHexString());
      expect(result).toEqual({ deleted: true });
      expect(mockCxcModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when cuenta-cobrar to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.remove(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVencidas', () => {
    it('should return overdue cuentas por cobrar', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.getVencidas();
      expect(mockCxcModel.find).toHaveBeenCalledWith({
        estado: {
          $in: [EstadoCxC.PENDIENTE, EstadoCxC.PARCIAL, EstadoCxC.VENCIDA],
        },
        fechaVencimiento: { $lt: expect.any(Date) },
      });
      expect(result).toEqual([mockDocument]);
    });

    it('should return empty array when no overdue accounts', async () => {
      mockQueryBuilder.exec.mockResolvedValue([]);
      const result = await service.getVencidas();
      expect(result).toEqual([]);
    });
  });

  describe('getEnvejecimiento', () => {
    it('should return aging analysis with 4 ranges', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.getEnvejecimiento();
      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('rango');
      expect(result[0]).toHaveProperty('cantidad');
      expect(result[0]).toHaveProperty('montoTotal');
      expect(result[0]).toHaveProperty('porcentaje');
    });
  });

  describe('abonar', () => {
    it('should apply full payment and mark as PAGADA', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      const result = await service.abonar(mockDocument._id.toHexString(), {
        monto: 5000,
      });

      expect(mockDocument.saldoPendiente).toBe(0);
      expect(mockDocument.estado).toBe(EstadoCxC.PAGADA);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should apply partial payment and mark as PARCIAL', async () => {
      const doc = {
        ...mockDocument,
        saldoPendiente: 5000,
        estado: EstadoCxC.PENDIENTE,
        save: mockSave,
      };
      mockQueryBuilder.exec.mockResolvedValue(doc);

      const result = await service.abonar(doc._id.toHexString(), {
        monto: 2000,
      });

      expect(doc.saldoPendiente).toBe(3000);
      expect(doc.estado).toBe(EstadoCxC.PARCIAL);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw BadRequestException when account is already PAGADA', async () => {
      const doc = { ...mockDocument, estado: EstadoCxC.PAGADA, save: mockSave };
      mockQueryBuilder.exec.mockResolvedValue(doc);

      await expect(
        service.abonar(doc._id.toHexString(), { monto: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when account is CASTIGADA', async () => {
      const doc = {
        ...mockDocument,
        estado: EstadoCxC.CASTIGADA,
        save: mockSave,
      };
      mockQueryBuilder.exec.mockResolvedValue(doc);

      await expect(
        service.abonar(doc._id.toHexString(), { monto: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when monto exceeds saldoPendiente', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(
        service.abonar(mockDocument._id.toHexString(), { monto: 9999 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when monto is negative', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(
        service.abonar(mockDocument._id.toHexString(), { monto: -100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when monto is zero', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(
        service.abonar(mockDocument._id.toHexString(), { monto: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(
        service.abonar('invalid-id', { monto: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when cuenta-cobrar does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.abonar(new Types.ObjectId().toHexString(), { monto: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getResumen', () => {
    it('should return summary with total pendiente and por estado', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce([{ total: 15000 }])
        .mockResolvedValueOnce([
          { _id: EstadoCxC.PENDIENTE, cantidad: 3, total: 9000 },
          { _id: EstadoCxC.PARCIAL, cantidad: 2, total: 6000 },
        ]);

      const result = await service.getResumen();

      expect(result).toEqual({
        totalPendiente: 15000,
        porEstado: [
          { _id: EstadoCxC.PENDIENTE, cantidad: 3, total: 9000 },
          { _id: EstadoCxC.PARCIAL, cantidad: 2, total: 6000 },
        ],
      });
    });

    it('should return zero totalPendiente when aggregate is empty', async () => {
      mockQueryBuilder.exec.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await service.getResumen();

      expect(result.totalPendiente).toBe(0);
    });
  });
});
