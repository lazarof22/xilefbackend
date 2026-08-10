import { Module } from '@nestjs/common';
import { PresupuestoModule } from './presupuesto/presupuesto.module';
import { PlanificacionComprasModule } from './planificacion-compras/planificacion-compras.module';
import { PlanificacionPagosModule } from './planificacion-pagos/planificacion-pagos.module';
import { PlanificacionCobrosModule } from './planificacion-cobros/planificacion-cobros.module';
import { FlujoEfectivoModule } from './flujo-efectivo/flujo-efectivo.module';

@Module({
  imports: [
    PresupuestoModule,
    PlanificacionComprasModule,
    PlanificacionPagosModule,
    PlanificacionCobrosModule,
    FlujoEfectivoModule,
  ],
  exports: [
    PresupuestoModule,
    PlanificacionComprasModule,
    PlanificacionPagosModule,
    PlanificacionCobrosModule,
    FlujoEfectivoModule,
  ],
})
export class PlanificacionModule {}
