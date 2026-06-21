import { Module } from '@nestjs/common';
import { ReportePlusService } from './reporte_plus.service';
import { ReportePlusController } from './reporte_plus.controller';

@Module({
  controllers: [ReportePlusController],
  providers: [ReportePlusService],
})
export class ReportePlusModule {}
