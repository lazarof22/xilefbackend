import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LicenciaCryptoService } from './licencia-crypto.service';
import { GRACE_PERIOD_DAYS } from '../constants/licencia.constants';
import { buildEd25519Payload } from './payload-builder';
import type { LicenciaDocument } from '../schemas/licencia.schema';

export interface LicenciaOfflineData {
  version: number;
  empresa_id: string;
  empresa_nombre: string;
  tipo: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  max_usuarios: number;
  hardware_id: string;
  activa: boolean;
  revocada: boolean;
  ultima_sincronizacion: string;
  ultima_verificacion_efectiva: string;
  firma_ed25519: string;
}

export interface OfflineValidationResult {
  valida: boolean;
  vigente: boolean;
  enPeriodoGracia: boolean;
  diasRestantes: number;
  data: LicenciaOfflineData | null;
}

@Injectable()
export class LicenciaOfflineService implements OnModuleInit {
  private readonly logger = new Logger(LicenciaOfflineService.name);
  private readonly filePath: string;

  constructor(private readonly cryptoService: LicenciaCryptoService) {
    this.filePath =
      process.env.LICENSE_FILE_PATH ||
      path.resolve(process.cwd(), 'license.lic');
  }

  async onModuleInit(): Promise<void> {
    const existing = await this.readLicenseFile();
    if (existing && this.isLicenseDataValid(existing)) {
      this.logger.log('Archivo .lic válido encontrado, sin cambios necesarios');
      return;
    }
    if (!existing) {
      this.logger.warn(
        'No se encontró archivo .lic — se creará en la primera activación',
      );
    } else {
      this.logger.warn(
        'Archivo .lic inválido o expirado, será regenerado en la próxima sincronización',
      );
    }
  }

  isLicenseDataValid(data: LicenciaOfflineData): boolean {
    if (!data.activa || data.revocada) return false;
    if (data.tipo !== 'perpetua') {
      const vencimiento = new Date(data.fecha_vencimiento).getTime();
      if (vencimiento < Date.now()) return false;
    }
    return true;
  }

  /**
   * Escribe el .lic como copia congelada: `firma_ed25519` se copia VERBATIM del
   * documento (firma de XILEF). NO re-firma (sin signHMAC). La metadata no
   * firmada (empresa_nombre, hardware_id, ultima_sincronizacion,
   * ultima_verificacion_efectiva, version) se persiste pero no se verifica.
   */
  async writeLicenseFile(licencia: LicenciaDocument): Promise<void> {
    try {
      const now = new Date().toISOString();
      const efectiva = licencia.ultima_verificacion_efectiva
        ? licencia.ultima_verificacion_efectiva.toISOString()
        : now;
      const data: Omit<LicenciaOfflineData, 'firma_ed25519'> = {
        version: 2,
        empresa_id: licencia.empresa_id,
        empresa_nombre: licencia.empresa_nombre,
        tipo: licencia.tipo,
        fecha_inicio: licencia.fecha_inicio.toISOString(),
        fecha_vencimiento: licencia.fecha_vencimiento.toISOString(),
        max_usuarios: licencia.max_usuarios,
        hardware_id: licencia.hardware_id ?? '',
        activa: licencia.activa,
        revocada: licencia.revocada,
        ultima_sincronizacion: now,
        ultima_verificacion_efectiva: efectiva,
      };

      const fullData: LicenciaOfflineData = {
        ...data,
        firma_ed25519: licencia.firma_ed25519 ?? '',
      };
      await fs.promises.writeFile(
        this.filePath,
        JSON.stringify(fullData, null, 2),
        'utf8',
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo escribir el archivo .lic: ${(error as Error).message}`,
      );
    }
  }

  async readLicenseFile(): Promise<LicenciaOfflineData | null> {
    try {
      const raw = await fs.promises.readFile(this.filePath, 'utf8');
      const data = JSON.parse(raw) as LicenciaOfflineData;

      if (!data.firma_ed25519 || !this.verifySignature(data)) {
        this.logger.warn('Archivo .lic con firma inválida');
        return null;
      }

      return data;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        return null;
      }
      this.logger.warn(
        `Error al leer archivo .lic: ${(error as Error).message}`,
      );
      return null;
    }
  }

  verifySignature(data: LicenciaOfflineData): boolean {
    const payload = buildEd25519Payload({
      empresa_id: data.empresa_id,
      tipo: data.tipo,
      fecha_inicio: new Date(data.fecha_inicio),
      fecha_vencimiento: new Date(data.fecha_vencimiento),
      max_usuarios: data.max_usuarios,
      activa: data.activa,
      revocada: data.revocada,
    });
    return this.cryptoService.verifyEd25519(payload, data.firma_ed25519);
  }

  async isOfflineLicenseValid(): Promise<boolean> {
    const data = await this.readLicenseFile();
    if (!data) return false;

    if (!data.activa || data.revocada) return false;

    const ahora = Date.now();
    const vencimiento = new Date(data.fecha_vencimiento).getTime();
    if (vencimiento < ahora && data.tipo !== 'perpetua') return false;

    return true;
  }

  async isOfflineLicenseValidWithGrace(): Promise<OfflineValidationResult> {
    const data = await this.readLicenseFile();
    if (!data) {
      return {
        valida: false,
        vigente: false,
        enPeriodoGracia: false,
        diasRestantes: 0,
        data: null,
      };
    }

    if (!data.activa || data.revocada) {
      return {
        valida: false,
        vigente: false,
        enPeriodoGracia: false,
        diasRestantes: 0,
        data,
      };
    }

    const ahora = Date.now();
    const vencimiento = new Date(data.fecha_vencimiento).getTime();

    if (data.tipo === 'perpetua') {
      return {
        valida: true,
        vigente: true,
        enPeriodoGracia: false,
        diasRestantes: -1,
        data,
      };
    }

    const diasRestantes = Math.max(
      0,
      Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24)),
    );

    if (vencimiento >= ahora) {
      return {
        valida: true,
        vigente: true,
        enPeriodoGracia: false,
        diasRestantes,
        data,
      };
    }

    const diasExpirados = Math.ceil(
      (ahora - vencimiento) / (1000 * 60 * 60 * 24),
    );
    if (diasExpirados <= GRACE_PERIOD_DAYS) {
      return {
        valida: true,
        vigente: true,
        enPeriodoGracia: true,
        diasRestantes: 0,
        data,
      };
    }

    return {
      valida: false,
      vigente: false,
      enPeriodoGracia: false,
      diasRestantes: 0,
      data,
    };
  }

  async deleteLicenseFile(): Promise<void> {
    try {
      await fs.promises.unlink(this.filePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') {
        this.logger.warn(
          `No se pudo eliminar el archivo .lic: ${(error as Error).message}`,
        );
      }
    }
  }

  async syncFromDb(licencia: LicenciaDocument): Promise<void> {
    await this.writeLicenseFile(licencia);
  }
}
