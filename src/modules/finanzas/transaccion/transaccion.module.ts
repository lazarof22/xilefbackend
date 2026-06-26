import { Module } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { TransaccionController } from './transaccion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaccion, TransaccionSchema } from './schema/transaccion.schema';

@Module({
  controllers: [TransaccionController],
  providers: [TransaccionService],
  imports: [MongooseModule.forFeature([{ name: Transaccion.name, schema: TransaccionSchema }])],
  exports: [MongooseModule],
})
export class TransaccionModule {}
