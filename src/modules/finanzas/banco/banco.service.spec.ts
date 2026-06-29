import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BancoService } from './banco.service';
import { Banco } from './schema/banco.schema';
import { TipoCuentaBancaria } from './types/banco.types';
import { Types } from 'mongoose';

describe('BancoService', () => {
  let service: BancoService;
  let mockBancoModel: any;
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

    mockBancoModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockBancoModel.find = jest.fn(() => mockQueryBuilder);
    mockBancoModel.findOne = jest.fn(() => mockQueryBuilder);
    mockBancoModel.findById = jest.fn(() => mockQueryBuilder);
    mockBancoModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockBancoModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);

    mockDocument = {
      _id: new Types.ObjectId(),
      codigoBanco: 'BAN-001',
      nombreBanco: 'Banco Test',
      numeroCuenta: '123-456-789',
      tipoCuenta: TipoCuentaBancaria.CORRIENTE,
      moneda: new Types.ObjectId(),
      saldoInicial: 10000,
      saldoActual: 15000,
      fechaApertura: new Date('2024-01-01'),
      titular: 'Test Titular',
      activo: true,
      save: mockSave,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BancoService,
        { provide: getModelToken(Banco.name), useValue: mockBancoModel },
      ],
    }).compile();

    service = module.get<BancoService>(BancoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new banco', async () => {
      const createDto = {
        codigoBanco: 'BAN-002',
        nombreBanco: 'New Bank',
        numeroCuenta: '999-888-777',
        tipoCuenta: TipoCuentaBancaria.AHORRO,
        moneda: new Types.ObjectId().toHexString(),
        fechaApertura: '2024-06-01',
        titular: 'New Titular',
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      const result = await service.create(createDto);

      expect(mockBancoModel.findOne).toHaveBeenCalledWith({
        codigoBanco: 'BAN-002',
      });
      expect(mockBancoModel).toHaveBeenCalledWith(
        expect.objectContaining({
          codigoBanco: 'BAN-002',
          saldoInicial: 0,
          saldoActual: 0,
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should create with provided saldoInicial', async () => {
      const createDto = {
        codigoBanco: 'BAN-003',
        nombreBanco: 'Bank with Balance',
        numeroCuenta: '111-222-333',
        tipoCuenta: TipoCuentaBancaria.CORRIENTE,
        moneda: new Types.ObjectId().toHexString(),
        fechaApertura: '2024-06-01',
        titular: 'Titular',
        saldoInicial: 5000,
      };

      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      await service.create(createDto);

      expect(mockBancoModel).toHaveBeenCalledWith(
        expect.objectContaining({
          saldoInicial: 5000,
          saldoActual: 5000,
        }),
      );
    });

    it('should throw BadRequestException when codigoBanco already exists', async () => {
      const createDto = {
        codigoBanco: 'BAN-001',
        nombreBanco: 'Duplicate',
        numeroCuenta: '000-000-000',
        tipoCuenta: TipoCuentaBancaria.CORRIENTE,
        moneda: new Types.ObjectId().toHexString(),
        fechaApertura: '2024-06-01',
        titular: 'Titular',
      };

      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all bancos populated and sorted', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockBancoModel.find).toHaveBeenCalled();
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('moneda');
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ codigoBanco: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a single banco', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.findOne(mockDocument._id.toHexString());
      expect(result).toEqual(mockDocument);
      expect(mockBancoModel.findById).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('moneda');
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when banco does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.findOne(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a banco', async () => {
      const updateDto = { nombreBanco: 'Updated Bank' };
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.update(
        mockDocument._id.toHexString(),
        updateDto,
      );
      expect(mockBancoModel.findByIdAndUpdate).toHaveBeenCalledWith(
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

    it('should throw NotFoundException when banco to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.update(new Types.ObjectId().toHexString(), {
          nombreBanco: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a banco', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.remove(mockDocument._id.toHexString());
      expect(result).toEqual({ deleted: true });
      expect(mockBancoModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
      );
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when banco to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.remove(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSaldos', () => {
    it('should return active account balances', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.getSaldos();
      expect(mockBancoModel.find).toHaveBeenCalledWith({ activo: true });
      expect(mockQueryBuilder.populate).toHaveBeenCalledWith('moneda');
      expect(result).toEqual([
        {
          cuentaId: mockDocument._id.toString(),
          numeroCuenta: mockDocument.numeroCuenta,
          nombreBanco: mockDocument.nombreBanco,
          tipoCuenta: mockDocument.tipoCuenta,
          saldoActual: mockDocument.saldoActual,
        },
      ]);
    });

    it('should return empty array when no active accounts', async () => {
      mockQueryBuilder.exec.mockResolvedValue([]);
      const result = await service.getSaldos();
      expect(result).toEqual([]);
    });
  });

  describe('actualizarSaldo', () => {
    it('should add monto to saldoActual', async () => {
      const monto = 500;
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await service.actualizarSaldo(mockDocument._id.toHexString(), monto);

      expect(mockDocument.saldoActual).toBe(15500);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should subtract monto when negative', async () => {
      const monto = -200;
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await service.actualizarSaldo(mockDocument._id.toHexString(), monto);

      expect(mockDocument.saldoActual).toBe(14800);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw NotFoundException when cuenta does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(
        service.actualizarSaldo(new Types.ObjectId().toHexString(), 100),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
