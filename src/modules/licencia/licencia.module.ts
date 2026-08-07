import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { LicenciaController } from './licencia.controller';
import { LicenciaService } from './licencia.service';
import { Licencia, LicenciaSchema } from './schemas/licencia.schema';
import {
  AuditoriaLicencia,
  AuditoriaLicenciaSchema,
} from './schemas/auditoria-licencia.schema';
import { NonceUsado, NonceUsadoSchema } from './schemas/nonce-usado.schema';
import { LicenciaCryptoService } from './services/licencia-crypto.service';
import { LicenciaGeneratorService } from './services/licencia-generator.service';
import { LicenciaValidatorService } from './services/licencia-validator.service';
import { LicenciaAuditService } from './services/licencia-audit.service';
import { LicenciaCronService } from './services/licencia-cron.service';
import { LicenciaOfflineService } from './services/licencia-offline.service';
import { LicenciaGuard } from './guards/licencia.guard';
import { LicenciaValidator } from './types/licencia-validator.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Licencia.name, schema: LicenciaSchema },
      { name: AuditoriaLicencia.name, schema: AuditoriaLicenciaSchema },
      { name: NonceUsado.name, schema: NonceUsadoSchema },
    ]),
    ScheduleModule,
    ThrottlerModule,
  ],
  controllers: [LicenciaController],
  providers: [
    LicenciaService,
    LicenciaCryptoService,
    LicenciaGeneratorService,
    { provide: LicenciaValidator, useClass: LicenciaValidatorService },
    LicenciaAuditService,
    LicenciaCronService,
    LicenciaOfflineService,
    LicenciaGuard,
  ],
  exports: [LicenciaService, LicenciaOfflineService, LicenciaGuard],
})
export class LicenciaModule {}
