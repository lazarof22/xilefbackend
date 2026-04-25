import { Module } from '@nestjs/common';
import { PlanCuentasService } from './plan_cuentas.service';
import { PlanCuentasController } from './plan_cuentas.controller';

@Module({
  controllers: [PlanCuentasController],
  providers: [PlanCuentasService],
})
export class PlanCuentasModule {}
