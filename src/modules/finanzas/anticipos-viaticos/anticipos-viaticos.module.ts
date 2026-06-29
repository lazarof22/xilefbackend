import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnticiposViaticosService } from './anticipos-viaticos.service';
import { AnticiposViaticosController } from './anticipos-viaticos.controller';
import { Anticipo, AnticipoSchema } from './schema/anticipo.schema';
import {
  LiquidacionViatico,
  LiquidacionViaticoSchema,
} from './schema/liquidacion-viatico.schema';
import { TransaccionModule } from '../transaccion/transaccion.module';

@Module({
  controllers: [AnticiposViaticosController],
  providers: [AnticiposViaticosService],
  imports: [
    MongooseModule.forFeature([
      { name: Anticipo.name, schema: AnticipoSchema },
      { name: LiquidacionViatico.name, schema: LiquidacionViaticoSchema },
    ]),
    TransaccionModule,
  ],
  exports: [MongooseModule],
})
export class AnticiposViaticosModule {}
