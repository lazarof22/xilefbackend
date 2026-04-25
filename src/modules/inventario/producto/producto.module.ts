import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Producto, ProductoSchema } from './schemas/producto.schema';
import { Estado, EstadoSchema } from 'src/modules/nomencladores/estado/schema/estado.schema';
import { Categoria, CategoriaSchema } from 'src/modules/nomencladores/categoria/schema/categoria.schema';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService],

  imports: [MongooseModule.forFeature([{
    name: Producto.name,
    schema: ProductoSchema,
  },
  { name: Estado.name, schema: EstadoSchema },
  { name: Categoria.name, schema: CategoriaSchema },]),],
  exports: [MongooseModule],
})
export class ProductoModule { }
