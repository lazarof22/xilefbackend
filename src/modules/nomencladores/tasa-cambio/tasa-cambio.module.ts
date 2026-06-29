import { Module } from '@nestjs/common';
import { TasaCambioService } from './tasa-cambio.service';
import { TasaCambioController } from './tasa-cambio.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TasaCambio, TasaCambioSchema } from './schema/tasa-cambio.schema';

@Module({
  controllers: [TasaCambioController],
  providers: [TasaCambioService],

  imports: [
    MongooseModule.forFeature([
      {
        name: TasaCambio.name,
        schema: TasaCambioSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class TasaCambioModule {}
