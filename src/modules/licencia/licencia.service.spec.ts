import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
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

// Firmas Ed25519 precalculadas con la clave privada de DEV (que vive FUERA de
// src/). Las firmas son públicas y verificables con la clave pública embebida.
// Payload canónico v2 de referencia (7 campos): empresa_id=EMP-001,
// tipo=suscripcion_anual, fecha_inicio=2024-01-01, max_usuarios=10,
// activa=true, revocada=false.
const SIG_FUTURE =
  'ed1cd8a164fccddfdb2cf53b4dd85e23a83550ea5ceac3c8c7b55d1b1aeac413' +
  '0dc73e92956f7c48cf79c087f3843551782ff1712cddeaf6f211005cfb676904'; // venc 2099-01-01
const SIG_PAST =
  'f92bda923612744f87b8f5664054108bcd494a512fb07f9d7d60fb029fac0b75' +
  'bd672e80b1827a8921ec1aa10a2733ed2c0f7cf8eadf87461bd59f0d3441450e'; // venc 2020-01-01
const SIG_SKEW =
  '1bf8a1c21917633a7d31df7c976da41e32e9e71be8d67dfc716ee4dc35db37bf' +
  '3d5d13b2c4049c60ac80001a80493dd5cee7f8cb3842b0c71ecdb243804fa30a'; // venc 2025-12-31

