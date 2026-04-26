import { Module } from '@nestjs/common';
import { TasaDepreciacionService } from './tasa_depreciacion.service';
import { TasaDepreciacionController } from './tasa_depreciacion.controller';

@Module({
  controllers: [TasaDepreciacionController],
  providers: [TasaDepreciacionService],
})
export class TasaDepreciacionModule {}
