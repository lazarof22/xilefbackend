import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';
import { MovimientoCaja, MovimientoCajaSchema } from './schema/caja.schema';
import { ArqueoCaja, ArqueoCajaSchema } from './schema/arqueo-caja.schema';

@Module({
  controllers: [CajaController],
  providers: [CajaService],
  imports: [
    MongooseModule.forFeature([
      { name: MovimientoCaja.name, schema: MovimientoCajaSchema },
      { name: ArqueoCaja.name, schema: ArqueoCajaSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CajaModule {}
