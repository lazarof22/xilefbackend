import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CuentaPagarService } from './cuenta-pagar.service';
import { CuentaPagar } from './schema/cuenta-pagar.schema';
import { EstadoCxP } from './types/cuenta-pagar.types';
import { Types } from 'mongoose';

describe('CuentaPagarService', () => {
  let service: CuentaPagarService;
  let mockCxpModel: any;
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

    mockCxpModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockCxpModel.find = jest.fn(() => mockQueryBuilder);
    mockCxpModel.findOne = jest.fn(() => mockQueryBuilder);
    mockCxpModel.findById = jest.fn(() => mockQueryBuilder);
    mockCxpModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockCxpModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);
    mockCxpModel.aggregate = jest.fn(() => mockQueryBuilder);

    mockDocument = {
      _id: new Types.ObjectId(),
      codigo: 'CXP-001',
      proveedor: new Types.ObjectId(),
      concepto: new Types.ObjectId(),
      montoOriginal: 5000,
      saldoPendiente: 5000,
      fechaEmision: new Date('2024-01-01'),
      fechaVencimiento: new Date('2024-02-01'),
      estado: EstadoCxP.PENDIENTE,
      notas: 'Test note',
      save: mockSave,
    };

    mockSave.mockResolvedValue(mockDocument);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentaPagarService,
        { provide: getModelToken(CuentaPagar.name), useValue: mockCxpModel },
      ],
    }).compile();

    service = module.get<CuentaPagarService>(CuentaPagarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cuenta-pagar', async () => {
      const createDto = {
        codigo: 'CXP-002',
        proveedor: new Types.ObjectId().toHexString(),
        concepto: new Types.ObjectId().toHexString(),
        montoOriginal: 3000,
        fechaEmision: '2024-03-01',
        fechaVencimiento: '2024-04-01',
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      const result = await service.create(createDto);

      expect(mockCxpModel.findOne).toHaveBeenCalledWith({ codigo: 'CXP-002' });
      expect(mockCxpModel).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: 'CXP-002',
          montoOriginal: 3000,
          saldoPendiente: 3000,
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should throw BadRequestException when codigo already exists', async () => {
      const createDto = {
        codigo: 'CXP-001',
        proveedor: new Types.ObjectId().toHexString(),
        concepto: new Types.ObjectId().toHexString(),
        montoOriginal: 3000,
        fechaEmision: '2024-03-01',
        fechaVencimiento: '2024-04-01',
      };

      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all cuentas por pagar populated and sorted', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockCxpModel.find).toHaveBeenCalled();
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('proveedor');
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('concepto');
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ fechaEmision: -1 });
    });
  });

  describe('findOne', () => {
    it('should return a single cuenta-pagar', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.findOne(mockDocument._id.toHexString());
      expect(result).toEqual(mockDocument);
      expect(mockCxpModel.findById).toHaveBeenCalledWith(mockDocument._id.toHexString());
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when cuenta-pagar does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.findOne(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cuenta-pagar', async () => {
      const updateDto = { notas: 'Updated notes' };
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.update(mockDocument._id.toHexString(), updateDto);
      expect(mockCxpModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        updateDto,
        { new: true },
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when cuenta-pagar to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.update(new Types.ObjectId().toHexString(), { notas: 'test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a cuenta-pagar', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.remove(mockDocument._id.toHexString());
      expect(result).toEqual({ deleted: true });
      expect(mockCxpModel.findByIdAndDelete).toHaveBeenCalledWith(mockDocument._id.toHexString());
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when cuenta-pagar to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.remove(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVencidas', () => {
    it('should return overdue cuentas por pagar', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.getVencidas();
      expect(mockCxpModel.find).toHaveBeenCalledWith({
        estado: { $in: [EstadoCxP.PENDIENTE, EstadoCxP.PARCIAL, EstadoCxP.VENCIDA] },
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
    });
  });

  describe('abonar', () => {
    it('should apply full payment and mark as PAGADA', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      const result = await service.abonar(mockDocument._id.toHexString(), { monto: 5000 });

      expect(mockDocument.saldoPendiente).toBe(0);
      expect(mockDocument.estado).toBe(EstadoCxP.PAGADA);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should apply partial payment and mark as PARCIAL', async () => {
      const doc = { ...mockDocument, saldoPendiente: 5000, estado: EstadoCxP.PENDIENTE, save: mockSave };
      mockQueryBuilder.exec.mockResolvedValue(doc);

      const result = await service.abonar(doc._id.toHexString(), { monto: 2000 });

      expect(doc.saldoPendiente).toBe(3000);
      expect(doc.estado).toBe(EstadoCxP.PARCIAL);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw BadRequestException when account is already PAGADA', async () => {
      const doc = { ...mockDocument, estado: EstadoCxP.PAGADA, save: mockSave };
      mockQueryBuilder.exec.mockResolvedValue(doc);

      await expect(service.abonar(doc._id.toHexString(), { monto: 1000 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when monto exceeds saldoPendiente', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.abonar(mockDocument._id.toHexString(), { monto: 9999 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when monto is negative', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.abonar(mockDocument._id.toHexString(), { monto: -100 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when monto is zero', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.abonar(mockDocument._id.toHexString(), { monto: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.abonar('invalid-id', { monto: 100 })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when cuenta-pagar does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.abonar(new Types.ObjectId().toHexString(), { monto: 100 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getResumen', () => {
    it('should return summary with total pendiente and por estado', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce([{ total: 15000 }])
        .mockResolvedValueOnce([
          { _id: EstadoCxP.PENDIENTE, cantidad: 3, total: 9000 },
          { _id: EstadoCxP.PARCIAL, cantidad: 2, total: 6000 },
        ]);

      const result = await service.getResumen();

      expect(result).toEqual({
        totalPendiente: 15000,
        porEstado: [
          { _id: EstadoCxP.PENDIENTE, cantidad: 3, total: 9000 },
          { _id: EstadoCxP.PARCIAL, cantidad: 2, total: 6000 },
        ],
      });
    });

    it('should return zero totalPendiente when aggregate is empty', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getResumen();

      expect(result.totalPendiente).toBe(0);
    });
  });
});
