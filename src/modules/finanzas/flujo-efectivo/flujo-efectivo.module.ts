import { Module } from '@nestjs/common';
import { FlujoEfectivoService } from './flujo-efectivo.service';
import { FlujoEfectivoController } from './flujo-efectivo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProyeccionFlujo,
  ProyeccionFlujoSchema,
} from './schema/proyeccion-flujo.schema';
import {
  CuentaCobrar,
  CuentaCobrarSchema,
} from '../cuenta-cobrar/schema/cuenta-cobrar.schema';
import {
  CuentaPagar,
  CuentaPagarSchema,
} from '../cuenta-pagar/schema/cuenta-pagar.schema';

@Module({
  controllers: [FlujoEfectivoController],
  providers: [FlujoEfectivoService],
  imports: [
    MongooseModule.forFeature([
      { name: ProyeccionFlujo.name, schema: ProyeccionFlujoSchema },
      { name: CuentaCobrar.name, schema: CuentaCobrarSchema },
      { name: CuentaPagar.name, schema: CuentaPagarSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class FlujoEfectivoModule {}
