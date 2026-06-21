import { Module } from '@nestjs/common';
import { ReporteCajaService } from './reporte_caja.service';
import { ReporteCajaController } from './reporte_caja.controller';

@Module({
  controllers: [ReporteCajaController],
  providers: [ReporteCajaService],
})
export class ReporteCajaModule {}
