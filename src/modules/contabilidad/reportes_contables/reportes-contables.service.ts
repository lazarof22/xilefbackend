import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FiltroReporteDto } from './dto/filtro-reporte.dto';
import {
  Cuenta,
  CuentaDocument,
  NaturalezaCuenta,
} from '../cuenta/schema/cuenta.schema';
import {
  Comprobante,
  ComprobanteDocument,
} from '../comprobante/schema/comprobante.schema';
import { Asiento, AsientoDocument } from '../asiento/schema/asiento.schema';
import {
  ClasificacionIG,
  ClasificacionIGDocument,
  TipoClasificacionIG,
} from '../clasificacion_ig/schema/clasificacion-ig.schema';
import {
  ElementoGasto,
  ElementoGastoDocument,
} from '../elemento_gasto/schema/elemento-gasto.schema';
import {
  CentroCosto,
  CentroCostoDocument,
} from '../centro_costo/schema/centro-costo.schema';

export interface ResultadoLinea {
  id: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  tipo: 'Ingreso' | 'Gasto';
  monto: number;
  periodo: string;
}

export interface ResumenPeriodo {
  totalIngresos: number;
  totalGastos: number;
  utilidadNeta: number;
  margenUtilidad: number;
}

export interface ResultadoElemento {
  id: string;
  elementoCodigo: string;
  elementoNombre: string;
  monto: number;
  cantidadMovimientos: number;
  porcentaje: number;
}

export interface BalanceLinea {
  id: string;
  codigo: string;
  cuenta: string;
  naturaleza: string;
  totalDebe: number;
  totalHaber: number;
  saldoDeudor: number;
  saldoAcreedor: number;
}

export interface ResumenBalance {
  sumaDebe: number;
  sumaHaber: number;
  sumaSaldoDeudor: number;
  sumaSaldoAcreedor: number;
  diferencia: number;
  cuadrado: boolean;
}

export interface SubmayorLinea {
  id: string;
  fecha: string;
  comprobante: string;
  concepto: string;
  debe: number;
  haber: number;
  saldo: number;
  centroCosto: string;
}

@Injectable()
export class ReportesContablesService {
  constructor(
    @InjectModel(Cuenta.name) private cuentaModel: Model<CuentaDocument>,
    @InjectModel(Comprobante.name)
    private comprobanteModel: Model<ComprobanteDocument>,
    @InjectModel(Asiento.name) private asientoModel: Model<AsientoDocument>,
    @InjectModel(ClasificacionIG.name)
    private clasificacionModel: Model<ClasificacionIGDocument>,
    @InjectModel(ElementoGasto.name)
    private elementoGastoModel: Model<ElementoGastoDocument>,
    @InjectModel(CentroCosto.name)
    private centroCostoModel: Model<CentroCostoDocument>,
  ) {}

  private rangoFechas(
    fechaInicio?: string,
    fechaFin?: string,
  ): { inicio: Date; fin: Date } {
    const ahora = new Date();
    const inicio = fechaInicio
      ? new Date(`${fechaInicio}T00:00:00.000`)
      : new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const fin = fechaFin
      ? new Date(`${fechaFin}T23:59:59.999`)
      : new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
    return { inicio, fin };
  }

