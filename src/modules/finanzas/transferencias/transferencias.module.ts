import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransferenciasService } from './transferencias.service';
import { TransferenciasController } from './transferencias.controller';
import {
  Transferencia,
  TransferenciaSchema,
} from './schema/transferencia.schema';
import {
  Banco,
  BancoSchema,
} from '../banco/schema/banco.schema';
import {
  Transaccion,
  TransaccionSchema,
} from '../transaccion/schema/transaccion.schema';
import {
  MovimientoCaja,
  MovimientoCajaSchema,
} from '../caja/schema/caja.schema';

@Module({
  controllers: [TransferenciasController],
  providers: [TransferenciasService],
  imports: [
    MongooseModule.forFeature([
      { name: Transferencia.name, schema: TransferenciaSchema },
      { name: Banco.name, schema: BancoSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
      { name: MovimientoCaja.name, schema: MovimientoCajaSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class TransferenciasModule {}
