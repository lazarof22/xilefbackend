import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { Venta, VentaSchema } from './schema/venta.schema';
import { Cliente, ClienteSchema } from 'src/modules/cliente/schemas/cliente.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Producto, ProductoSchema } from '../producto/schemas/producto.schema';

@Module({
  imports: [
  MongooseModule.forFeature([
      { name: Venta.name, schema: VentaSchema },
      { name: Cliente.name, schema: ClienteSchema },
      { name: Producto.name, schema: ProductoSchema },
    ]),
  ],
  controllers: [VentaController],
  providers: [VentaService],
})
export class VentaModule {}
