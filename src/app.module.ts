import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClienteModule } from './modules/clientes y provedores/cliente/cliente.module';
import { ProductoModule } from './modules/inventario/producto/producto.module';
import { AuthModule } from './modules/auth/auth.module';
import { KardexModule } from './modules/inventario/kardex/kardex.module';
import { VentaModule } from './modules/venta/venta/venta.module';
import { MonedaModule } from './modules/nomencladores/moneda/moneda.module';
import { ActivoFijoModule } from './modules/contabilidad/activoFijo/activo_fijo.module';
import { AreaModule } from './modules/nomencladores/area/area.module';
import { CategoriaModule } from './modules/nomencladores/categoria/categoria.module';
import { EstadoModule } from './modules/nomencladores/estado/estado.module';
import { DepartamentoModule } from './modules/nomencladores/departamento/departamento.module';
import { CargoEmpleadoModule } from './modules/nomencladores/cargo_empleado/cargo_empleado.module';
import { CompraModule } from './modules/compra/compra/compra.module';
import { PagoModule } from './modules/venta/pago/pago.module';
import { EmpresaModule } from './modules/clientes y provedores/empresa/empresa.module';
import { CuentaModule } from './modules/contabilidad/cuenta/cuenta.module';


@Module({
  imports: [

    //Configuracion de la Base de datos
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    //Iniciacion de los modulos
    ActivoFijoModule,
    AreaModule,
    AuthModule,
    CategoriaModule,
    CargoEmpleadoModule,
    ClienteModule,
    CompraModule,
    CuentaModule,
    DepartamentoModule,
    EmpresaModule,
    EstadoModule,
    KardexModule,
    MonedaModule,
    PagoModule,
    ProductoModule,
    VentaModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
