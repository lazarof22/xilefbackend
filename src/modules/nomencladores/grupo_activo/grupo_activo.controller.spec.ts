import { Test, TestingModule } from '@nestjs/testing';
import { GrupoActivoController } from './grupo_activo.controller';
import { GrupoActivoService } from './grupo_activo.service';

describe('GrupoActivoController', () => {
  let controller: GrupoActivoController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
      getGruposActivos: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrupoActivoController],
      providers: [{ provide: GrupoActivoService, useValue: mockService }],
    }).compile();

    controller = module.get<GrupoActivoController>(GrupoActivoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST / should call service.create', async () => {
    const dto = { codigo: 'COMP', nombre: 'Computación', vidaUtilMinima: 3, vidaUtilMaxima: 4, tasaDepreciacionMinima: 25, tasaDepreciacionMaxima: 33 };
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('GET / should call service.findAll', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('GET /activos should call service.getGruposActivos', async () => {
    await controller.getGruposActivos();
    expect(mockService.getGruposActivos).toHaveBeenCalled();
  });

  it('GET /:id should call service.findOne', async () => {
    await controller.findOne('some-id');
    expect(mockService.findOne).toHaveBeenCalledWith('some-id');
  });

  it('PATCH /:id should call service.update', async () => {
    const dto = { nombre: 'Updated' };
    await controller.update('some-id', dto);
    expect(mockService.update).toHaveBeenCalledWith('some-id', dto);
  });

  it('DELETE /:id should call service.remove', async () => {
    await controller.remove('some-id');
    expect(mockService.remove).toHaveBeenCalledWith('some-id');
  });
});
