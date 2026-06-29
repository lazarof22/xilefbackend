import { Test, TestingModule } from '@nestjs/testing';
import { BancoController } from './banco.controller';
import { BancoService } from './banco.service';
import { TipoCuentaBancaria } from './types/banco.types';
import { Types } from 'mongoose';

describe('BancoController', () => {
  let controller: BancoController;
  let mockService: any;

  const mockDocument = {
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
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getSaldos: jest.fn(),
      actualizarSaldo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BancoController],
      providers: [{ provide: BancoService, useValue: mockService }],
    }).compile();

    controller = module.get<BancoController>(BancoController);
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
        codigoBanco: 'BAN-002',
        nombreBanco: 'New Bank',
        numeroCuenta: '999-888-777',
        tipoCuenta: TipoCuentaBancaria.AHORRO,
        moneda: new Types.ObjectId().toHexString(),
        fechaApertura: '2024-06-01',
        titular: 'New Titular',
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

  describe('GET /saldos', () => {
    it('should call service.getSaldos', async () => {
      const saldos = [
        {
          cuentaId: mockDocument._id.toString(),
          numeroCuenta: '123-456-789',
          nombreBanco: 'Banco Test',
          tipoCuenta: 'corriente',
          saldoActual: 15000,
        },
      ];
      mockService.getSaldos.mockResolvedValue(saldos);

      const result = await controller.getSaldos();

      expect(mockService.getSaldos).toHaveBeenCalled();
      expect(result).toEqual(saldos);
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
      const updateDto = { nombreBanco: 'Updated Bank' };
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
