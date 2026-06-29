import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PosicionMonetariaService } from './posicion-monetaria.service';
import { PosicionMonetariaController } from './posicion-monetaria.controller';
import {
  PosicionMonetaria,
  PosicionMonetariaSchema,
} from './schema/posicion-monetaria.schema';
import { Banco, BancoSchema } from '../banco/schema/banco.schema';
import {
  CuentaCaja,
  CuentaCajaSchema,
} from '../caja/schema/cuenta-caja.schema';
import { TasaCambioService } from '../../nomencladores/tasa-cambio/tasa-cambio.service';
import {
  TasaCambio,
  TasaCambioSchema,
} from '../../nomencladores/tasa-cambio/schema/tasa-cambio.schema';

@Module({
  controllers: [PosicionMonetariaController],
  providers: [PosicionMonetariaService, TasaCambioService],
  imports: [
    MongooseModule.forFeature([
      { name: PosicionMonetaria.name, schema: PosicionMonetariaSchema },
      { name: Banco.name, schema: BancoSchema },
      { name: CuentaCaja.name, schema: CuentaCajaSchema },
      { name: TasaCambio.name, schema: TasaCambioSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PosicionMonetariaModule {}
