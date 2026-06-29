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
import { GrupoActivoModule } from './modules/nomencladores/grupo_activo/grupo_activo.module';
import { DepartamentoModule } from './modules/nomencladores/departamento/departamento.module';
import { CargoEmpleadoModule } from './modules/nomencladores/cargo_empleado/cargo_empleado.module';
import { CompraModule } from './modules/compra/compra/compra.module';
import { PagoModule } from './modules/venta/pago/pago.module';
import { EmpresaModule } from './modules/clientes y provedores/empresa/empresa.module';
import { CuentaModule } from './modules/contabilidad/cuenta/cuenta.module';
import { PaisModule } from './modules/nomencladores/pais/pais.module';
import { ConceptoModule } from './modules/contabilidad/concepto/concepto.module';
import { TasaDepreciacionModule } from './modules/nomencladores/tasa_depreciacion/tasa_depreciacion.module';
import { MovimientoModule } from './modules/contabilidad/movimiento/movimiento.module';
import { LicenciaModule } from './modules/configuracion/licencia/licencia.module';
import { EmpresaDatosModule } from './modules/configuracion/empresa-datos/empresa-datos.module';
import { UsuariosModule } from './modules/configuracion/usuarios/usuarios.module';
import { ImportExportModule } from './modules/configuracion/import-export/import-export.module';
import { ReportePlusModule } from './modules/venta/reporte_plus/reporte_plus.module';
import { ReporteCajaModule } from './modules/venta/reporte_caja/reporte_caja.module';
import { ConteoFisicoModule } from './modules/contabilidad/conteo_fisico/conteo_fisico.module';
import { ContenedorModule } from './modules/inventario/contenedor/contenedor.module';
import { AlmacenModule } from './modules/inventario/almacen/almacen.module';
import { TransferenciaModule } from './modules/inventario/transferencia/transferencia.module';
import { EnzonaModule } from './modules/finanzas/enzona/enzona.module';
import { BancoModule } from './modules/finanzas/banco/banco.module';
import { CuentaCobrarModule } from './modules/finanzas/cuenta-cobrar/cuenta-cobrar.module';
import { CuentaPagarModule } from './modules/finanzas/cuenta-pagar/cuenta-pagar.module';
import { TransaccionModule } from './modules/finanzas/transaccion/transaccion.module';
import { ConciliacionModule } from './modules/finanzas/conciliacion/conciliacion.module';
import { CajaModule } from './modules/finanzas/caja/caja.module';
import { CombustibleModule } from './modules/finanzas/combustible/combustible.module';
import { CreditoModule } from './modules/finanzas/credito/credito.module';
import { ChequeModule } from './modules/finanzas/cheque/cheque.module';
import { OperacionFinancieraModule } from './modules/finanzas/operacion-financiera/operacion-financiera.module';
import { PlanificacionPagosModule } from './modules/finanzas/planificacion-pagos/planificacion-pagos.module';
import { FlujoEfectivoModule } from './modules/finanzas/flujo-efectivo/flujo-efectivo.module';
import { AnticiposViaticosModule } from './modules/finanzas/anticipos-viaticos/anticipos-viaticos.module';
import { CambioDivisaModule } from './modules/finanzas/cambio-divisa/cambio-divisa.module';
import { PosicionMonetariaModule } from './modules/finanzas/posicion-monetaria/posicion-monetaria.module';
import { PlanificacionCobrosModule } from './modules/finanzas/planificacion-cobros/planificacion-cobros.module';
import { TransferenciasModule } from './modules/finanzas/transferencias/transferencias.module';
import { RedistribucionRecursosModule } from './modules/finanzas/redistribucion-recursos/redistribucion-recursos.module';
import { TransfermovilModule } from './modules/finanzas/transfermovil/transfermovil.module';
import { TasaCambioModule } from './modules/nomencladores/tasa-cambio/tasa-cambio.module';

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
    AlmacenModule,
    AreaModule,
    AuthModule,
    CategoriaModule,
    CargoEmpleadoModule,
    ClienteModule,
    ConceptoModule,
    ContenedorModule,
    CompraModule,
    CuentaModule,
    DepartamentoModule,
    EmpresaModule,
    EmpresaDatosModule,
    EstadoModule,
    GrupoActivoModule,
    ImportExportModule,
    KardexModule,
    LicenciaModule,
    MonedaModule,
    PagoModule,
    PaisModule,
    ProductoModule,
    UsuariosModule,
    VentaModule,
    MovimientoModule,
    TasaDepreciacionModule,
    TransferenciaModule,
    ReportePlusModule,
    ReporteCajaModule,
    ConteoFisicoModule,
    BancoModule,
    CuentaCobrarModule,
    CuentaPagarModule,
    TransaccionModule,
    ConciliacionModule,
    CajaModule,
    CombustibleModule,
    CreditoModule,
    ChequeModule,
    OperacionFinancieraModule,
    PlanificacionPagosModule,
    FlujoEfectivoModule,
    AnticiposViaticosModule,
    CambioDivisaModule,
    PosicionMonetariaModule,
    PlanificacionCobrosModule,
    TransferenciasModule,
    RedistribucionRecursosModule,
    TransfermovilModule,
    TasaCambioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
