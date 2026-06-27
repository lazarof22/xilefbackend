import { Module } from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { MovimientoController } from './movimiento.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movimiento, MovimientoSchema } from './schema/movimiento.schema';

@Module({
  controllers: [MovimientoController],
  providers: [MovimientoService],
  imports: [
    MongooseModule.forFeature([
      { name: Movimiento.name, schema: MovimientoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MovimientoModule {}
