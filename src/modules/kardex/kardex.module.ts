import { Module } from '@nestjs/common';
import { KardexService } from './kardex.service';
import { KardexController } from './kardex.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Kardex, KardexSchema } from './schema/kardex.schema';
import { Producto, ProductoSchema } from '../producto/schemas/producto.schema';

@Module({
  controllers: [KardexController],
  providers: [KardexService],

  imports: [MongooseModule.forFeature([{
    name: Kardex.name,
    schema: KardexSchema,
  },
  {
    name: Producto.name,
    schema: ProductoSchema,
  },]),],
  exports: [MongooseModule],
})
export class KardexModule { }
