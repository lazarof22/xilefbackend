import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CambioDivisaService } from './cambio-divisa.service';
import { CambioDivisaController } from './cambio-divisa.controller';
import {
  CambioDivisa,
  CambioDivisaSchema,
} from './schema/cambio-divisa.schema';
import {
  CuentaCaja,
  CuentaCajaSchema,
} from '../caja/schema/cuenta-caja.schema';
import { TasaCambioService } from '../../nomencladores/tasa-cambio/tasa-cambio.service';
import {
  TasaCambio,
  TasaCambioSchema,
} from '../../nomencladores/tasa-cambio/schema/tasa-cambio.schema';
import { BancoService } from '../banco/banco.service';
import { Banco, BancoSchema } from '../banco/schema/banco.schema';

@Module({
  controllers: [CambioDivisaController],
  providers: [CambioDivisaService, TasaCambioService, BancoService],
  imports: [
    MongooseModule.forFeature([
      { name: CambioDivisa.name, schema: CambioDivisaSchema },
      { name: CuentaCaja.name, schema: CuentaCajaSchema },
      { name: TasaCambio.name, schema: TasaCambioSchema },
      { name: Banco.name, schema: BancoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CambioDivisaModule {}
