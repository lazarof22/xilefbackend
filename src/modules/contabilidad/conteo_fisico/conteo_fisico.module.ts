import { Module } from '@nestjs/common';
import { ConteoFisicoService } from './conteo_fisico.service';
import { ConteoFisicoController } from './conteo_fisico.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConteoFisico, ConteoFisicoSchema } from './schema/conteo_fisico.schema';
import { ConteoDetalle, ConteoDetalleSchema } from './schema/conteo_detalle.schema';

@Module({
  controllers: [ConteoFisicoController],
  providers: [ConteoFisicoService],
  imports: [
    MongooseModule.forFeature([
      { name: ConteoFisico.name, schema: ConteoFisicoSchema },
      { name: ConteoDetalle.name, schema: ConteoDetalleSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ConteoFisicoModule {}
