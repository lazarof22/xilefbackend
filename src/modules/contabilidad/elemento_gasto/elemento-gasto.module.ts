import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ElementoGastoService } from './elemento-gasto.service';
import { ElementoGastoController } from './elemento-gasto.controller';
import {
  ElementoGasto,
  ElementoGastoSchema,
} from './schema/elemento-gasto.schema';

@Module({
  controllers: [ElementoGastoController],
  providers: [ElementoGastoService],
  imports: [
    MongooseModule.forFeature([
      { name: ElementoGasto.name, schema: ElementoGastoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ElementoGastoModule {}
