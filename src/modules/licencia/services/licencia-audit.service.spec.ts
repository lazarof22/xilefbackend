import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LicenciaAuditService } from './licencia-audit.service';
import { AuditoriaLicencia } from '../schemas/auditoria-licencia.schema';
import { Types } from 'mongoose';

describe('LicenciaAuditService', () => {
  let service: LicenciaAuditService;
  let mockModel: any;

  const mockAuditoriaModel = {
    create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    countDocuments: jest.fn().mockResolvedValue(0),
  };

  beforeEach(async () => {
    mockModel = { ...mockAuditoriaModel };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenciaAuditService,
        {
          provide: getModelToken(AuditoriaLicencia.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<LicenciaAuditService>(LicenciaAuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAccion', () => {
    it('should create an audit entry', async () => {
      const licenciaId = new Types.ObjectId();
      await service.logAccion({
        licencia_id: licenciaId,
        accion: 'activacion',
        empresa_id: 'EMP-001',
        exitoso: true,
        ip_origen: '192.168.1.1',
        user_agent: 'TestAgent/1.0',
      });

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          licencia_id: licenciaId,
          accion: 'activacion',
          empresa_id: 'EMP-001',
          exitoso: true,
          ip_origen: '192.168.1.1',
          user_agent: 'TestAgent/1.0',
        }),
      );
    });

    it('should log failed attempts', async () => {
      const licenciaId = new Types.ObjectId();
      await service.logAccion({
        licencia_id: licenciaId,
        accion: 'rechazo',
        empresa_id: 'HACKER-001',
        exitoso: false,
        error: 'Clave inválida',
      });

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          accion: 'rechazo',
          exitoso: false,
          error: 'Clave inválida',
        }),
      );
    });

    it('should not throw if DB write fails (fail silently)', async () => {
      mockModel.create = jest.fn().mockRejectedValue(new Error('DB error'));
      const licenciaId = new Types.ObjectId();
      await expect(
        service.logAccion({
          licencia_id: licenciaId,
          accion: 'verificacion',
          exitoso: true,
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('getAuditoriaPorLicencia', () => {
    it('should return audit entries sorted by date', async () => {
      const licenciaId = new Types.ObjectId();
      await service.getAuditoriaPorLicencia(licenciaId);
      expect(mockModel.find).toHaveBeenCalledWith({ licencia_id: licenciaId });
    });
  });

  describe('getIntentosRechazados', () => {
    it('should count failed attempts in last N hours', async () => {
      mockModel.countDocuments.mockResolvedValue(5);
      const count = await service.getIntentosRechazados(24);
      expect(count).toBe(5);
      expect(mockModel.countDocuments).toHaveBeenCalled();
    });
  });
});
