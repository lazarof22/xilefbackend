import { Module } from '@nestjs/common';
import { OperacionFinancieraService } from './operacion-financiera.service';
import { OperacionFinancieraController } from './operacion-financiera.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OperacionFinanciera,
  OperacionFinancieraSchema,
} from './schema/operacion-financiera.schema';
import {
  Transaccion,
  TransaccionSchema,
} from '../transaccion/schema/transaccion.schema';

@Module({
  controllers: [OperacionFinancieraController],
  providers: [OperacionFinancieraService],
  imports: [
    MongooseModule.forFeature([
      { name: OperacionFinanciera.name, schema: OperacionFinancieraSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class OperacionFinancieraModule {}
