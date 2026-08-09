import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { Factura, FacturaSchema } from './schema/factura.schema';
import {
  Cliente,
  ClienteSchema,
} from '../clientes y provedores/cliente/schemas/cliente.schema';
import { EmpresaDatosModule } from '../configuracion/empresa-datos/empresa-datos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Factura.name, schema: FacturaSchema },
      { name: Cliente.name, schema: ClienteSchema },
    ]),
    EmpresaDatosModule,
  ],
  controllers: [FacturaController],
  providers: [FacturaService],
  exports: [MongooseModule],
})
export class FacturaModule {}
