import { Module } from '@nestjs/common';
import { CentroCostoModule } from './centro-costo/centro-costo.module';
import { FichaCostoModule } from './ficha-costo/ficha-costo.module';
import { GastoIndirectoModule } from './gasto-indirecto/gasto-indirecto.module';

@Module({
  imports: [CentroCostoModule, FichaCostoModule, GastoIndirectoModule],
  exports: [CentroCostoModule, FichaCostoModule, GastoIndirectoModule],
})
export class CostosModule {}
