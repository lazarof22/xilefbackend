import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CuentaService } from './cuenta.service';
import { CuentaController } from './cuenta.controller';
import { Cuenta, CuentaSchema } from './schema/cuenta.schema';

@Module({
  controllers: [CuentaController],
  providers: [CuentaService],
  imports: [MongooseModule.forFeature([{ name: Cuenta.name, schema: CuentaSchema }])],
  exports: [MongooseModule],
})
export class CuentaModule {}
