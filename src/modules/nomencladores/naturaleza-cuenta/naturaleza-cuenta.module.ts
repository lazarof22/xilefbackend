import { Module } from '@nestjs/common';
import { NaturalezaCuentaService } from './naturaleza-cuenta.service';
import { NaturalezaCuentaController } from './naturaleza-cuenta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NaturalezaCuenta,
  NaturalezaCuentaSchema,
} from './schema/naturaleza-cuenta.schema';

@Module({
  controllers: [NaturalezaCuentaController],
  providers: [NaturalezaCuentaService],

  imports: [
    MongooseModule.forFeature([
      {
        name: NaturalezaCuenta.name,
        schema: NaturalezaCuentaSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class NaturalezaCuentaModule {}
