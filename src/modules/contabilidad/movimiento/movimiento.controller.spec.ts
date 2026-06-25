import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoController } from './movimiento.controller';
import { MovimientoService } from './movimiento.service';

describe('MovimientoController', () => {
  let controller: MovimientoController;
  let mockMovimientoService: any;

  beforeEach(async () => {
    mockMovimientoService = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      findByActivo: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
      getTiposMovimiento: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientoController],
      providers: [
        { provide: MovimientoService, useValue: mockMovimientoService },
      ],
    }).compile();

    controller = module.get<MovimientoController>(MovimientoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /', () => {
    it('should call service.create with the dto', async () => {
      const dto = {
        activoFijo: '507f1f77bcf86cd799439012',
        tipo: 'alta' as const,
        fechaMovimiento: '2024-01-15',
        descripcion: 'Movimiento de prueba',
      };
      const created = { _id: '507f1f77bcf86cd799439011', ...dto };
      mockMovimientoService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(mockMovimientoService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('GET /', () => {
    it('should call service.findAll', async () => {
      const list = [{ _id: '507f1f77bcf86cd799439011', descripcion: 'Test' }];
      mockMovimientoService.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(mockMovimientoService.findAll).toHaveBeenCalled();
      expect(result).toEqual(list);
    });
  });

  describe('GET /tipos', () => {
    it('should call service.getTiposMovimiento', async () => {
      const tipos = ['alta', 'baja_total', 'reparacion'];
      mockMovimientoService.getTiposMovimiento.mockResolvedValue(tipos);

      const result = await controller.getTipos();

      expect(mockMovimientoService.getTiposMovimiento).toHaveBeenCalled();
      expect(result).toEqual(tipos);
    });
  });

  describe('GET /activo/:activoId', () => {
    it('should call service.findByActivo with the activoId', async () => {
      const list = [{ _id: '1', activoFijo: '507f1f77bcf86cd799439012' }];
      mockMovimientoService.findByActivo.mockResolvedValue(list);

      const result = await controller.findByActivo('507f1f77bcf86cd799439012');

      expect(mockMovimientoService.findByActivo).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
      expect(result).toEqual(list);
    });
  });

  describe('GET /:id', () => {
    it('should call service.findOne with the id', async () => {
      const doc = { _id: '507f1f77bcf86cd799439011', descripcion: 'Test' };
      mockMovimientoService.findOne.mockResolvedValue(doc);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(mockMovimientoService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(doc);
    });
  });

  describe('PATCH /:id', () => {
    it('should call service.update with id and dto', async () => {
      const dto = { descripcion: 'Actualizado' };
      const updated = {
        _id: '507f1f77bcf86cd799439011',
        descripcion: 'Actualizado',
      };
      mockMovimientoService.update.mockResolvedValue(updated);

      const result = await controller.update(
        '507f1f77bcf86cd799439011',
        dto as any,
      );

      expect(mockMovimientoService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE /:id', () => {
    it('should call service.remove with the id', async () => {
      mockMovimientoService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(mockMovimientoService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual({ deleted: true });
    });
  });
});
