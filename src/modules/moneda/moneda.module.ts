import { Module } from '@nestjs/common';
import { MonedaService } from './moneda.service';
import { MonedaController } from './moneda.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Moneda, MonedaSchema } from './schema/moneda.schem';

@Module({
  controllers: [MonedaController],
  providers: [MonedaService],

   imports: [MongooseModule.forFeature([{
        name: Moneda.name,
        schema: MonedaSchema,},]),],
      exports: [MongooseModule],
})


export class MonedaModule {}
