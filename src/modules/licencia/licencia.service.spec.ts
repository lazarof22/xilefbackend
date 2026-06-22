import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { LicenciaService } from './licencia.service';
import { Licencia } from './schemas/licencia.schema';
import { LicenciaCryptoService } from './services/licencia-crypto.service';
import { LicenciaGeneratorService } from './services/licencia-generator.service';
import { LicenciaValidatorService } from './services/licencia-validator.service';
import { LicenciaAuditService } from './services/licencia-audit.service';
import { AuditoriaLicencia } from './schemas/auditoria-licencia.schema';
import { Types } from 'mongoose';

describe('LicenciaService', () => {
  let service: LicenciaService;
  let cryptoService: LicenciaCryptoService;
  let mockLicenciaModel: any;

  const mockDocument = {
    _id: new Types.ObjectId(),
    clave_hash: 'abc123hash',
    clave_activacion_encriptada: 'encrypted-key',
    empresa_nombre: 'Test Empresa',
    empresa_id: 'EMP-001',
    tipo: 'suscripcion_anual',
    fecha_inicio: new Date('2024-01-01'),
    fecha_vencimiento: new Date('2025-01-01'),
    activa: true,
    dias_restantes: 180,
    max_usuarios: 10,
    hardware_id: undefined,
    firma_hmac: 'valid-hmac-signature',
    metadata: {},
    revocada: false,
    motivo_revocacion: undefined,
    save: jest.fn().mockResolvedValue(true),
    updateOne: jest.fn().mockResolvedValue({}),
    toObject: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    process.env.LICENSE_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
    process.env.LICENSE_SIGN_SECRET = 'test-sign-secret-min-32-chars!!';

    mockLicenciaModel = {
      create: jest.fn().mockResolvedValue(mockDocument),
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockResolvedValue(mockDocument),
      findById: jest.fn().mockResolvedValue(mockDocument),
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockDocument]),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    const mockAuditoriaModel = {
      create: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenciaService,
        LicenciaCryptoService,
        LicenciaGeneratorService,
        LicenciaValidatorService,
        LicenciaAuditService,
        { provide: getModelToken(Licencia.name), useValue: mockLicenciaModel },
        { provide: getModelToken(AuditoriaLicencia.name), useValue: mockAuditoriaModel },
      ],
    }).compile();

    service = module.get<LicenciaService>(LicenciaService);
    cryptoService = module.get<LicenciaCryptoService>(LicenciaCryptoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateLicencia', () => {
    it('should generate a new license successfully', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);

      const result = await service.generateLicencia({
        empresa_nombre: 'Test Corp',
        empresa_id: 'EMP-NEW',
        tipo: 'suscripcion_anual',
        max_usuarios: 5,
      });

      expect(result.mensaje).toContain('exitosa');
      expect(result.licencia.clave).toMatch(/^XILEF-/);
      expect(result.licencia.empresa).toBeDefined();
      expect(result.licencia.tipo).toBe('suscripcion_anual');
      expect(mockLicenciaModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if empresa already has license', async () => {
      mockLicenciaModel.findOne.mockResolvedValue({ empresa_id: 'EMP-001' });
      await expect(
        service.generateLicencia({
          empresa_nombre: 'Test',
          empresa_id: 'EMP-001',
          tipo: 'trial',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('activarLicencia', () => {
    it('should throw BadRequestException for invalid format key', async () => {
      await expect(
        service.activarLicencia({
          clave_activacion: 'INVALID-KEY',
          empresa_nombre: 'Test',
          empresa_id: 'EMP-001',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent key', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);
      const validKey = 'XILEF-A1B2-C3D4-E5F6-F7A8';
      await expect(
        service.activarLicencia({
          clave_activacion: validKey,
          empresa_nombre: 'Test',
          empresa_id: 'EMP-001',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for revoked license', async () => {
      const key = cryptoService.generateSHA256Hash('XILEF-AAAA-BBBB-CCCC-DDDD');
      mockLicenciaModel.findOne.mockResolvedValue({
        ...mockDocument,
        clave_hash: key,
        revocada: true,
        motivo_revocacion: 'Fraudulent use',
        save: jest.fn().mockResolvedValue(true),
      });

      // We need to mock findOne to return by hash
      mockLicenciaModel.findOne.mockImplementation((query: any) => {
        if (query.clave_hash === key) {
          return {
            ...mockDocument,
            clave_hash: key,
            revocada: true,
            motivo_revocacion: 'Fraudulent use',
            save: jest.fn().mockResolvedValue(true),
          };
        }
        return null;
      });

      await expect(
        service.activarLicencia({
          clave_activacion: 'XILEF-AAAA-BBBB-CCCC-DDDD',
          empresa_nombre: 'Test',
          empresa_id: 'EMP-001',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verificarEstado', () => {
    it('should return invalid for non-existent empresa', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);
      const result = await service.verificarEstado('NONEXISTENT');
      expect(result.valida).toBe(false);
      expect(result.vigente).toBe(false);
      expect(result.dias_restantes).toBe(0);
    });

    it('should return valid for active license', async () => {
      const fechaVenc = new Date();
      fechaVenc.setDate(fechaVenc.getDate() + 100);
      const fechaInicio = new Date();
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
      });
      const firma = cryptoService.signHMAC(payload);

      mockLicenciaModel.findOne.mockResolvedValue({
        ...mockDocument,
        fecha_vencimiento: fechaVenc,
        firma_hmac: firma,
        fecha_inicio: fechaInicio,
        dias_restantes: 100,
        save: jest.fn().mockResolvedValue(true),
      });

      const result = await service.verificarEstado('EMP-001');
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
    });
  });

  describe('renovarLicencia', () => {
    it('should extend license expiry', async () => {
      const fechaVenc = new Date('2020-01-01');
      const fechaInicio = new Date('2019-01-01');
      const payload = cryptoService.buildIntegrityPayload({
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
      });
      const firma = cryptoService.signHMAC(payload);

      const realDoc = {
        ...mockDocument,
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVenc,
        firma_hmac: firma,
        save: jest.fn().mockResolvedValue(true),
      };

      mockLicenciaModel.findOne.mockResolvedValue(realDoc);

      const result = await service.renovarLicencia({
        empresa_id: 'EMP-001',
        dias: 30,
      });

      expect(result.mensaje).toContain('renovada');
      expect(realDoc.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no license', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);
      await expect(
        service.renovarLicencia({ empresa_id: 'NONEXISTENT', dias: 365 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('revocarLicencia', () => {
    it('should revoke an active license', async () => {
      const realDoc = {
        ...mockDocument,
        activa: true,
        revocada: false,
        save: jest.fn().mockResolvedValue(true),
      };
      mockLicenciaModel.findOne.mockResolvedValue(realDoc);

      const result = await service.revocarLicencia('EMP-001', 'Violación de términos');
      expect(result.mensaje).toContain('revocada');
      expect(realDoc.revocada).toBe(true);
      expect(realDoc.activa).toBe(false);
      expect(realDoc.motivo_revocacion).toBe('Violación de términos');
      expect(realDoc.save).toHaveBeenCalled();
    });
  });

  describe('desactivarLicenciasVencidas', () => {
    it('should deactivate expired licenses', async () => {
      mockLicenciaModel.updateMany.mockResolvedValue({ modifiedCount: 3 });
      const count = await service.desactivarLicenciasVencidas();
      expect(count).toBe(3);
      expect(mockLicenciaModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          activa: true,
          fecha_vencimiento: { $lt: expect.any(Date) },
          tipo: { $ne: 'perpetua' },
        }),
        expect.objectContaining({
          $set: { activa: false, dias_restantes: 0 },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all licenses excluding sensitive fields', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockDocument]);
      expect(mockLicenciaModel.select).toHaveBeenCalledWith(
        '-clave_activacion_encriptada -firma_hmac',
      );
    });
  });
});
