import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { LicenciaService } from './licencia.service';
import { Licencia } from './schemas/licencia.schema';
import { LicenciaCryptoService } from './services/licencia-crypto.service';
import { LicenciaGeneratorService } from './services/licencia-generator.service';
import { LicenciaValidatorService } from './services/licencia-validator.service';
import { LicenciaAuditService } from './services/licencia-audit.service';
import { LicenciaOfflineService } from './services/licencia-offline.service';
import { LicenciaValidator } from './types/licencia-validator.interface';
import { AuditoriaLicencia } from './schemas/auditoria-licencia.schema';
import { NonceUsado } from './schemas/nonce-usado.schema';
import { Types } from 'mongoose';

describe('LicenciaService', () => {
  let service: LicenciaService;
  let cryptoService: LicenciaCryptoService;
  let mockLicenciaModel: any;
  let mockAuditoriaModel: any;
  let mockNonceModel: any;

  const baseSaltB64 = Buffer.alloc(32, 0x01).toString('base64');

  const buildMockDoc = (overrides: Partial<Record<string, unknown>> = {}) => ({
    _id: new Types.ObjectId(),
    clave_hash: 'abc123hash',
    clave_activacion_encriptada: 'encrypted-key',
    empresa_nombre: 'Test Empresa',
    empresa_id: 'EMP-001',
    tipo: 'suscripcion_mensual',
    fecha_inicio: new Date('2024-01-01'),
    fecha_vencimiento: new Date('2025-01-01'),
    activa: true,
    dias_restantes: 180,
    max_usuarios: 10,
    hardware_id: undefined,
    ultima_verificacion: undefined,
    ultima_verificacion_efectiva: undefined,
    skew_detectado: false,
    ultima_verificacion_monotonic_ms: undefined,
    firma_hmac: 'valid-hmac-signature',
    version_firma: 1,
    requiere_re_firma: false,
    metadata: {},
    revocada: false,
    motivo_revocacion: undefined,
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnThis(),
    ...overrides,
  });

  const signV1 = (doc: Record<string, unknown>): string => {
    const payload = cryptoService.buildIntegrityPayload({
      empresa_id: doc.empresa_id as string,
      tipo: doc.tipo as string,
      fecha_inicio: doc.fecha_inicio as Date,
      fecha_vencimiento: doc.fecha_vencimiento as Date,
      max_usuarios: doc.max_usuarios as number,
      hardware_id: (doc.hardware_id as string | undefined) ?? '',
      activa: doc.activa as boolean,
      revocada: doc.revocada as boolean,
    });
    return cryptoService.signHMAC(payload);
  };

  beforeEach(async () => {
    process.env.LICENSE_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
    process.env.LICENSE_SIGN_SECRET = 'test-sign-secret-min-32-chars!!!';
    process.env.LICENSE_SALT = baseSaltB64;

    const mockDoc = buildMockDoc();
    mockLicenciaModel = {
      create: jest.fn().mockResolvedValue(mockDoc),
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockResolvedValue(mockDoc),
      findById: jest.fn().mockResolvedValue(mockDoc),
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockDoc]),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    mockAuditoriaModel = {
      create: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      countDocuments: jest.fn().mockResolvedValue(0),
      skip: jest.fn().mockReturnThis(),
    };

    const nonceInsert = jest.fn().mockResolvedValue({ nonce: 'stub' });
    mockNonceModel = {
      insertOne: nonceInsert,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenciaService,
        LicenciaCryptoService,
        LicenciaGeneratorService,
        { provide: LicenciaValidator, useClass: LicenciaValidatorService },
        LicenciaAuditService,
        {
          provide: LicenciaOfflineService,
          useValue: {
            syncFromDb: jest.fn().mockResolvedValue(undefined),
            deleteLicenseFile: jest.fn().mockResolvedValue(undefined),
            readLicenseFile: jest.fn().mockResolvedValue(null),
            writeLicenseFile: jest.fn().mockResolvedValue(undefined),
            verifySignature: jest.fn().mockReturnValue(true),
            isOfflineLicenseValid: jest.fn().mockResolvedValue(true),
            isOfflineLicenseValidWithGrace: jest.fn().mockResolvedValue({
              valida: true,
              vigente: true,
              enPeriodoGracia: false,
              diasRestantes: 30,
              data: {
                tipo: 'suscripcion_mensual',
                empresa_nombre: 'Test',
                fecha_vencimiento: new Date(
                  Date.now() + 30 * 86400000,
                ).toISOString(),
                max_usuarios: 10,
              },
            }),
          },
        },
        { provide: getModelToken(Licencia.name), useValue: mockLicenciaModel },
        {
          provide: getModelToken(AuditoriaLicencia.name),
          useValue: mockAuditoriaModel,
        },
        { provide: getModelToken(NonceUsado.name), useValue: mockNonceModel },
      ],
    }).compile();

    service = module.get<LicenciaService>(LicenciaService);
    cryptoService = module.get<LicenciaCryptoService>(LicenciaCryptoService);

    // Trigger onModuleInit del crypto service
    await (
      cryptoService as unknown as { onModuleInit: () => void }
    ).onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateLicencia', () => {
    it('should generate a new license (firma)', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);

      const result = await service.generateLicencia({
        empresa_nombre: 'Test Corp',
        empresa_id: 'EMP-NEW',
        tipo: 'suscripcion_mensual',
        max_usuarios: 5,
      });

      expect(result.mensaje).toContain('exitosa');
      expect(result.licencia.clave).toMatch(/^XILEF-/);
      expect(mockLicenciaModel.create).toHaveBeenCalled();
      const created = mockLicenciaModel.create.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(created.version_firma).toBe(2);
      expect(created.requiere_re_firma).toBe(false);
      expect(created.hardware_id).toBe('');
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
    const validDto = (overrides: Record<string, unknown> = {}) => ({
      clave_activacion: 'XILEF-A1B2-C3D4-E5F6-F7A8',
      empresa_nombre: 'Test',
      empresa_id: 'EMP-001',
      nonce: 'nonce-1',
      hardware_id: 'device-fingerprint-aaa',
      ...overrides,
    });

    it('should throw BadRequestException for invalid format key', async () => {
      await expect(
        service.activarLicencia(validDto({ clave_activacion: 'INVALID-KEY' })),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when nonce is replayed', async () => {
      mockNonceModel.insertOne.mockRejectedValue(
        Object.assign(new Error('dup'), { code: 11000 }),
      );
      await expect(
        service.activarLicencia(validDto({ nonce: 'reused' })),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent key', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);
      await expect(
        service.activarLicencia(
          validDto({ clave_activacion: 'XILEF-AAAA-BBBB-CCCC-DDDD' }),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for revoked license', async () => {
      const validKey = 'XILEF-AAAA-BBBB-CCCC-DDDD';
      const claveHash = cryptoService.generateSHA256Hash(validKey);
      const doc = buildMockDoc({
        clave_hash: claveHash,
        revocada: true,
        motivo_revocacion: 'Fraud',
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);
      await expect(
        service.activarLicencia(validDto({ clave_activacion: validKey })),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired license', async () => {
      const doc = buildMockDoc({
        fecha_vencimiento: new Date('2020-01-01'),
        revocada: false,
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);
      await expect(service.activarLicencia(validDto())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when hardware_id diverges from stored', async () => {
      const storedHash = cryptoService.generateSHA256Hash('device-original');
      const doc = buildMockDoc({
        hardware_id: storedHash,
        firma_hmac: '', // will be checked after hardware; provide placeholder
        revocada: false,
        fecha_vencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
      // firmar el doc para que validateIntegrity no bloquee antes del hw check
      doc.firma_hmac = cryptoService.signHMAC(
        cryptoService.buildIntegrityPayload({
          empresa_id: doc.empresa_id,
          tipo: doc.tipo,
          fecha_inicio: doc.fecha_inicio,
          fecha_vencimiento: doc.fecha_vencimiento,
          max_usuarios: doc.max_usuarios,
          hardware_id: storedHash,
          activa: true,
          revocada: false,
        }),
      );
      mockLicenciaModel.findOne.mockResolvedValue(doc);
      await expect(
        service.activarLicencia(
          validDto({ hardware_id: 'device-otrO', empresa_id: 'EMP-001' }),
        ),
      ).rejects.toThrow(ForbiddenException);
      // Debe auditar el rechazo
      expect(mockAuditoriaModel.create).toHaveBeenCalled();
      const auditArg = mockAuditoriaModel.create.mock.calls.find(
        (c) => (c[0] as { accion?: string }).accion === 'rechazo',
      );
      expect(auditArg).toBeDefined();
    });

    it('should throw BadRequestException when firma is invalid (integridad)', async () => {
      const doc = buildMockDoc({
        fecha_vencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        firma_hmac: 'invalid-signature-bad',
        version_firma: 1,
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);
      await expect(service.activarLicencia(validDto())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when re-vinculating to another empresa_id', async () => {
      const doc = buildMockDoc({
        empresa_id: 'EMP-001',
        fecha_vencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        firma_hmac: '',
      });
      doc.firma_hmac = cryptoService.signHMAC(
        cryptoService.buildIntegrityPayload({
          empresa_id: 'EMP-001',
          tipo: doc.tipo,
          fecha_inicio: doc.fecha_inicio,
          fecha_vencimiento: doc.fecha_vencimiento,
          max_usuarios: doc.max_usuarios,
          hardware_id: '',
          activa: true,
          revocada: false,
        }),
      );
      mockLicenciaModel.findOne.mockResolvedValue(doc);
      await expect(
        service.activarLicencia(validDto({ empresa_id: 'EMP-OTRA' })),
      ).rejects.toThrow(ForbiddenException);
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

    it('should return valid for active license with v1 firma', async () => {
      const fechaVenc = new Date();
      fechaVenc.setDate(fechaVenc.getDate() + 100);
      const fechaInicio = new Date('2024-01-01');
      const doc = buildMockDoc({
        fecha_vencimiento: fechaVenc,
        fecha_inicio: fechaInicio,
        version_firma: 1,
        hardware_id: '',
        max_usuarios: 10,
        activa: true,
        revocada: false,
        save: jest.fn().mockResolvedValue(true),
      });
      doc.firma_hmac = signV1(doc);
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.verificarEstado('EMP-001');
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
    });

    it('should keep license expired when clock rewinds below ultima_verificacion_efectiva', async () => {
      const fechaVenc = new Date('2025-12-31'); // vence en el futuro relativo a hoy
      const efectiva = new Date('2099-01-01'); // última verificación efectiva futura
      const doc = buildMockDoc({
        fecha_vencimiento: fechaVenc,
        ultima_verificacion_efectiva: efectiva,
        version_firma: 1,
        hardware_id: '',
        max_usuarios: 10,
        activa: true,
        revocada: false,
        save: jest.fn().mockResolvedValue(true),
      });
      doc.firma_hmac = signV1(doc);
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.verificarEstado('EMP-001');
      // Aunque la fecha de vencimiento es futura, con skew la compara contra
      // la efectiva (2099-01-01) → ya está vencida.
      expect(result.vigente).toBe(false);
      // Y valida debe ser false porque la firma cubre `vigente`? En la
      // implementación, `valida` sigue siendo true si la firma es válida y
      // `activa && !revocada` (no usamos vigente). Verificamos skew audit.
      expect(doc.skew_detectado).toBe(true);
    });

    it('should audit integrity breach and deactivate license', async () => {
      const doc = buildMockDoc({
        fecha_vencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24),
        firma_hmac: 'invalid-signature',
        version_firma: 1,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.verificarEstado('EMP-001');
      expect(result.valida).toBe(false);
      // La licencia marcada inactiva
      expect(doc.activa).toBe(false);
      // Audit rechazo registrado
      const auditRechazo = mockAuditoriaModel.create.mock.calls.find(
        (c) => (c[0] as { accion?: string }).accion === 'rechazo',
      );
      expect(auditRechazo).toBeDefined();
    });
  });

  describe('renovarLicencia', () => {
    it('should extend license expiry', async () => {
      const fechaVenc = new Date('2020-01-01');
      const fechaInicio = new Date('2019-01-01');
      const doc = buildMockDoc({
        fechaInicio,
        fecha_vencimiento: fechaVenc,
        version_firma: 1,
        hardware_id: '',
        max_usuarios: 10,
        activa: true,
        revocada: false,
        save: jest.fn().mockResolvedValue(true),
      });
      doc.firma_hmac = signV1(doc);

      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.renovarLicencia({
        empresa_id: 'EMP-001',
        dias: 30,
      });

      expect(result.mensaje).toContain('renovada');
      expect(doc.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no license', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);
      await expect(
        service.renovarLicencia({ empresa_id: 'NONEXISTENT', dias: 365 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should NOT un-revoke a revoked license (P1-1)', async () => {
      const doc = buildMockDoc({
        revocada: true,
        motivo_revocacion: 'fraude',
        fecha_vencimiento: new Date('2025-12-31'),
        activa: false,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      await expect(
        service.renovarLicencia({ empresa_id: 'EMP-001', dias: 30 }),
      ).rejects.toThrow(BadRequestException);

      // No se debe resetear el flag de revocada (no se llamó save con revocada=false)
      expect(doc.save).not.toHaveBeenCalled();
      expect(doc.revocada).toBe(true);
    });
  });

  describe('revocarLicencia', () => {
    it('should revoke an active license and re-sign with revocada=true', async () => {
      const doc = buildMockDoc({
        activa: true,
        revocada: false,
        version_firma: 1,
        hardware_id: '',
        max_usuarios: 10,
        save: jest.fn().mockResolvedValue(true),
      });
      doc.firma_hmac = signV1(doc);
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.revocarLicencia(
        'EMP-001',
        'Violación de términos',
      );
      expect(result.mensaje).toContain('revocada');
      expect(doc.revocada).toBe(true);
      expect(doc.activa).toBe(false);
      expect(doc.motivo_revocacion).toBe('Violación de términos');
      expect(doc.save).toHaveBeenCalled();
      // La firma debe seguir siendo válida tras revocar (activa=false, revocada=true)
      const ok = cryptoService.verifyHMAC(
        cryptoService.buildIntegrityPayload({
          empresa_id: doc.empresa_id,
          tipo: doc.tipo,
          fecha_inicio: doc.fecha_inicio,
          fecha_vencimiento: doc.fecha_vencimiento,
          max_usuarios: doc.max_usuarios,
          hardware_id: (doc.hardware_id as unknown as string) ?? '',
          activa: false,
          revocada: true,
        }),
        doc.firma_hmac,
      );
      expect(ok).toBe(true);
    });

    it('should throw NotFoundException (and audit) when no license', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);
      await expect(
        service.revocarLicencia('NONEXISTENT', 'motivo'),
      ).rejects.toThrow(NotFoundException);
      // Audit rechazo registrado
      const auditRechazo = mockAuditoriaModel.create.mock.calls.find(
        (c) => (c[0] as { accion?: string }).accion === 'rechazo',
      );
      expect(auditRechazo).toBeDefined();
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
      expect(result).toBeDefined();
      expect(mockLicenciaModel.select).toHaveBeenCalledWith(
        '-clave_activacion_encriptada -firma_hmac',
      );
    });
  });

  describe('estadoPublico (P0-8 + P2-7)', () => {
    it('should return only { valida, vigente } for valid license', async () => {
      const fechaVenc = new Date();
      fechaVenc.setDate(fechaVenc.getDate() + 10);
      const fechaInicio = new Date('2024-01-01');
      const doc = buildMockDoc({
        fecha_vencimiento: fechaVenc,
        fecha_inicio: fechaInicio,
        activa: true,
        revocada: false,
        version_firma: 1,
        hardware_id: '',
        max_usuarios: 5,
      });
      doc.firma_hmac = signV1(doc);
      // El service usa findOne con .select(...) y .lean() sobre el resultado.
      // Mockear como objeto plano.
      mockLicenciaModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(doc),
        }),
      });

      const start = Date.now();
      const result = await service.estadoPublico('XILEF-AAAA-BBBB-CCCC-DDDD');
      const elapsed = Date.now() - start;

      expect(result).toEqual({ valida: true, vigente: true });
      // fixedTimeResponse debe respetar al menos 150ms
      expect(elapsed).toBeGreaterThanOrEqual(140);
    });

    it('should return { valida: false, vigente: false } for non-existent license (after delay)', async () => {
      mockLicenciaModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });
      const start = Date.now();
      const result = await service.estadoPublico('XILEF-AAAA-BBBB-CCCC-DDDD');
      const elapsed = Date.now() - start;

      expect(result).toEqual({ valida: false, vigente: false });
      expect(elapsed).toBeGreaterThanOrEqual(140);
    });

    it('should return false when license is revoked', async () => {
      const doc = buildMockDoc({
        revocada: true,
        activa: false,
        version_firma: 1,
        fecha_vencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      // Firma generada sobre licencia NO revocada (votación): validateIntegrity
      // invalidará la firma porque `revocada` está firmada en v1 y se alteró.
      const firmante = buildMockDoc({
        revocada: false,
        activa: true,
        fecha_vencimiento: doc.fecha_vencimiento,
      });
      doc.firma_hmac = signV1(firmante);
      mockLicenciaModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(doc),
        }),
      });
      const result = await service.estadoPublico('XILEF-AAAA-BBBB-CCCC-DDDD');
      expect(result).toEqual({ valida: false, vigente: false });
    });
  });
});
