import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanificacionComprasService } from './planificacion-compras.service';
import { PlanificacionComprasController } from './planificacion-compras.controller';
import { PlanCompra, PlanCompraSchema } from './schema/plan-compra.schema';
import {
  Producto,
  ProductoSchema,
} from '../../inventario/producto/schemas/producto.schema';
import {
  Proveedor,
  ProveedorSchema,
} from '../../clientes y provedores/proveedor/schema/proveedor.schema';
import {
  CentroCosto,
  CentroCostoSchema,
} from '../../costos/centro-costo/schema/centro-costo.schema';
import {
  Moneda,
  MonedaSchema,
} from '../../nomencladores/moneda/schema/moneda.schema';

@Module({
  controllers: [PlanificacionComprasController],
  providers: [PlanificacionComprasService],
  imports: [
    MongooseModule.forFeature([
      { name: PlanCompra.name, schema: PlanCompraSchema },
      { name: Producto.name, schema: ProductoSchema },
      { name: Proveedor.name, schema: ProveedorSchema },
      { name: CentroCosto.name, schema: CentroCostoSchema },
      { name: Moneda.name, schema: MonedaSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PlanificacionComprasModule {}
