import { Module } from '@nestjs/common';
import { PaisService } from './pais.service';
import { PaisController } from './pais.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pais, PaisSchema } from './schema/pais.schema';

@Module({
  controllers: [PaisController],
  providers: [PaisService],

  imports: [MongooseModule.forFeature([{
          name: Pais.name,
          schema: PaisSchema,},]),],
        exports: [MongooseModule],
})
export class PaisModule {}
