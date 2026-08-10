import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanificacionPagosService } from './planificacion-pagos.service';
import { PlanificacionPagosController } from './planificacion-pagos.controller';
import { PlanPago, PlanPagoSchema } from './schema/plan-pago.schema';
import {
  Transaccion,
  TransaccionSchema,
} from '../../finanzas/transaccion/schema/transaccion.schema';
import { Banco, BancoSchema } from '../../finanzas/banco/schema/banco.schema';

@Module({
  controllers: [PlanificacionPagosController],
  providers: [PlanificacionPagosService],
  imports: [
    MongooseModule.forFeature([
      { name: PlanPago.name, schema: PlanPagoSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
      { name: Banco.name, schema: BancoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PlanificacionPagosModule {}
