import { Module } from '@nestjs/common';
import { ReportePlusService } from './reporte_plus.service';
import { ReportePlusController } from './reporte_plus.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportePlus, ReportePlusSchema } from './schema/reporte_plus.schema';
import { Kardex, KardexSchema } from '../../inventario/kardex/schema/kardex.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportePlus.name, schema: ReportePlusSchema },
      { name: Kardex.name, schema: KardexSchema },
    ]),
  ],
  controllers: [ReportePlusController],
  providers: [ReportePlusService],
  exports: [MongooseModule],
})
export class ReportePlusModule {}
