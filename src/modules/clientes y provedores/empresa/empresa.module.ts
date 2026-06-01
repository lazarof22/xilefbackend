import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Empresa, EmpresaSchema } from './schema/empresa.schema';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService],
  imports: [
      MongooseModule.forFeature([
        { name: Empresa.name, schema: EmpresaSchema },
      ]),
    ],
})
export class EmpresaModule {}
