import { Module } from '@nestjs/common';
import { ConceptoService } from './concepto.service';
import { ConceptoController } from './concepto.controller';
import { Concepto, ConceptoSchema } from './schema/concepto.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

@Module({
  controllers: [ConceptoController],
  providers: [ConceptoService],

  imports: [MongooseModule.forFeature([{
    name: Concepto.name,
    schema: ConceptoSchema,
  },]),],
  exports: [MongooseModule],
})
export class ConceptoModule { }
