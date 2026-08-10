import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FichaCostoService } from './ficha-costo.service';
import { FichaCostoController } from './ficha-costo.controller';
import { FichaCosto, FichaCostoSchema } from './schema/ficha-costo.schema';

@Module({
  controllers: [FichaCostoController],
  providers: [FichaCostoService],
  imports: [
    MongooseModule.forFeature([
      { name: FichaCosto.name, schema: FichaCostoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class FichaCostoModule {}
