import { Module } from '@nestjs/common';
import { CuadreCajaService } from './cuadre_caja.service';
import { CuadreCajaController } from './cuadre_caja.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CuadreCaja, CuadreCajaSchema } from './schema/cuadre_caja.schema';
import { Usuario, UsuarioSchema } from '../../auth/schemas/empleado.schema';
import { Venta, VentaSchema } from '../venta/schema/venta.schema';
import { Pago, PagoSchema } from '../pago/schema/pago.schema';

@Module({
  controllers: [CuadreCajaController],
  providers: [CuadreCajaService],
  imports: [
    MongooseModule.forFeature([
      { name: CuadreCaja.name, schema: CuadreCajaSchema },
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Venta.name, schema: VentaSchema },
      { name: Pago.name, schema: PagoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CuadreCajaModule {}
