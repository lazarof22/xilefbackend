import { Module } from '@nestjs/common';
import { TipoContratoService } from './tipo-contrato.service';
import { TipoContratoController } from './tipo-contrato.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TipoContrato,
  TipoContratoSchema,
} from './schema/tipo-contrato.schema';

@Module({
  controllers: [TipoContratoController],
  providers: [TipoContratoService],

  imports: [
    MongooseModule.forFeature([
      {
        name: TipoContrato.name,
        schema: TipoContratoSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class TipoContratoModule {}
