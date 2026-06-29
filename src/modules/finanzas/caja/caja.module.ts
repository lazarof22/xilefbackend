import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';
import { MovimientoCaja, MovimientoCajaSchema } from './schema/caja.schema';
import { ArqueoCaja, ArqueoCajaSchema } from './schema/arqueo-caja.schema';
import { CuentaCaja, CuentaCajaSchema } from './schema/cuenta-caja.schema';
import { Banco, BancoSchema } from '../banco/schema/banco.schema';

@Module({
  controllers: [CajaController],
  providers: [CajaService],
  imports: [
    MongooseModule.forFeature([
      { name: MovimientoCaja.name, schema: MovimientoCajaSchema },
      { name: ArqueoCaja.name, schema: ArqueoCajaSchema },
      { name: CuentaCaja.name, schema: CuentaCajaSchema },
      { name: Banco.name, schema: BancoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CajaModule {}
