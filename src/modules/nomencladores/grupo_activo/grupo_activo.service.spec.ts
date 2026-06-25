import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GrupoActivoService } from './grupo_activo.service';
import { GrupoActivo } from './schema/grupo_activo.schema';
import { Types } from 'mongoose';

describe('GrupoActivoService', () => {
  let service: GrupoActivoService;
  let mockModel: any;
  let mockQueryBuilder: any;
  let mockSave: jest.Mock;

  const mockDocument = {
    _id: new Types.ObjectId(),
    codigo: 'COMP',
    nombre: 'Equipos de Computación',
    descripcion: 'Computadoras, servidores, impresoras',
    vidaUtilMinima: 3,
    vidaUtilMaxima: 4,
    tasaDepreciacionMinima: 25,
    tasaDepreciacionMaxima: 33,
    activo: true,
  };

  beforeEach(async () => {
    mockSave = jest.fn();

    mockQueryBuilder = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    mockModel.findOne = jest.fn(() => mockQueryBuilder);
    mockModel.find = jest.fn(() => mockQueryBuilder);
    mockModel.findById = jest.fn(() => mockQueryBuilder);
    mockModel.findByIdAndUpdate = jest.fn(() => mockQueryBuilder);
    mockModel.findByIdAndDelete = jest.fn(() => mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrupoActivoService,
        { provide: getModelToken(GrupoActivo.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<GrupoActivoService>(GrupoActivoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new grupo activo', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      mockSave.mockResolvedValue(mockDocument);

      const dto = {
        codigo: 'COMP',
        nombre: 'Equipos de Computación',
        vidaUtilMinima: 3,
        vidaUtilMaxima: 4,
        tasaDepreciacionMinima: 25,
        tasaDepreciacionMaxima: 33,
      };
      const result = await service.create(dto);

      expect(mockModel.findOne).toHaveBeenCalledWith({ codigo: dto.codigo });
      expect(mockModel).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: 'COMP' }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should throw BadRequestException when codigo already exists', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);

      await expect(service.create({
        codigo: 'COMP',
        nombre: 'Test',
        vidaUtilMinima: 3,
        vidaUtilMaxima: 4,
        tasaDepreciacionMinima: 25,
        tasaDepreciacionMaxima: 33,
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all grupos sorted by codigo', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ codigo: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a grupo by id', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.findOne(mockDocument._id.toHexString());
      expect(result).toEqual(mockDocument);
      expect(mockModel.findById).toHaveBeenCalledWith(mockDocument._id.toHexString());
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not found', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.findOne(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a grupo', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.update(mockDocument._id.toHexString(), { nombre: 'Updated' });
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocument._id.toHexString(),
        { nombre: 'Updated' },
        { new: true },
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when grupo to update does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.update(new Types.ObjectId().toHexString(), { nombre: 'test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a grupo', async () => {
      mockQueryBuilder.exec.mockResolvedValue(mockDocument);
      const result = await service.remove(mockDocument._id.toHexString());
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(mockDocument._id.toHexString());
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when grupo to remove does not exist', async () => {
      mockQueryBuilder.exec.mockResolvedValue(null);
      await expect(service.remove(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGruposActivos', () => {
    it('should return only active grupos', async () => {
      mockQueryBuilder.exec.mockResolvedValue([mockDocument]);
      const result = await service.getGruposActivos();
      expect(result).toEqual([mockDocument]);
      expect(mockModel.find).toHaveBeenCalledWith({ activo: true });
    });
  });
});
