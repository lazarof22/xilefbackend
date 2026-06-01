import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { Venta, VentaSchema } from './schema/venta.schema';
import { Cliente, ClienteSchema } from 'src/modules/clientes y provedores/cliente/schemas/cliente.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Producto, ProductoSchema } from '../../inventario/producto/schemas/producto.schema';
import { Kardex, KardexSchema } from 'src/modules/inventario/kardex/schema/kardex.schema';
import { Pago, PagoSchema } from '../pago/schema/pago.schema';

@Module({
  imports: [
  MongooseModule.forFeature([
      { name: Venta.name, schema: VentaSchema },
      { name: Cliente.name, schema: ClienteSchema },
      { name: Producto.name, schema: ProductoSchema },
      { name: Kardex.name, schema: KardexSchema },
      { name: Pago.name, schema: PagoSchema },
    ]),
  ],
  controllers: [VentaController],
  providers: [VentaService],
})
export class VentaModule {}
