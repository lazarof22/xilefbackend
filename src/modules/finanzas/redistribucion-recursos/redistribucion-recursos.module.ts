import { Module } from '@nestjs/common';
import { RedistribucionRecursosService } from './redistribucion-recursos.service';
import { RedistribucionRecursosController } from './redistribucion-recursos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Redistribucion,
  RedistribucionSchema,
} from './schema/redistribucion.schema';

@Module({
  controllers: [RedistribucionRecursosController],
  providers: [RedistribucionRecursosService],
  imports: [
    MongooseModule.forFeature([
      { name: Redistribucion.name, schema: RedistribucionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class RedistribucionRecursosModule {}
