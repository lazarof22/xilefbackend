import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresupuestoService } from './presupuesto.service';
import { PresupuestoController } from './presupuesto.controller';
import { Presupuesto, PresupuestoSchema } from './schema/presupuesto.schema';
import {
  CentroCosto,
  CentroCostoSchema,
} from '../../costos/centro-costo/schema/centro-costo.schema';
import {
  TipoGasto,
  TipoGastoSchema,
} from '../../nomencladores/tipo-gasto/schema/tipo-gasto.schema';
import {
  Moneda,
  MonedaSchema,
} from '../../nomencladores/moneda/schema/moneda.schema';

@Module({
  controllers: [PresupuestoController],
  providers: [PresupuestoService],
  imports: [
    MongooseModule.forFeature([
      { name: Presupuesto.name, schema: PresupuestoSchema },
      { name: CentroCosto.name, schema: CentroCostoSchema },
      { name: TipoGasto.name, schema: TipoGastoSchema },
      { name: Moneda.name, schema: MonedaSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PresupuestoModule {}
