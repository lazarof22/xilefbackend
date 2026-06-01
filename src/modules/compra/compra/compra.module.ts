import { Module } from '@nestjs/common';
import { CompraService } from './compra.service';
import { CompraController } from './compra.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Compra, CompraSchema } from './schema/compra.schema';
import { Producto, ProductoSchema } from '../../inventario/producto/schemas/producto.schema';
import { Kardex, KardexSchema } from '../../inventario/kardex/schema/kardex.schema';

@Module({
  controllers: [CompraController],
  providers: [CompraService],
  imports: [
    MongooseModule.forFeature([
      { name: Compra.name, schema: CompraSchema },
      { name: Producto.name, schema: ProductoSchema },
      { name: Kardex.name, schema: KardexSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CompraModule {}
