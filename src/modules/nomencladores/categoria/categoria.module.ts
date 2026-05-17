import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { Categoria, CategoriaSchema } from './schema/categoria.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [CategoriaController],
  providers: [CategoriaService],

  imports: [MongooseModule.forFeature([{
          name: Categoria.name,
          schema: CategoriaSchema,},]),],
        exports: [MongooseModule],
})
export class CategoriaModule {}
