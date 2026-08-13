import { Test, TestingModule } from '@nestjs/testing';
import {
  LicenciaOfflineService,
  LicenciaOfflineData,
} from './licencia-offline.service';
import { LicenciaCryptoService } from './licencia-crypto.service';
import * as fs from 'fs';
import { Types } from 'mongoose';

// Firma Ed25519 válida precalculada con la clave privada de DEV sobre el
// payload canónico v2 de EMP-001 (suscripcion_anual 2024→2025, max_usuarios 10,
// activa=true, revocada=false). Pública; la privada NO vive en el cliente.
const V2_FIRMA =
  '98f15d53d6460a638e87db25e44c0cf3d59ae93413e0633b6430bd1354962f91' +
  '350d8113c0514338e4eece618181608ec5168e5697359e214b2855e6ead7ce0c';

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: jest.fn(),
      writeFile: jest.fn(),
      unlink: jest.fn(),
    },
    existsSync: actual.existsSync,
  };
});

const mockReadFile = () => fs.promises.readFile as jest.Mock;
const mockWriteFile = () => fs.promises.writeFile as jest.Mock;
const mockUnlink = () => fs.promises.unlink as jest.Mock;

describe('LicenciaOfflineService', () => {
  let service: LicenciaOfflineService;
  let cryptoService: LicenciaCryptoService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaOfflineService, LicenciaCryptoService],
    }).compile();

    service = module.get<LicenciaOfflineService>(LicenciaOfflineService);
    cryptoService = module.get<LicenciaCryptoService>(LicenciaCryptoService);
  });

  // Datos .lic con fecha de vencimiento en el futuro lejano (dinámicos).
  const buildData = (overrides: Partial<Record<string, unknown>> = {}) =>
    ({
      version: 2,
      empresa_id: 'EMP-001',
      empresa_nombre: 'Test Empresa',
      tipo: 'suscripcion_mensual',
      fecha_inicio: '2024-01-01T00:00:00.000Z',
      fecha_vencimiento: new Date(Date.now() + 30 * 86400000).toISOString(),
      max_usuarios: 10,
      hardware_id: 'abc123',
      activa: true,
      revocada: false,
      ultima_sincronizacion: '2024-01-01T00:00:00.000Z',
      ultima_verificacion_efectiva: '2024-01-01T00:00:00.000Z',
      firma_ed25519: V2_FIRMA,
      ...overrides,
    }) as unknown as LicenciaOfflineData;

  const writeMockFile = (data: unknown) => {
    mockReadFile().mockResolvedValue(JSON.stringify(data));
  };

  const mockFileNotFound = () => {
    const err = new Error('ENOENT') as NodeJS.ErrnoException;
    err.code = 'ENOENT';
    mockReadFile().mockRejectedValue(err);
  };

  const mockReadError = () => {
    mockReadFile().mockRejectedValue(new Error('EACCES'));
  };

  describe('verifySignature (Ed25519 sobre payload canónico v2)', () => {
    const fixedValid = () =>
      buildData({
        tipo: 'suscripcion_anual',
        fecha_inicio: '2024-01-01T00:00:00.000Z',
        fecha_vencimiento: '2025-01-01T00:00:00.000Z',
        max_usuarios: 10,
        hardware_id: '',
        activa: true,
        revocada: false,
      });

    it('should verify valid signature', () => {
      expect(service.verifySignature(fixedValid())).toBe(true);
    });

    it('should reject tampered signature', () => {
      const data = fixedValid();
      data.firma_ed25519 = 'deadbeef'.repeat(16);
      expect(service.verifySignature(data)).toBe(false);
    });

    it('should reject tampered fields (activa)', () => {
      const data = fixedValid();
      data.activa = false;
      expect(service.verifySignature(data)).toBe(false);
    });

    it('should reject tampered fields (fecha_vencimiento)', () => {
      const data = fixedValid();
      data.fecha_vencimiento = '2099-01-01T00:00:00.000Z';
      expect(service.verifySignature(data)).toBe(false);
    });
  });

  describe('onModuleInit', () => {
    it('should log when .lic is valid', async () => {
      const data = buildData();
      writeMockFile(data);
      jest.spyOn(service, 'verifySignature').mockReturnValue(true);

      const loggerSpy = jest.spyOn(
        (service as unknown as { logger: { log: jest.Mock } }).logger,
        'log',
      );

      await service.onModuleInit();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Archivo .lic válido encontrado, sin cambios necesarios',
      );
    });

    it('should warn when .lic is missing', async () => {
      mockFileNotFound();

      const loggerSpy = jest.spyOn(
        (service as unknown as { logger: { warn: jest.Mock } }).logger,
        'warn',
      );

      await service.onModuleInit();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('No se encontró'),
      );
    });

    it('should warn when .lic is revoked', async () => {
      const data = buildData({ revocada: true, activa: false });
      writeMockFile(data);
      jest.spyOn(service, 'verifySignature').mockReturnValue(true);

      const loggerSpy = jest.spyOn(
        (service as unknown as { logger: { warn: jest.Mock } }).logger,
        'warn',
      );

      await service.onModuleInit();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('inválido o expirado'),
      );
    });
  });

  describe('isLicenseDataValid', () => {
    it('should return true for active, non-revoked, non-expired license', () => {
      expect(service.isLicenseDataValid(buildData())).toBe(true);
    });

    it('should return false for inactive license', () => {
      expect(service.isLicenseDataValid(buildData({ activa: false }))).toBe(
        false,
      );
    });

    it('should return false for revoked license', () => {
      expect(service.isLicenseDataValid(buildData({ revocada: true }))).toBe(
        false,
      );
    });

    it('should return false for expired license', () => {
      expect(
        service.isLicenseDataValid(
          buildData({ fecha_vencimiento: '2020-01-01T00:00:00.000Z' }),
        ),
      ).toBe(false);
    });

    it('should return true for perpetua regardless of fecha_vencimiento', () => {
      expect(
        service.isLicenseDataValid(
          buildData({
            tipo: 'perpetua',
            fecha_vencimiento: '2020-01-01T00:00:00.000Z',
          }),
        ),
      ).toBe(true);
    });
  });

  describe('isOfflineLicenseValidWithGrace', () => {
    it('should return invalid when no .lic file exists', async () => {
      mockFileNotFound();
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(false);
      expect(result.vigente).toBe(false);
      expect(result.enPeriodoGracia).toBe(false);
      expect(result.data).toBeNull();
    });

    it('should return valid for active non-expired license', async () => {
      const data = buildData();
      writeMockFile(data);
      jest.spyOn(service, 'verifySignature').mockReturnValue(true);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
      expect(result.enPeriodoGracia).toBe(false);
      expect(result.data).not.toBeNull();
    });

    it('should return invalid for revoked license', async () => {
      const data = buildData({ revocada: true, activa: false });
      writeMockFile(data);
      jest.spyOn(service, 'verifySignature').mockReturnValue(true);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(false);
    });

    it('should return true with grace period for recently expired license', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
      const data = buildData({ fecha_vencimiento: twoDaysAgo });
      writeMockFile(data);
      jest.spyOn(service, 'verifySignature').mockReturnValue(true);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
      expect(result.enPeriodoGracia).toBe(true);
      expect(result.diasRestantes).toBe(0);
    });

    it('should return invalid for license expired beyond grace period', async () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
      const data = buildData({ fecha_vencimiento: tenDaysAgo });
      writeMockFile(data);
      jest.spyOn(service, 'verifySignature').mockReturnValue(true);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(false);
      expect(result.vigente).toBe(false);
      expect(result.enPeriodoGracia).toBe(false);
    });

    it('should handle perpetua licenses', async () => {
      const data = buildData({ tipo: 'perpetua' });
      writeMockFile(data);
      jest.spyOn(service, 'verifySignature').mockReturnValue(true);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
      expect(result.enPeriodoGracia).toBe(false);
      expect(result.diasRestantes).toBe(-1);
    });
  });

  describe('readLicenseFile', () => {
    it('should return null when file does not exist', async () => {
      mockFileNotFound();
      const result = await service.readLicenseFile();
      expect(result).toBeNull();
    });

    it('should return null for invalid signature', async () => {
      const data = { ...buildData(), firma_ed25519: 'invalid-hex' };
      writeMockFile(data);
      const result = await service.readLicenseFile();
      expect(result).toBeNull();
    });

    it('should return data for valid file (real verifySignature)', async () => {
      const data = buildData({
        tipo: 'suscripcion_anual',
        fecha_inicio: '2024-01-01T00:00:00.000Z',
        fecha_vencimiento: '2025-01-01T00:00:00.000Z',
        max_usuarios: 10,
        hardware_id: '',
        activa: true,
        revocada: false,
      });
      writeMockFile(data);
      const result = await service.readLicenseFile();
      expect(result).not.toBeNull();
      expect(result!.empresa_id).toBe('EMP-001');
    });

    it('should return null on read error', async () => {
      mockReadError();
      const result = await service.readLicenseFile();
      expect(result).toBeNull();
    });
  });

  describe('writeLicenseFile (frozen copy, no re-sign)', () => {
    const mockLicenciaFromDb = () => {
      const now = new Date();
      return {
        _id: new Types.ObjectId(),
        empresa_id: 'EMP-001',
        empresa_nombre: 'Test Empresa',
        tipo: 'suscripcion_mensual',
        fecha_inicio: new Date('2024-01-01'),
        fecha_vencimiento: new Date(now.getTime() + 30 * 86400000),
        max_usuarios: 10,
        hardware_id: 'abc123',
        activa: true,
        revocada: false,
        ultima_verificacion_efectiva: new Date(now.getTime() - 3600000),
        firma_ed25519: V2_FIRMA,
      } as unknown as import('../schemas/licencia.schema').LicenciaDocument;
    };

    it('should write a frozen .lic with verbatim firma_ed25519 (no re-sign)', async () => {
      const licencia = mockLicenciaFromDb();
      mockWriteFile().mockResolvedValue(undefined);
      const signSpy = jest.spyOn(cryptoService, 'signHMAC');

      await service.writeLicenseFile(licencia);

      expect(mockWriteFile()).toHaveBeenCalled();
      const fileContent = mockWriteFile().mock.calls[0][1] as string;
      const parsed = JSON.parse(fileContent);
      expect(parsed.version).toBe(2);
      expect(parsed.firma_ed25519).toBe(V2_FIRMA);
      expect(parsed.ultima_sincronizacion).toBeDefined();
      expect(parsed.ultima_verificacion_efectiva).toBeDefined();
      // NO debe re-firmar con HMAC.
      expect(signSpy).not.toHaveBeenCalled();
    });

    it('should not throw on write error', async () => {
      const licencia = mockLicenciaFromDb();
      mockWriteFile().mockRejectedValue(new Error('Disk full'));

      await expect(service.writeLicenseFile(licencia)).resolves.not.toThrow();
    });
  });

  describe('deleteLicenseFile', () => {
    it('should delete the file', async () => {
      mockUnlink().mockResolvedValue(undefined);
      await service.deleteLicenseFile();
      expect(mockUnlink()).toHaveBeenCalled();
    });

    it('should not throw when file does not exist', async () => {
      const err = new Error('ENOENT') as NodeJS.ErrnoException;
      err.code = 'ENOENT';
      mockUnlink().mockRejectedValue(err);
      await expect(service.deleteLicenseFile()).resolves.not.toThrow();
    });
  });
});
