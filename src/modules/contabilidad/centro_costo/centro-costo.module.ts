import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CentroCostoService } from './centro-costo.service';
import { CentroCostoController } from './centro-costo.controller';
import { CentroCosto, CentroCostoSchema } from './schema/centro-costo.schema';

@Module({
  controllers: [CentroCostoController],
  providers: [CentroCostoService],
  imports: [
    MongooseModule.forFeature([
      { name: CentroCosto.name, schema: CentroCostoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CentroCostoModule {}
