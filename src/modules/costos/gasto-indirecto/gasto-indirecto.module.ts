import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GastoIndirectoService } from './gasto-indirecto.service';
import { GastoIndirectoController } from './gasto-indirecto.controller';
import {
  GastoIndirecto,
  GastoIndirectoSchema,
} from './schema/gasto-indirecto.schema';

@Module({
  controllers: [GastoIndirectoController],
  providers: [GastoIndirectoService],
  imports: [
    MongooseModule.forFeature([
      { name: GastoIndirecto.name, schema: GastoIndirectoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class GastoIndirectoModule {}
