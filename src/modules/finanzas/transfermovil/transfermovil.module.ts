import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransfermovilController } from './transfermovil.controller';
import { TransfermovilService } from './transfermovil.service';
import {
  TransfermovilPago,
  TransfermovilPagoSchema,
} from './schema/transfermovil.schema';
import { QrEstatico, QrEstaticoSchema } from './schema/qr-estatico.schema';
import {
  Transaccion,
  TransaccionSchema,
} from '../transaccion/schema/transaccion.schema';
import {
  CuentaCobrar,
  CuentaCobrarSchema,
} from '../cuenta-cobrar/schema/cuenta-cobrar.schema';

@Module({
  controllers: [TransfermovilController],
  providers: [TransfermovilService],
  imports: [
    MongooseModule.forFeature([
      { name: TransfermovilPago.name, schema: TransfermovilPagoSchema },
      { name: QrEstatico.name, schema: QrEstaticoSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
      { name: CuentaCobrar.name, schema: CuentaCobrarSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class TransfermovilModule {}
