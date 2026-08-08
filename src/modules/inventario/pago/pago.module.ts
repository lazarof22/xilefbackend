import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pago, PagoSchema } from './schema/pago.schema';
import {
  PagoEfectivoSchema,
  PagoEfectivo,
} from './schema/pago_efectivo.schema';
import { PagoCredito, PagoCreditoSchema } from './schema/pago_credito.schema';
import {
  PagoTransferencia,
  PagoTransferenciaSchema,
} from './schema/pago_transferencia.schema';
import {
  Cliente,
  ClienteSchema,
} from 'src/modules/clientes y provedores/cliente/schemas/cliente.schema';
import { Venta, VentaSchema } from '../venta/schema/venta.schema';

@Module({
  controllers: [PagoController],
  providers: [PagoService],

  imports: [
    MongooseModule.forFeature([
      {
        name: Pago.name,
        schema: PagoSchema,
        discriminators: [
          { name: PagoEfectivo.name, schema: PagoEfectivoSchema },
          { name: PagoCredito.name, schema: PagoCreditoSchema },
          { name: PagoTransferencia.name, schema: PagoTransferenciaSchema },
        ],
      },
      { name: Cliente.name, schema: ClienteSchema },
      { name: Venta.name, schema: VentaSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PagoModule {}
