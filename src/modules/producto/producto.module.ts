import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Producto, ProductoSchema } from './schemas/producto.schema';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService],

  imports: [MongooseModule.forFeature([{
        name: Producto.name,
        schema: ProductoSchema,},]),],
      exports: [MongooseModule],
})
export class ProductoModule {}
