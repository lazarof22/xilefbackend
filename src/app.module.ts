import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClienteModule } from './modules/clientes y provedores/cliente/cliente.module';
import { ProveedorModule } from './modules/clientes y provedores/proveedor/proveedor.module';
import { ProductoModule } from './modules/inventario/producto/producto.module';
import { AuthModule } from './modules/auth/auth.module';
import { KardexModule } from './modules/inventario/kardex/kardex.module';
import { VentaModule } from './modules/inventario/venta/venta.module';
import { MonedaModule } from './modules/nomencladores/moneda/moneda.module';
import { NaturalezaCuentaModule } from './modules/nomencladores/naturaleza-cuenta/naturaleza-cuenta.module';
import { ActivoFijoModule } from './modules/contabilidad/activoFijo/activo_fijo.module';
import { AreaModule } from './modules/nomencladores/area/area.module';
import { AuditModule } from './modules/auditoria/audit.module';
import { CategoriaModule } from './modules/nomencladores/categoria/categoria.module';
import { EstadoModule } from './modules/nomencladores/estado/estado.module';
import { FormaPagoModule } from './modules/nomencladores/forma-pago/forma-pago.module';
import { GrupoActivoModule } from './modules/nomencladores/grupo_activo/grupo_activo.module';
import { DepartamentoModule } from './modules/nomencladores/departamento/departamento.module';
import { CargoEmpleadoModule } from './modules/nomencladores/cargo_empleado/cargo_empleado.module';
import { CompraModule } from './modules/compra/compra/compra.module';
import { CostosModule } from './modules/costos/costos.module';
import { PagoModule } from './modules/inventario/pago/pago.module';
import { EmpresaModule } from './modules/clientes y provedores/empresa/empresa.module';
import { CuentaModule } from './modules/contabilidad/cuenta/cuenta.module';
import { PaisModule } from './modules/nomencladores/pais/pais.module';
import { PlanificacionModule } from './modules/planificacion/planificacion.module';
import { ConceptoModule } from './modules/contabilidad/concepto/concepto.module';
import { TasaDepreciacionModule } from './modules/nomencladores/tasa_depreciacion/tasa_depreciacion.module';
import { TipoContratoModule } from './modules/nomencladores/tipo-contrato/tipo-contrato.module';
import { TipoGastoModule } from './modules/nomencladores/tipo-gasto/tipo-gasto.module';
import { TipoProveedorModule } from './modules/nomencladores/tipo-proveedor/tipo-proveedor.module';
import { MovimientoModule } from './modules/contabilidad/movimiento/movimiento.module';
import { LicenciaModule } from './modules/licencia/licencia.module';
import { EmpresaDatosModule } from './modules/configuracion/empresa-datos/empresa-datos.module';
import { UsuariosModule } from './modules/configuracion/usuarios/usuarios.module';
import { ImportExportModule } from './modules/configuracion/import-export/import-export.module';
import { ReportePlusModule } from './modules/inventario/reporte_plus/reporte_plus.module';
import { ExtraccionModule } from './modules/inventario/extraccion/extraccion.module';
import { CuadreCajaModule } from './modules/inventario/cuadre_caja/cuadre_caja.module';
import { ConteoFisicoModule } from './modules/contabilidad/conteo_fisico/conteo_fisico.module';
import { ContenedorModule } from './modules/inventario/contenedor/contenedor.module';
import { AlmacenModule } from './modules/inventario/almacen/almacen.module';
import { TransferenciaModule } from './modules/inventario/transferencia/transferencia.module';
import { EnzonaModule } from './modules/finanzas/enzona/enzona.module';
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
import { UnidadMedidaModule } from './modules/nomencladores/unidad-medida/unidad-medida.module';
import { BancoModule } from './modules/nomencladores/banco/banco.module';
import { FacturaModule } from './modules/factura/factura.module';
import { AsientoModule } from './modules/contabilidad/asiento/asiento.module';
import { CentroCostoModule } from './modules/contabilidad/centro_costo/centro-costo.module';
import { ClasificacionIGModule } from './modules/contabilidad/clasificacion_ig/clasificacion-ig.module';
import { ComprobanteModule } from './modules/contabilidad/comprobante/comprobante.module';
import { ElementoGastoModule } from './modules/contabilidad/elemento_gasto/elemento-gasto.module';
import { ReportesContablesModule } from './modules/contabilidad/reportes_contables/reportes-contables.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    //Iniciacion de los modulos
    ActivoFijoModule,
    AlmacenModule,
    AreaModule,
    AuditModule,
    AuthModule,
    CategoriaModule,
    CargoEmpleadoModule,
    ClienteModule,
    ConceptoModule,
    ContenedorModule,
    CompraModule,
    CostosModule,
    CuentaModule,
    DepartamentoModule,
    EmpresaModule,
    EmpresaDatosModule,
    EstadoModule,
    FormaPagoModule,
    GrupoActivoModule,
    ImportExportModule,
    KardexModule,
    LicenciaModule,
    MonedaModule,
    NaturalezaCuentaModule,
    PagoModule,
    PaisModule,
    PlanificacionModule,
    ProductoModule,
    ProveedorModule,
    UsuariosModule,
    VentaModule,
    MovimientoModule,
    TasaDepreciacionModule,
    TipoContratoModule,
    TipoGastoModule,
    TipoProveedorModule,
    TransferenciaModule,
    ReportePlusModule,
    ExtraccionModule,
    ConteoFisicoModule,
    BancoModule,
    CuentaCobrarModule,
    CuentaPagarModule,
    TransaccionModule,
    ConciliacionModule,
    CajaModule,
    CuadreCajaModule,
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
    UnidadMedidaModule,
    TasaCambioModule,
    FacturaModule,
    AsientoModule,
    CentroCostoModule,
    ClasificacionIGModule,
    ComprobanteModule,
    ElementoGastoModule,
    ReportesContablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
