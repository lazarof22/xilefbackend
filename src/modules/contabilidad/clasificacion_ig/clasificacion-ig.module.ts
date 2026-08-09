import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClasificacionIGService } from './clasificacion-ig.service';
import { ClasificacionIGController } from './clasificacion-ig.controller';
import {
  ClasificacionIG,
  ClasificacionIGSchema,
} from './schema/clasificacion-ig.schema';

@Module({
  controllers: [ClasificacionIGController],
  providers: [ClasificacionIGService],
  imports: [
    MongooseModule.forFeature([
      { name: ClasificacionIG.name, schema: ClasificacionIGSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ClasificacionIGModule {}
