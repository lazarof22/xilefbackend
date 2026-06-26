import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnzonaController } from './enzona.controller';
import { EnzonaService } from './enzona.service';
import { Transaccion, TransaccionSchema } from '../transaccion/schema/transaccion.schema';
import { CuentaCobrar, CuentaCobrarSchema } from '../cuenta-cobrar/schema/cuenta-cobrar.schema';

@Module({
  controllers: [EnzonaController],
  providers: [EnzonaService],
  imports: [
    MongooseModule.forFeature([
      { name: Transaccion.name, schema: TransaccionSchema },
      { name: CuentaCobrar.name, schema: CuentaCobrarSchema },
    ]),
  ],
})
export class EnzonaModule {}
