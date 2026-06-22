import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EmpresaDatosService } from './empresa-datos.service';
import { EmpresaDatos } from './schemas/empresa-datos.schema';

describe('EmpresaDatosService', () => {
  let service: EmpresaDatosService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaDatosService,
        { provide: getModelToken(EmpresaDatos.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<EmpresaDatosService>(EmpresaDatosService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('obtener', () => {
    it('should return empresa data', async () => {
      const doc = { nombre: 'Test' };
      mockModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(doc),
      });
      const result = await service.obtener();
      expect(result).toEqual(doc);
    });

    it('should return null if no data', async () => {
      mockModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      const result = await service.obtener();
      expect(result).toBeNull();
    });
  });

  describe('guardar', () => {
    it('should create if not exists', async () => {
      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue({ nombre: 'New' });
      const dto = { nombre: 'New Corp' };
      const result = await service.guardar(dto);
      expect(mockModel.create).toHaveBeenCalledWith(dto);
    });

    it('should update if exists', async () => {
      const save = jest.fn();
      save.mockResolvedValue({ nombre: 'Updated' });
      mockModel.findOne.mockResolvedValue({ nombre: 'Old', save });
      const dto = { nombre: 'Updated Corp' };
      await service.guardar(dto);
      expect(save).toHaveBeenCalled();
    });
  });

  describe('guardarLogo', () => {
    it('should update logo on existing record', async () => {
      const save = jest.fn();
      save.mockResolvedValue({ logo: 'base64' });
      const doc = { logo: '', save };
      mockModel.findOne.mockResolvedValue(doc);
      await service.guardarLogo('base64string');
      expect(doc.logo).toBe('base64string');
      expect(save).toHaveBeenCalled();
    });

    it('should create with logo if no record', async () => {
      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue({ nombre: 'Sin nombre', logo: 'b64' });
      await service.guardarLogo('base64string');
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ logo: 'base64string' }),
      );
    });
  });
});