  private aYmd(fecha: Date): string {
    const d = new Date(fecha);
    const mes = `${d.getMonth() + 1}`.padStart(2, '0');
    const dia = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  async estadoRendimiento(
    filtro: FiltroReporteDto,
  ): Promise<{ lineas: ResultadoLinea[]; resumen: ResumenPeriodo }> {
    const { inicio, fin } = this.rangoFechas(
      filtro.fechaInicio,
      filtro.fechaFin,
    );
    const periodo = `${this.aYmd(inicio)} al ${this.aYmd(fin)}`;

    const [comprobantes, asientos, clasificaciones, cuentas] =
      await Promise.all([
        this.comprobanteModel
          .find({ fecha: { $gte: inicio, $lte: fin } })
          .exec(),
        this.asientoModel.find({ fecha: { $gte: inicio, $lte: fin } }).exec(),
        this.clasificacionModel.find().exec(),
        this.cuentaModel.find().exec(),
      ]);

    const lineas: ResultadoLinea[] = [];

    comprobantes.forEach((comp) => {
      comp.lineas.forEach((linea, idx) => {
        const clasif = clasificaciones.find(
          (c) => c.cuentaId.toString() === linea.cuentaId.toString(),
        );
        if (!clasif) return;

        const cuenta = cuentas.find(
          (c) => c._id.toString() === linea.cuentaId.toString(),
        );
        const codigo = cuenta ? cuenta.codigo : '';
        const nombre = cuenta ? cuenta.nombre : linea.cuentaNombre;

        const monto =
          clasif.tipo === TipoClasificacionIG.INGRESO
            ? linea.haber
            : linea.debe;

        if (monto > 0) {
          lineas.push({
            id: `${comp.id}-${idx}`,
            cuentaCodigo: codigo,
            cuentaNombre: codigo ? `${codigo} - ${nombre}` : nombre,
            tipo: clasif.tipo,
            monto,
            periodo,
          });
        }
      });
    });

    asientos.forEach((asiento) => {
      const codigoCuenta = asiento.cuenta.split(' ')[0];
      const esIngreso = codigoCuenta.startsWith('4');
      const esGasto = ['5', '6', '7'].some((p) => codigoCuenta.startsWith(p));

      if (esIngreso && asiento.haber > 0) {
        lineas.push({
          id: `asiento-${asiento.id}`,
          cuentaCodigo: codigoCuenta,
          cuentaNombre: asiento.cuenta,
          tipo: 'Ingreso',
          monto: asiento.haber,
          periodo,
        });
      }
      if (esGasto && asiento.debe > 0) {
        lineas.push({
          id: `asiento-${asiento.id}`,
          cuentaCodigo: codigoCuenta,
          cuentaNombre: asiento.cuenta,
          tipo: 'Gasto',
          monto: asiento.debe,
          periodo,
        });
      }
    });

    const agrupado = lineas.reduce(
      (acc, curr) => {
        const key = curr.cuentaCodigo;
        if (!acc[key]) {
          acc[key] = { ...curr, monto: 0 };
        }
        acc[key].monto += curr.monto;
        return acc;
      },
      {} as Record<string, ResultadoLinea>,
    );

    const lineasAgrupadas = Object.values(agrupado).filter((l) => l.monto > 0);

    const totalIngresos = lineasAgrupadas
      .filter((l) => l.tipo === 'Ingreso')
      .reduce((acc, l) => acc + l.monto, 0);

    const totalGastos = lineasAgrupadas
      .filter((l) => l.tipo === 'Gasto')
      .reduce((acc, l) => acc + l.monto, 0);

    const utilidadNeta = totalIngresos - totalGastos;
    const margenUtilidad =
      totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

    return {
      lineas: lineasAgrupadas,
      resumen: { totalIngresos, totalGastos, utilidadNeta, margenUtilidad },
    };
  }

  async gastosPorElementos(
    filtro: FiltroReporteDto,
  ): Promise<{ lineas: ResultadoElemento[]; totalGeneral: number }> {
    const { inicio, fin } = this.rangoFechas(
      filtro.fechaInicio,
      filtro.fechaFin,
    );

    const [comprobantes, elementos, clasificaciones, cuentas] =
      await Promise.all([
        this.comprobanteModel
          .find({ fecha: { $gte: inicio, $lte: fin } })
          .exec(),
        this.elementoGastoModel.find().exec(),
        this.clasificacionModel.find().exec(),
        this.cuentaModel.find().exec(),
      ]);

    const acumulado: Record<
      string,
      { codigo: string; nombre: string; monto: number; movs: number }
    > = {};

    comprobantes.forEach((comp) => {
      comp.lineas.forEach((linea) => {
        const clasif = clasificaciones.find(
          (c) => c.cuentaId.toString() === linea.cuentaId.toString(),
        );
        const esGasto = clasif?.tipo === TipoClasificacionIG.GASTO;
        const cuenta = cuentas.find(
          (c) => c._id.toString() === linea.cuentaId.toString(),
        );
        const codigoCuenta = cuenta ? cuenta.codigo : '';
        const esGastoPorCodigo = ['5', '6', '7'].some((p) =>
          codigoCuenta.startsWith(p),
        );

        if (!esGasto && !esGastoPorCodigo) return;
        if (linea.debe <= 0) return;
        if (!linea.elementoGastoId) return;

        const elem = elementos.find(
          (e) => e._id.toString() === linea.elementoGastoId!.toString(),
        );
        if (!elem) return;

        const key = elem._id.toString();
        if (!acumulado[key]) {
          acumulado[key] = {
            codigo: elem.codigo,
            nombre: elem.nombre,
            monto: 0,
            movs: 0,
          };
        }
        acumulado[key].monto += linea.debe;
        acumulado[key].movs += 1;
      });
    });

    const totalGeneral = Object.values(acumulado).reduce(
      (acc, curr) => acc + curr.monto,
      0,
    );

    const lineas: ResultadoElemento[] = Object.entries(acumulado)
      .map(([id, data]) => ({
        id,
        elementoCodigo: data.codigo,
        elementoNombre: `${data.codigo} - ${data.nombre}`,
        monto: data.monto,
        cantidadMovimientos: data.movs,
        porcentaje: totalGeneral > 0 ? (data.monto / totalGeneral) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto);

    return { lineas, totalGeneral };
  }

  async balanceComprobacion(
    filtro: FiltroReporteDto,
  ): Promise<{ lineas: BalanceLinea[]; resumen: ResumenBalance }> {
    const { inicio, fin } = this.rangoFechas(
      filtro.fechaInicio,
      filtro.fechaFin,
    );

    const [comprobantes, asientos, cuentas] = await Promise.all([
      this.comprobanteModel.find({ fecha: { $gte: inicio, $lte: fin } }).exec(),
      this.asientoModel.find({ fecha: { $gte: inicio, $lte: fin } }).exec(),
      this.cuentaModel.find().exec(),
    ]);

    const acumulado: Record<
      string,
      {
        codigo: string;
        nombre: string;
        naturaleza: string;
        debe: number;
        haber: number;
      }
    > = {};

    comprobantes.forEach((comp) => {
      comp.lineas.forEach((linea) => {
        const cuenta = cuentas.find(
          (c) => c._id.toString() === linea.cuentaId.toString(),
        );
        const codigo = cuenta
          ? cuenta.codigo
          : linea.cuentaNombre.split(' ')[0] || 'N/A';
        const nombre = cuenta ? cuenta.nombre : linea.cuentaNombre;
        const naturaleza = cuenta ? cuenta.naturaleza : 'Deudora';
        const key = cuenta ? cuenta._id.toString() : linea.cuentaId.toString();

        if (!acumulado[key]) {
          acumulado[key] = { codigo, nombre, naturaleza, debe: 0, haber: 0 };
        }
        acumulado[key].debe += linea.debe || 0;
        acumulado[key].haber += linea.haber || 0;
      });
    });

    asientos.forEach((asiento) => {
      const codigoCuenta = asiento.cuenta.split(' ')[0] || 'N/A';
      const nombreCuenta = asiento.cuenta;
      const cuentaDef = cuentas.find((c) => c.codigo === codigoCuenta);
      const key = cuentaDef ? cuentaDef._id.toString() : asiento.cuenta;
      const naturaleza = cuentaDef ? cuentaDef.naturaleza : 'Deudora';

      if (!acumulado[key]) {
        acumulado[key] = {
          codigo: codigoCuenta,
          nombre: nombreCuenta,
          naturaleza,
          debe: 0,
          haber: 0,
        };
      }
      acumulado[key].debe += asiento.debe || 0;
      acumulado[key].haber += asiento.haber || 0;
    });

    const lineas: BalanceLinea[] = Object.entries(acumulado)
      .map(([id, data]) => {
        const saldo = data.debe - data.haber;
        return {
          id,
          codigo: data.codigo,
          cuenta: `${data.codigo} - ${data.nombre}`,
          naturaleza: data.naturaleza,
          totalDebe: data.debe,
          totalHaber: data.haber,
          saldoDeudor: saldo > 0 ? saldo : 0,
          saldoAcreedor: saldo < 0 ? Math.abs(saldo) : 0,
        };
      })
      .filter((l) => l.totalDebe > 0 || l.totalHaber > 0)
      .sort((a, b) => a.codigo.localeCompare(b.codigo));

    const sumaDebe = lineas.reduce((acc, l) => acc + l.totalDebe, 0);
    const sumaHaber = lineas.reduce((acc, l) => acc + l.totalHaber, 0);
    const sumaSaldoDeudor = lineas.reduce((acc, l) => acc + l.saldoDeudor, 0);
    const sumaSaldoAcreedor = lineas.reduce(
      (acc, l) => acc + l.saldoAcreedor,
      0,
    );
    const diferencia = Math.abs(sumaDebe - sumaHaber);
    const cuadrado = diferencia < 0.01;

    return {
      lineas,
      resumen: {
        sumaDebe,
        sumaHaber,
        sumaSaldoDeudor,
        sumaSaldoAcreedor,
        diferencia,
        cuadrado,
      },
    };
  }

  async submayor(filtro: FiltroReporteDto): Promise<{
    lineas: SubmayorLinea[];
    totalDebe: number;
    totalHaber: number;
    saldoFinal: number;
  }> {
    if (!filtro.cuentaId) {
      throw new BadRequestException('Debe seleccionar una cuenta');
    }

    const { inicio, fin } = this.rangoFechas(
      filtro.fechaInicio,
      filtro.fechaFin,
    );

    const cuentaSeleccionada = await this.cuentaModel
      .findById(filtro.cuentaId)
      .exec();
    if (!cuentaSeleccionada) {
      throw new BadRequestException('La cuenta seleccionada no existe');
    }
    const naturaleza = cuentaSeleccionada.naturaleza;

    const [comprobantes, asientos] = await Promise.all([
      this.comprobanteModel.find({ fecha: { $gte: inicio, $lte: fin } }).exec(),
      this.asientoModel.find({ fecha: { $gte: inicio, $lte: fin } }).exec(),
    ]);

    const movimientos: SubmayorLinea[] = [];

    comprobantes.forEach((comp) => {
      comp.lineas.forEach((linea, idx) => {
        if (linea.cuentaId.toString() !== filtro.cuentaId) return;
        if (
          filtro.centroCostoId &&
          (!linea.centroCostoId ||
            linea.centroCostoId.toString() !== filtro.centroCostoId)
        )
          return;

        movimientos.push({
          id: `${comp.id}-${idx}`,
          fecha: this.aYmd(comp.fecha),
          comprobante: comp.numero,
          concepto: linea.descripcion || comp.concepto,
          debe: linea.debe || 0,
          haber: linea.haber || 0,
          saldo: 0,
          centroCosto: linea.centroCostoNombre || '—',
        });
      });
    });

    asientos.forEach((asiento) => {
      const codigoAsiento = asiento.cuenta.split(' ')[0];
      if (codigoAsiento !== cuentaSeleccionada.codigo) return;

      movimientos.push({
        id: `asiento-${asiento.id}`,
        fecha: this.aYmd(asiento.fecha),
        comprobante: asiento.numero,
        concepto: asiento.concepto,
        debe: asiento.debe || 0,
        haber: asiento.haber || 0,
        saldo: 0,
        centroCosto: '—',
      });
    });

    movimientos.sort((a, b) => a.fecha.localeCompare(b.fecha));

    let saldo = 0;
    const lineasConSaldo = movimientos.map((m) => {
      if (naturaleza === NaturalezaCuenta.DEUDORA) {
        saldo += m.debe - m.haber;
      } else {
        saldo += m.haber - m.debe;
      }
      return { ...m, saldo };
    });

    const totalDebe = lineasConSaldo.reduce((acc, l) => acc + l.debe, 0);
    const totalHaber = lineasConSaldo.reduce((acc, l) => acc + l.haber, 0);

    return {
      lineas: lineasConSaldo,
      totalDebe,
      totalHaber,
      saldoFinal: saldo,
    };
  }
}
