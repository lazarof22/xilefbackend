import { Module } from '@nestjs/common';
import { ConciliacionService } from './conciliacion.service';
import { ConciliacionController } from './conciliacion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conciliacion, ConciliacionSchema } from './schema/conciliacion.schema';

@Module({
  controllers: [ConciliacionController],
  providers: [ConciliacionService],
  imports: [MongooseModule.forFeature([{ name: Conciliacion.name, schema: ConciliacionSchema }])],
  exports: [MongooseModule],
})
export class ConciliacionModule {}
