import { Module } from '@nestjs/common';
import { PlanificacionCobrosService } from './planificacion-cobros.service';
import { PlanificacionCobrosController } from './planificacion-cobros.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanCobro, PlanCobroSchema } from './schema/plan-cobro.schema';

@Module({
  controllers: [PlanificacionCobrosController],
  providers: [PlanificacionCobrosService],
  imports: [
    MongooseModule.forFeature([
      { name: PlanCobro.name, schema: PlanCobroSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PlanificacionCobrosModule {}
