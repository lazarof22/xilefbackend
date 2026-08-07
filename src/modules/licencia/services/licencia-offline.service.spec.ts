import { Test, TestingModule } from '@nestjs/testing';
import {
  LicenciaOfflineService,
  LicenciaOfflineData,
} from './licencia-offline.service';
import { LicenciaCryptoService } from './licencia-crypto.service';
import * as fs from 'fs';
import { Types } from 'mongoose';

const TEST_SECRET_KEY = 'test-secret-key-min-32-chars-long!!';
const TEST_SIGN_SECRET = 'test-secret-sign-min-32-chars!!!';
const TEST_SALT_B64 = Buffer.alloc(32, 0x05).toString('base64');

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

  beforeAll(() => {
    process.env.LICENSE_SECRET_KEY = TEST_SECRET_KEY;
    process.env.LICENSE_SIGN_SECRET = TEST_SIGN_SECRET;
    process.env.LICENSE_SALT = TEST_SALT_B64;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenciaOfflineService, LicenciaCryptoService],
    }).compile();

    service = module.get<LicenciaOfflineService>(LicenciaOfflineService);
    cryptoService = module.get<LicenciaCryptoService>(LicenciaCryptoService);

    await (
      cryptoService as unknown as { onModuleInit: () => void }
    ).onModuleInit();
  });

  const buildSignedData = (
    overrides: Partial<Record<string, unknown>> = {},
  ) => {
    const now = new Date().toISOString();
    const base: Record<string, unknown> = {
      version: 1,
      empresa_id: 'EMP-001',
      empresa_nombre: 'Test Empresa',
      tipo: 'suscripcion_mensual',
      fecha_inicio: '2024-01-01T00:00:00.000Z',
      fecha_vencimiento: new Date(Date.now() + 30 * 86400000).toISOString(),
      max_usuarios: 10,
      hardware_id: 'abc123',
      activa: true,
      revocada: false,
      ultima_sincronizacion: now,
      ultima_verificacion_efectiva: now,
      ...overrides,
    };
    const sorted = Object.keys(base)
      .sort()
      .reduce(
        (acc, k) => {
          acc[k] = base[k];
          return acc;
        },
        {} as Record<string, unknown>,
      );
    const sig = cryptoService.signHMAC(JSON.stringify(sorted));
    return { ...base, signature: sig };
  };

  const writeMockFile = (data: Record<string, unknown>) => {
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

  describe('onModuleInit', () => {
    it('should log when .lic is valid', async () => {
      const data = buildSignedData();
      writeMockFile(data);

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
      const data = buildSignedData({ revocada: true, activa: false });
      writeMockFile(data);

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
      const data = buildSignedData() as unknown as LicenciaOfflineData;
      expect(service.isLicenseDataValid(data)).toBe(true);
    });

    it('should return false for inactive license', () => {
      const data = buildSignedData({
        activa: false,
      }) as unknown as LicenciaOfflineData;
      expect(service.isLicenseDataValid(data)).toBe(false);
    });

    it('should return false for revoked license', () => {
      const data = buildSignedData({
        revocada: true,
      }) as unknown as LicenciaOfflineData;
      expect(service.isLicenseDataValid(data)).toBe(false);
    });

    it('should return false for expired license', () => {
      const data = buildSignedData({
        fecha_vencimiento: '2020-01-01T00:00:00.000Z',
      }) as unknown as LicenciaOfflineData;
      expect(service.isLicenseDataValid(data)).toBe(false);
    });

    it('should return true for perpetua regardless of fecha_vencimiento', () => {
      const data = buildSignedData({
        tipo: 'perpetua',
        fecha_vencimiento: '2020-01-01T00:00:00.000Z',
      }) as unknown as LicenciaOfflineData;
      expect(service.isLicenseDataValid(data)).toBe(true);
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
      const data = buildSignedData();
      writeMockFile(data);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
      expect(result.enPeriodoGracia).toBe(false);
      expect(result.data).not.toBeNull();
    });

    it('should return invalid for revoked license', async () => {
      const data = buildSignedData({ revocada: true, activa: false });
      writeMockFile(data);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(false);
    });

    it('should return true with grace period for recently expired license', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
      const data = buildSignedData({ fecha_vencimiento: twoDaysAgo });
      writeMockFile(data);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
      expect(result.enPeriodoGracia).toBe(true);
      expect(result.diasRestantes).toBe(0);
    });

    it('should return invalid for license expired beyond grace period', async () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
      const data = buildSignedData({ fecha_vencimiento: tenDaysAgo });
      writeMockFile(data);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(false);
      expect(result.vigente).toBe(false);
      expect(result.enPeriodoGracia).toBe(false);
    });

    it('should handle perpetua licenses', async () => {
      const data = buildSignedData({ tipo: 'perpetua' });
      writeMockFile(data);
      const result = await service.isOfflineLicenseValidWithGrace();
      expect(result.valida).toBe(true);
      expect(result.vigente).toBe(true);
      expect(result.enPeriodoGracia).toBe(false);
      expect(result.diasRestantes).toBe(-1);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const data = buildSignedData() as unknown as LicenciaOfflineData;
      expect(service.verifySignature(data)).toBe(true);
    });

    it('should reject tampered signature', () => {
      const data = buildSignedData() as unknown as LicenciaOfflineData;
      data.signature = 'deadbeef';
      expect(service.verifySignature(data)).toBe(false);
    });

    it('should reject tampered fields', () => {
      const data = buildSignedData() as unknown as LicenciaOfflineData;
      data.activa = false;
      expect(service.verifySignature(data)).toBe(false);
    });
  });

  describe('readLicenseFile', () => {
    it('should return null when file does not exist', async () => {
      mockFileNotFound();
      const result = await service.readLicenseFile();
      expect(result).toBeNull();
    });

    it('should return null for invalid signature', async () => {
      const data = { ...buildSignedData(), signature: 'invalid-hex' };
      writeMockFile(data);
      const result = await service.readLicenseFile();
      expect(result).toBeNull();
    });

    it('should return data for valid file', async () => {
      const data = buildSignedData();
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

  describe('writeLicenseFile', () => {
    const mockLicenciaFromDb = () => {
      const now = new Date();
      const mockSave = jest.fn().mockResolvedValue(true);
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
        save: mockSave,
      } as unknown as import('../schemas/licencia.schema').LicenciaDocument;
    };

    it('should write a valid signed .lic file', async () => {
      const licencia = mockLicenciaFromDb();
      mockWriteFile().mockResolvedValue(undefined);

      await service.writeLicenseFile(licencia);

      expect(mockWriteFile()).toHaveBeenCalled();
      const fileContent = mockWriteFile().mock.calls[0][1] as string;
      const parsed = JSON.parse(fileContent);
      expect(parsed.version).toBe(1);
      expect(parsed.signature).toBeDefined();
      expect(parsed.ultima_sincronizacion).toBeDefined();
      expect(parsed.ultima_verificacion_efectiva).toBeDefined();
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
