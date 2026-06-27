import { Module } from '@nestjs/common';
import { TasaDepreciacionService } from './tasa_depreciacion.service';
import { TasaDepreciacionController } from './tasa_depreciacion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tasa_Depreciacion, Tasa_DepreciacionSchema } from './schema/tasa_depreciacion.schema';

@Module({
  controllers: [TasaDepreciacionController],
  providers: [TasaDepreciacionService],

  imports: [MongooseModule.forFeature([{
          name: Tasa_Depreciacion.name,
          schema: Tasa_DepreciacionSchema,},]),],
        exports: [MongooseModule],
})
export class TasaDepreciacionModule {}
