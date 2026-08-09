import { Module } from '@nestjs/common';
import { ReportesContablesService } from './reportes-contables.service';
import { ReportesContablesController } from './reportes-contables.controller';
import { CuentaModule } from '../cuenta/cuenta.module';
import { ComprobanteModule } from '../comprobante/comprobante.module';
import { AsientoModule } from '../asiento/asiento.module';
import { ClasificacionIGModule } from '../clasificacion_ig/clasificacion-ig.module';
import { ElementoGastoModule } from '../elemento_gasto/elemento-gasto.module';
import { CentroCostoModule } from '../centro_costo/centro-costo.module';

@Module({
  imports: [
    CuentaModule,
    ComprobanteModule,
    AsientoModule,
    ClasificacionIGModule,
    ElementoGastoModule,
    CentroCostoModule,
  ],
  controllers: [ReportesContablesController],
  providers: [ReportesContablesService],
})
export class ReportesContablesModule {}
