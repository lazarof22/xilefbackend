import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtraccionService } from './extraccion.service';
import { ExtraccionController } from './extraccion.controller';
import { Extraccion, ExtraccionSchema } from './schema/extraccion.schema';

@Module({
  controllers: [ExtraccionController],
  providers: [ExtraccionService],
  imports: [
    MongooseModule.forFeature([
      { name: Extraccion.name, schema: ExtraccionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ExtraccionModule {}
