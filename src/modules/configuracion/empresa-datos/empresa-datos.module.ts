import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmpresaDatosController } from './empresa-datos.controller';
import { EmpresaDatosService } from './empresa-datos.service';
import {
  EmpresaDatos,
  EmpresaDatosSchema,
} from './schemas/empresa-datos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmpresaDatos.name, schema: EmpresaDatosSchema },
    ]),
  ],
  controllers: [EmpresaDatosController],
  providers: [EmpresaDatosService],
  exports: [EmpresaDatosService],
})
export class EmpresaDatosModule {}
