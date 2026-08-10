import { Module } from '@nestjs/common';
import { UnidadMedidaService } from './unidad-medida.service';
import { UnidadMedidaController } from './unidad-medida.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UnidadMedida,
  UnidadMedidaSchema,
} from './schema/unidad-medida.schema';

@Module({
  controllers: [UnidadMedidaController],
  providers: [UnidadMedidaService],

  imports: [
    MongooseModule.forFeature([
      {
        name: UnidadMedida.name,
        schema: UnidadMedidaSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class UnidadMedidaModule {}
