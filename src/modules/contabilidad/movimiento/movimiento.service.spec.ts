import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { Movimiento, TipoMovimiento } from './schema/movimiento.schema';

describe('MovimientoService', () => {
  let service: MovimientoService;
  let mockMovimientoModel: any;
  let mockQuery: any;
  let mockSave: jest.Mock;

  const mockDocument = {
    _id: '507f1f77bcf86cd799439011',
    activoFijo: '507f1f77bcf86cd799439012',
    tipo: TipoMovimiento.ALTA,
    fechaMovimiento: new Date('2024-01-15'),
    descripcion: 'Movimiento de prueba',
  };

  const mockDocumentList = [
    mockDocument,
    {
      ...mockDocument,
      _id: '507f1f77bcf86cd799439013',
      tipo: TipoMovimiento.TRASLADO,
    },
  ];

  beforeEach(async () => {
    mockSave = jest.fn();

    mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockMovimientoModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockMovimientoModel.find = jest.fn().mockReturnValue(mockQuery);
    mockMovimientoModel.findById = jest.fn().mockReturnValue(mockQuery);
    mockMovimientoModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue(mockQuery);
    mockMovimientoModel.findByIdAndDelete = jest
      .fn()
      .mockReturnValue(mockQuery);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientoService,
        {
          provide: getModelToken(Movimiento.name),
          useValue: mockMovimientoModel,
        },
      ],
    }).compile();

    service = module.get<MovimientoService>(MovimientoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new movimiento', async () => {
      const dto = {
        activoFijo: '507f1f77bcf86cd799439012',
        tipo: TipoMovimiento.ALTA,
        fechaMovimiento: '2024-01-15',
        descripcion: 'Movimiento de prueba',
      };
      mockSave.mockResolvedValue(mockDocument);

      const result = await service.create(dto as any);

      expect(mockMovimientoModel).toHaveBeenCalledWith(dto);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return all movimientos sorted by fechaMovimiento desc with populations', async () => {
      mockQuery.exec.mockResolvedValue(mockDocumentList);

      const result = await service.findAll();

      expect(mockMovimientoModel.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith('activoFijo');
      expect(mockQuery.populate).toHaveBeenCalledWith('areaOrigen');
      expect(mockQuery.populate).toHaveBeenCalledWith('areaDestino');
      expect(mockQuery.populate).toHaveBeenCalledWith('estadoAnterior');
      expect(mockQuery.populate).toHaveBeenCalledWith('estadoNuevo');
      expect(mockQuery.populate).toHaveBeenCalledWith('proveedorReparacion');
      expect(mockQuery.sort).toHaveBeenCalledWith({ fechaMovimiento: -1 });
      expect(result).toEqual(mockDocumentList);
    });
  });

  describe('findOne', () => {
    it('should return a movimiento by id with populations', async () => {
      mockQuery.exec.mockResolvedValue(mockDocument);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(mockMovimientoModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(mockQuery.populate).toHaveBeenCalledWith('activoFijo');
      expect(mockQuery.populate).toHaveBeenCalledWith('proveedorReparacion');
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockMovimientoModel.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when document not found', async () => {
      mockQuery.exec.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByActivo', () => {
    it('should return movimientos for a specific activo', async () => {
      mockQuery.exec.mockResolvedValue(mockDocumentList);

      const result = await service.findByActivo('507f1f77bcf86cd799439012');

      expect(mockMovimientoModel.find).toHaveBeenCalledWith({
        activoFijo: '507f1f77bcf86cd799439012',
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('areaOrigen');
      expect(mockQuery.populate).toHaveBeenCalledWith('areaDestino');
      expect(mockQuery.populate).toHaveBeenCalledWith('estadoAnterior');
      expect(mockQuery.populate).toHaveBeenCalledWith('estadoNuevo');
      expect(mockQuery.sort).toHaveBeenCalledWith({ fechaMovimiento: -1 });
      expect(result).toEqual(mockDocumentList);
    });

    it('should throw NotFoundException for invalid activoId', async () => {
      await expect(service.findByActivo('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a movimiento and return the updated document', async () => {
      const updateDto = { descripcion: 'Actualizado' };
      const updatedDoc = { ...mockDocument, descripcion: 'Actualizado' };
      mockQuery.exec.mockResolvedValue(updatedDoc);

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateDto as any,
      );

      expect(mockMovimientoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.update('bad-id', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when document not found', async () => {
      mockQuery.exec.mockResolvedValue(null);

      await expect(
        service.update('507f1f77bcf86cd799439011', {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a movimiento and return deleted true', async () => {
      mockQuery.exec.mockResolvedValue(mockDocument);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(mockMovimientoModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockQuery.exec.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTiposMovimiento', () => {
    it('should return all 8 TipoMovimiento enum values', async () => {
      const result = await service.getTiposMovimiento();

      expect(result).toEqual(Object.values(TipoMovimiento));
      expect(result).toHaveLength(8);
      expect(result).toContain('alta');
      expect(result).toContain('modificacion');
      expect(result).toContain('traslado');
      expect(result).toContain('baja_parcial');
      expect(result).toContain('baja_total');
      expect(result).toContain('revaluacion');
      expect(result).toContain('depreciacion');
      expect(result).toContain('reparacion');
    });
  });
});