describe('LicenciaService', () => {
  let service: LicenciaService;
  let cryptoService: LicenciaCryptoService;
  let mockLicenciaModel: any;
  let mockAuditoriaModel: any;
  let mockNonceModel: any;

  const buildMockDoc = (overrides: Partial<Record<string, unknown>> = {}) => ({
    _id: new Types.ObjectId(),
    clave_hash: 'abc123hash',
    clave_activacion_encriptada: 'encrypted-key',
    empresa_nombre: 'Test Empresa',
    empresa_id: 'EMP-001',
    tipo: 'suscripcion_anual',
    fecha_inicio: new Date('2024-01-01'),
    fecha_vencimiento: new Date('2099-01-01'),
    activa: true,
    dias_restantes: 180,
    max_usuarios: 10,
    hardware_id: undefined,
    ultima_verificacion: undefined,
    ultima_verificacion_efectiva: undefined,
    skew_detectado: false,
    ultima_verificacion_monotonic_ms: undefined,
    firma_ed25519: SIG_FUTURE,
    version_firma: 2,
    requiere_re_firma: false,
    metadata: {},
    revocada: false,
    motivo_revocacion: undefined,
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnThis(),
    ...overrides,
  });

  beforeEach(async () => {
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
                tipo: 'suscripcion_anual',
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('activarLicencia (verify-only Ed25519)', () => {
    // DTO firmado por XILEF: los campos tipo/fechas/max_usuarios forman el
    // payload canónico v2 y `firma_ed25519` es la firma de XILEF sobre ellos.
    const validDto = (overrides: Record<string, unknown> = {}) => ({
      clave_activacion: 'XILEF-A1B2-C3D4-E5F6-F7A8',
      empresa_nombre: 'Test',
      empresa_id: 'EMP-001',
      nonce: 'nonce-1',
      hardware_id: 'device-fingerprint-aaa',
      tipo: 'suscripcion_anual' as const,
      fecha_inicio: '2024-01-01T00:00:00.000Z',
      fecha_vencimiento: '2099-01-01T00:00:00.000Z',
      max_usuarios: 10,
      firma_ed25519: SIG_FUTURE,
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

    it('should reject a forged signature with integridad audit and no Mongo write', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);
      await expect(
        service.activarLicencia(validDto({ firma_ed25519: 'a'.repeat(128) })),
      ).rejects.toThrow(BadRequestException);

      // No se escribe en Mongo ante firma inválida.
      expect(mockLicenciaModel.create).not.toHaveBeenCalled();
      // Audit rechazo con motivo 'integridad'.
      const auditRechazo = mockAuditoriaModel.create.mock.calls.find(
        (c: any[]) =>
          (c[0] as { accion?: string; detalles?: { motivo?: string } })
            ?.accion === 'rechazo',
      );
      expect(auditRechazo).toBeDefined();
      expect(
        (auditRechazo![0] as { detalles: { motivo: string } }).detalles.motivo,
      ).toBe('integridad');
    });

    it('should activate a valid XILEF-signed license (create, verbatim firma)', async () => {
      mockLicenciaModel.findOne.mockResolvedValue(null);

      const dto = validDto();
      const result = await service.activarLicencia(dto);

      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
      expect(mockLicenciaModel.create).toHaveBeenCalled();
      const created = mockLicenciaModel.create.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      // Sin re-firma: la firma persistida es la provista por XILEF.
      expect(created.firma_ed25519).toBe(SIG_FUTURE);
      expect(created.version_firma).toBe(2);
    });

    it('should update an existing license keeping the XILEF signature verbatim', async () => {
      const doc = buildMockDoc({ hardware_id: undefined, revocada: false });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.activarLicencia(validDto());

      expect(result.valida).toBe(true);
      expect(doc.save).toHaveBeenCalled();
      expect(doc.firma_ed25519).toBe(SIG_FUTURE);
      expect(doc.version_firma).toBe(2);
    });

    it('should throw BadRequestException for revoked license', async () => {
      const doc = buildMockDoc({ revocada: true, motivo_revocacion: 'Fraud' });
      mockLicenciaModel.findOne.mockResolvedValue(doc);
      await expect(service.activarLicencia(validDto())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired license (past vencimiento)', async () => {
      await expect(
        service.activarLicencia(
          validDto({
            fecha_vencimiento: '2020-01-01T00:00:00.000Z',
            firma_ed25519: SIG_PAST,
          }),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when hardware_id diverges from stored', async () => {
      const storedHash = cryptoService.generateSHA256Hash('device-original');
      const doc = buildMockDoc({
        hardware_id: storedHash,
        revocada: false,
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      await expect(
        service.activarLicencia(validDto({ hardware_id: 'device-otrO' })),
      ).rejects.toThrow(ForbiddenException);

      expect(mockAuditoriaModel.create).toHaveBeenCalled();
      const auditArg = mockAuditoriaModel.create.mock.calls.find(
        (c: any[]) => (c[0] as { accion?: string })?.accion === 'rechazo',
      );
      expect(auditArg).toBeDefined();
    });

    it('should throw ForbiddenException when re-vinculating to another empresa_id', async () => {
      // La firma es válida sobre empresa_id=EMP-001 (dto); el registro ya está
      // vinculado a EMP-OTRA → rechazo de re-vinculación.
      const doc = buildMockDoc({ empresa_id: 'EMP-OTRA' });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      await expect(service.activarLicencia(validDto())).rejects.toThrow(
        ForbiddenException,
      );
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

    it('should return valid for active license with v2 firma', async () => {
      const doc = buildMockDoc({
        fecha_vencimiento: new Date('2099-01-01'),
        fecha_inicio: new Date('2024-01-01'),
        version_firma: 2,
        hardware_id: '',
        max_usuarios: 10,
        activa: true,
        revocada: false,
        firma_ed25519: SIG_FUTURE,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.verificarEstado('EMP-001');
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
    });

    it('should keep license expired when clock rewinds below ultima_verificacion_efectiva', async () => {
      const efectiva = new Date('2099-01-01'); // última verificación efectiva futura
      const doc = buildMockDoc({
        fecha_vencimiento: new Date('2025-12-31'),
        ultima_verificacion_efectiva: efectiva,
        version_firma: 2,
        hardware_id: '',
        max_usuarios: 10,
        activa: true,
        revocada: false,
        firma_ed25519: SIG_SKEW,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.verificarEstado('EMP-001');
      // Aunque la fecha de vencimiento es futura, con skew se compara contra la
      // efectiva (2099-01-01) → ya está vencida.
      expect(result.vigente).toBe(false);
      expect(doc.skew_detectado).toBe(true);
    });

    it('should audit integrity breach and deactivate license', async () => {
      const doc = buildMockDoc({
        fecha_vencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24),
        firma_ed25519: 'invalid-signature',
        version_firma: 2,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLicenciaModel.findOne.mockResolvedValue(doc);

      const result = await service.verificarEstado('EMP-001');
      expect(result.valida).toBe(false);
      expect(doc.activa).toBe(false);
      const auditRechazo = mockAuditoriaModel.create.mock.calls.find(
        (c: any[]) => (c[0] as { accion?: string })?.accion === 'rechazo',
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
        '-clave_activacion_encriptada -firma_ed25519',
      );
    });
  });

  describe('estadoPublico', () => {
    it('should return only { valida, vigente } for valid license', async () => {
      const doc = buildMockDoc({
        fecha_vencimiento: new Date('2099-01-01'),
        fecha_inicio: new Date('2024-01-01'),
        activa: true,
        revocada: false,
        version_firma: 2,
        hardware_id: '',
        max_usuarios: 10,
        firma_ed25519: SIG_FUTURE,
      });
      mockLicenciaModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(doc),
        }),
      });

      const start = Date.now();
      const result = await service.estadoPublico('XILEF-AAAA-BBBB-CCCC-DDDD');
      const elapsed = Date.now() - start;

      expect(result).toEqual({ valida: true, vigente: true });
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

    it('should return false when license is revoked (tampered firma)', async () => {
      const doc = buildMockDoc({
        revocada: true,
        activa: false,
        version_firma: 2,
        fecha_vencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24),
        // Firma sobre la licencia NO revocada (activa=true): validateIntegrity
        // falla porque `revocada`/`activa` forman parte del payload firmado.
        firma_ed25519: SIG_FUTURE,
      });
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
