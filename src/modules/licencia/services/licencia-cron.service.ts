import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LicenciaService } from '../licencia.service';
import { LicenciaOfflineService } from './licencia-offline.service';

@Injectable()
export class LicenciaCronService {
  private readonly logger = new Logger(LicenciaCronService.name);

  constructor(
    private readonly licenciaService: LicenciaService,
    private readonly offlineService: LicenciaOfflineService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDesactivarLicenciasVencidas(): Promise<void> {
    try {
      const count = await this.licenciaService.desactivarLicenciasVencidas();
      if (count > 0) {
        this.logger.log(`${count} licencias vencidas desactivadas`);
      }
    } catch (error) {
      this.logger.warn(
        `No se pudo desactivar licencias vencidas en DB: ${(error as Error).message}`,
      );
    }

    const result = await this.offlineService.isOfflineLicenseValidWithGrace();
    if (result.data && !result.valida && !result.enPeriodoGracia) {
      this.logger.warn(
        'Licencia vencida sin período de gracia — eliminando .lic',
      );
      await this.offlineService.deleteLicenseFile();
    }
  }
}
