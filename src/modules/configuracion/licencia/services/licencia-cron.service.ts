import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LicenciaService } from '../licencia.service';

@Injectable()
export class LicenciaCronService {
  private readonly logger = new Logger(LicenciaCronService.name);

  constructor(private readonly licenciaService: LicenciaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDesactivarLicenciasVencidas(): Promise<void> {
    try {
      const count = await this.licenciaService.desactivarLicenciasVencidas();
      if (count > 0) {
        this.logger.log(
          `${count} licencias vencidas desactivadas automáticamente`,
        );
      }
    } catch (error) {
      this.logger.error('Error al desactivar licencias vencidas:', error);
    }
  }
}
