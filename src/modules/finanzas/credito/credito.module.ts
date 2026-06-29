import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditoService } from './credito.service';
import { CreditoController } from './credito.controller';
import { Credito, CreditoSchema } from './schema/credito.schema';
import {
  CuotaCredito,
  CuotaCreditoSchema,
} from './schema/cuota-credito.schema';
import {
  Transaccion,
  TransaccionSchema,
} from '../transaccion/schema/transaccion.schema';
@Module({
  controllers: [CreditoController],
  providers: [CreditoService],
  imports: [
    MongooseModule.forFeature([
      { name: Credito.name, schema: CreditoSchema },
      { name: CuotaCredito.name, schema: CuotaCreditoSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CreditoModule {}
