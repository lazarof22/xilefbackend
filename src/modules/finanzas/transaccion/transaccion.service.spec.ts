import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { Transaccion } from './schema/transaccion.schema';
import { TipoTransaccion, MetodoPago } from './types/transaccion.types';
import { Types } from 'mongoose';

describe('TransaccionService', () => {
  let service: TransaccionService;
  let mockTransaccionModel: any;
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

    mockTransaccionModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockTransaccionModel.find = jest.fn(() => mockQueryBuilder);
    mockTransaccionModel.findOne = jest.fn(() => mockQueryBuilder);
    mockTransaccionModel.findById = jest.fn(() => mockQueryBuilder);
    mockTransaccionModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockTransaccionModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);
    mockTransaccionModel.aggregate = jest.fn(() => mockQueryBuilder);

    mockDocument = {
      _id: new Types.ObjectId(),
      codigo: 'TRX-001',
      tipo: TipoTransaccion.INGRESO,
      categoria: new Types.ObjectId(),
      monto: 1000,
      moneda: new Types.ObjectId(),
      fecha: new Date('2024-01-15'),
      metodoPago: MetodoPago.TRANSFERENCIA,
      referencia: 'REF-001',
      descripcion: 'Test transaction',
      cuentaBancaria: new Types.ObjectId(),
      cliente: new Types.ObjectId(),
      save: mockSave,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaccionService,
        {
          provide: getModelToken(Transaccion.name),
          useValue: mockTransaccionModel,
        },
      ],
    }).compile();

    service = module.get<TransaccionService>(TransaccionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new transaccion', async () => {
      const createDto = {
        codigo: 'TRX-002',
        tipo: TipoTransaccion.EGRESO,
        categoria: new Types.ObjectId().toHexString(),
        monto: 500,
        moneda: new Types.ObjectId().toHexString(),
        fecha: '2024-02-01',
        metodoPago: MetodoPago.EFECTIVO,
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      const result = await service.create(createDto);

      expect(mockTransaccionModel.findOne).toHaveBeenCalledWith({
        codigo: 'TRX-002',
      });
      expect(mockTransaccionModel).toHaveBeenCalledWith(createDto);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should throw BadRequestException when codigo already exists', async () => {
      const createDto = {
        codigo: 'TRX-001',
        tipo: TipoTransaccion.INGRESO,
        categoria: new Types.ObjectId().toHexString(),
        monto: 100,
        moneda: new Types.ObjectId().toHexString(),
        fecha: '2024-02-01',
        metodoPago: MetodoPago.EFECTIVO,
      };

      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all transacciones populated and sorted', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockTransaccionModel.find).toHaveBeenCalled();
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('categoria');
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('moneda');
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('cuentaBancaria');
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('cliente');
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('proveedor');
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ fecha: -1 });
    });
  });

  describe('findOne', () => {
    it('should return a single transaccion', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.findOne(mockDocument._id.toHexString());
      expect(result).toEqual(mockDocument);
      expect(mockTransaccionModel.findById).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when transaccion does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.findOne(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a transaccion', async () => {
      const updateDto = { descripcion: 'Updated description' };
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.update(
        mockDocument._id.toHexString(),
        updateDto,
      );
      expect(mockTransaccionModel.findByIdAndUpdate).toHaveBeenCalledWith(
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

    it('should throw NotFoundException when transaccion to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.update(new Types.ObjectId().toHexString(), {
          descripcion: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a transaccion', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.remove(mockDocument._id.toHexString());
      expect(result).toEqual({ deleted: true });
      expect(mockTransaccionModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when transaccion to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.remove(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPorPeriodo', () => {
    it('should return transacciones within date range', async () => {
      const desde = '2024-01-01';
      const hasta = '2024-01-31';
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);

      const result = await service.getPorPeriodo(desde, hasta);

      expect(mockTransaccionModel.find).toHaveBeenCalledWith({
        fecha: { $gte: new Date(desde), $lte: new Date(hasta) },
      });
      expect(result).toEqual([mockDocument]);
    });

    it('should return empty array when no transacciones in period', async () => {
      mockQueryBuilder.exec.mockResolvedValue([]);
      const result = await service.getPorPeriodo('2023-01-01', '2023-01-31');
      expect(result).toEqual([]);
    });
  });

  describe('getResumen', () => {
    it('should return summary with ingresos and egresos', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce([{ total: 10000, cantidad: 5 }])
        .mockResolvedValueOnce([{ total: 4000, cantidad: 3 }]);

      const result = await service.getResumen('2024-01-01', '2024-01-31');

      expect(result).toEqual({
        totalIngresos: 10000,
        totalEgresos: 4000,
        saldoNeto: 6000,
        cantidadIngresos: 5,
        cantidadEgresos: 3,
      });
    });

    it('should return summary without date filter when no params provided', async () => {
      mockQueryBuilder.exec
        .mockResolvedValueOnce([{ total: 5000, cantidad: 2 }])
        .mockResolvedValueOnce([{ total: 2000, cantidad: 1 }]);

      const result = await service.getResumen();

      expect(mockTransaccionModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        totalIngresos: 5000,
        totalEgresos: 2000,
        saldoNeto: 3000,
        cantidadIngresos: 2,
        cantidadEgresos: 1,
      });
    });

    it('should return zero totals when aggregates are empty', async () => {
      mockQueryBuilder.exec.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await service.getResumen();

      expect(result.totalIngresos).toBe(0);
      expect(result.totalEgresos).toBe(0);
      expect(result.saldoNeto).toBe(0);
      expect(result.cantidadIngresos).toBe(0);
      expect(result.cantidadEgresos).toBe(0);
    });
  });
});
