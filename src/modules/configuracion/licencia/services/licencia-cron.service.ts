import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LicenciaService } from '../licencia.service';

@Injectable()
export class LicenciaCronService {
  constructor(private readonly licenciaService: LicenciaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDesactivarLicenciasVencidas(): Promise<void> {
    try {
      const count = await this.licenciaService.desactivarLicenciasVencidas();
      if (count > 0) {
        console.log(
          `[LicenciaCron] ${count} licencias vencidas desactivadas automáticamente`,
        );
      }
    } catch (error) {
      console.error('[LicenciaCron] Error al desactivar licencias vencidas:', error);
    }
  }
}
