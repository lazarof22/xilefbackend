import { Module } from '@nestjs/common';
import { TipoGastoService } from './tipo-gasto.service';
import { TipoGastoController } from './tipo-gasto.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoGasto, TipoGastoSchema } from './schema/tipo-gasto.schema';

@Module({
  controllers: [TipoGastoController],
  providers: [TipoGastoService],

  imports: [
    MongooseModule.forFeature([
      {
        name: TipoGasto.name,
        schema: TipoGastoSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class TipoGastoModule {}
