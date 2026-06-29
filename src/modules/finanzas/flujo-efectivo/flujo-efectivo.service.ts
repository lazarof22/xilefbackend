import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateProyeccionDto } from './dto/create-proyeccion.dto';
import { UpdateProyeccionDto } from './dto/update-proyeccion.dto';
import { CerrarProyeccionDto } from './dto/cerrar-proyeccion.dto';
import {
  ProyeccionFlujo,
  ProyeccionFlujoDocument,
} from './schema/proyeccion-flujo.schema';
import {
  TipoPeriodoFlujo,
  EstadoFlujo,
  ComparativaFlujo,
} from './types/flujo-efectivo.types';
import {
  CuentaCobrar,
  CuentaCobrarDocument,
} from '../cuenta-cobrar/schema/cuenta-cobrar.schema';
import {
  CuentaPagar,
  CuentaPagarDocument,
} from '../cuenta-pagar/schema/cuenta-pagar.schema';

@Injectable()
export class FlujoEfectivoService {
  constructor(
    @InjectModel(ProyeccionFlujo.name)
    private proyeccionModel: Model<ProyeccionFlujoDocument>,
    @InjectModel(CuentaCobrar.name)
    private cxcModel: Model<CuentaCobrarDocument>,
    @InjectModel(CuentaPagar.name) private cxpModel: Model<CuentaPagarDocument>,
  ) {}

  private calcularFinPeriodo(fecha: Date, tipoPeriodo: TipoPeriodoFlujo): Date {
    switch (tipoPeriodo) {
      case TipoPeriodoFlujo.DIARIO:
        return fecha;
      case TipoPeriodoFlujo.SEMANAL: {
        const fin = new Date(fecha);
        fin.setDate(fin.getDate() + 6);
        return fin;
      }
      case TipoPeriodoFlujo.MENSUAL:
        return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    }
  }

  private async computeProyecciones(
    fecha: Date,
    tipoPeriodo: TipoPeriodoFlujo,
  ): Promise<{
    ingresosProyectados: number;
    egresosProyectados: number;
    cuentasCobrarVinculadas: Types.ObjectId[];
    cuentasPagarVinculadas: Types.ObjectId[];
  }> {
    const finPeriodo = this.calcularFinPeriodo(fecha, tipoPeriodo);

    const cxcPendientes = await this.cxcModel
      .find({
        estado: { $in: ['pendiente', 'parcial', 'vencida'] },
        fechaVencimiento: { $gte: fecha, $lte: finPeriodo },
      })
      .exec();

    const cxpPendientes = await this.cxpModel
      .find({
        estado: { $in: ['pendiente', 'parcial', 'vencida'] },
        fechaVencimiento: { $gte: fecha, $lte: finPeriodo },
      })
      .exec();

    const ingresosProyectados = cxcPendientes.reduce(
      (sum, c) => sum + c.saldoPendiente,
      0,
    );
    const egresosProyectados = cxpPendientes.reduce(
      (sum, c) => sum + c.saldoPendiente,
      0,
    );

    return {
      ingresosProyectados,
      egresosProyectados,
      cuentasCobrarVinculadas: cxcPendientes.map((c) => c._id),
      cuentasPagarVinculadas: cxpPendientes.map((c) => c._id),
    };
  }

  async create(createDto: CreateProyeccionDto): Promise<ProyeccionFlujo> {
    const existente = await this.proyeccionModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe una proyección con ese código');

    const fecha = new Date(createDto.fecha);
    const {
      ingresosProyectados,
      egresosProyectados,
      cuentasCobrarVinculadas,
      cuentasPagarVinculadas,
    } = await this.computeProyecciones(fecha, createDto.tipoPeriodo);

    const flujoNetoProyectado = ingresosProyectados - egresosProyectados;
    const saldoProyectado = createDto.saldoInicial + flujoNetoProyectado;

    const created = new this.proyeccionModel({
      ...createDto,
      fecha,
      ingresosProyectados,
      egresosProyectados,
      flujoNetoProyectado,
      saldoProyectado,
      cuentasCobrarVinculadas,
      cuentasPagarVinculadas,
    });
    return created.save();
  }

  async findAll(): Promise<ProyeccionFlujo[]> {
    return this.proyeccionModel.find().sort({ fecha: -1 }).exec();
  }

  async findOne(id: string): Promise<ProyeccionFlujo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Proyección no encontrada');
    const doc = await this.proyeccionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Proyección no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateProyeccionDto,
  ): Promise<ProyeccionFlujo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Proyección no encontrada');
    const updated = await this.proyeccionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Proyección no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Proyección no encontrada');
    const removed = await this.proyeccionModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Proyección no encontrada');
    return { deleted: true };
  }

  async generar(dto: {
    fechaInicio: string;
    fechaFin: string;
    tipoPeriodo: TipoPeriodoFlujo;
    saldoInicial: number;
  }): Promise<ProyeccionFlujo[]> {
    const inicio = new Date(dto.fechaInicio);
    const fin = new Date(dto.fechaFin);

    if (inicio > fin)
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha fin',
      );

    const created: ProyeccionFlujo[] = [];
    let current = new Date(inicio);
    let index = 0;
    let saldoActual = dto.saldoInicial;

    while (current <= fin) {
      const periodoStr = this.formatPeriodo(current, dto.tipoPeriodo);
      const codigo = `FLUJO-${periodoStr}`;

      const {
        ingresosProyectados,
        egresosProyectados,
        cuentasCobrarVinculadas,
        cuentasPagarVinculadas,
      } = await this.computeProyecciones(current, dto.tipoPeriodo);

      const flujoNetoProyectado = ingresosProyectados - egresosProyectados;
      const saldoProyectado = saldoActual + flujoNetoProyectado;

      const doc = new this.proyeccionModel({
        codigo,
        fecha: new Date(current),
        periodo: periodoStr,
        tipoPeriodo: dto.tipoPeriodo,
        saldoInicial: saldoActual,
        ingresosProyectados,
        egresosProyectados,
        flujoNetoProyectado,
        saldoProyectado,
        cuentasCobrarVinculadas,
        cuentasPagarVinculadas,
      });
      created.push(await doc.save());

      saldoActual = saldoProyectado;
      current = this.nextPeriod(current, dto.tipoPeriodo);
    }

    return created;
  }

  async cerrar(
    id: string,
    cerrarDto: CerrarProyeccionDto,
  ): Promise<ProyeccionFlujo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Proyección no encontrada');
    const proyeccion = await this.proyeccionModel.findById(id).exec();
    if (!proyeccion) throw new NotFoundException('Proyección no encontrada');
    if (proyeccion.estado === EstadoFlujo.CERRADO)
      throw new BadRequestException('La proyección ya está cerrada');

    proyeccion.ingresosReales = cerrarDto.ingresosReales;
    proyeccion.egresosReales = cerrarDto.egresosReales;
    proyeccion.flujoNetoReal =
      cerrarDto.ingresosReales - cerrarDto.egresosReales;
    proyeccion.estado = EstadoFlujo.CERRADO;
    if (cerrarDto.observaciones)
      proyeccion.observaciones = cerrarDto.observaciones;

    return proyeccion.save();
  }

  async comparar(id: string): Promise<ComparativaFlujo> {
    const proyeccion = await this.findOne(id);
    const proyectado = proyeccion.flujoNetoProyectado;
    const real = proyeccion.flujoNetoReal;
    const desviacion = real - proyectado;
    const desviacionPorcentaje =
      proyectado !== 0
        ? Number(((desviacion / Math.abs(proyectado)) * 100).toFixed(2))
        : real !== 0
          ? 100
          : 0;

    return { proyectado, real, desviacion, desviacionPorcentaje };
  }

  async getHistorico(desde: string, hasta: string): Promise<ProyeccionFlujo[]> {
    const filters: Record<string, unknown> = {};
    if (desde)
      filters.fecha = { $gte: new Date(desde) } as Record<string, unknown>;
    if (hasta) {
      const existing = filters.fecha as Record<string, unknown> | undefined;
      filters.fecha = { ...(existing ?? {}), $lte: new Date(hasta) } as Record<
        string,
        unknown
      >;
    }
    return this.proyeccionModel.find(filters).sort({ fecha: 1 }).exec();
  }

  async getResumen(): Promise<any> {
    const totalIngresos = await this.proyeccionModel
      .aggregate([
        { $group: { _id: null, total: { $sum: '$ingresosProyectados' } } },
      ])
      .exec();
    const totalEgresos = await this.proyeccionModel
      .aggregate([
        { $group: { _id: null, total: { $sum: '$egresosProyectados' } } },
      ])
      .exec();
    const totalIngresosReales = await this.proyeccionModel
      .aggregate([
        { $group: { _id: null, total: { $sum: '$ingresosReales' } } },
      ])
      .exec();
    const totalEgresosReales = await this.proyeccionModel
      .aggregate([{ $group: { _id: null, total: { $sum: '$egresosReales' } } }])
      .exec();
    const porEstado = await this.proyeccionModel
      .aggregate([{ $group: { _id: '$estado', cantidad: { $sum: 1 } } }])
      .exec();
    const ultimo = await this.proyeccionModel
      .findOne()
      .sort({ fecha: -1 })
      .exec();

    return {
      totalIngresosProyectados:
        totalIngresos.length > 0 ? totalIngresos[0].total : 0,
      totalEgresosProyectados:
        totalEgresos.length > 0 ? totalEgresos[0].total : 0,
      totalIngresosReales:
        totalIngresosReales.length > 0 ? totalIngresosReales[0].total : 0,
      totalEgresosReales:
        totalEgresosReales.length > 0 ? totalEgresosReales[0].total : 0,
      saldoProyectadoActual: ultimo ? ultimo.saldoProyectado : 0,
      porEstado,
    };
  }

  private formatPeriodo(fecha: Date, tipoPeriodo: TipoPeriodoFlujo): string {
    switch (tipoPeriodo) {
      case TipoPeriodoFlujo.DIARIO:
        return fecha.toISOString().split('T')[0];
      case TipoPeriodoFlujo.SEMANAL: {
        const inicioSemana = new Date(fecha);
        inicioSemana.setDate(
          inicioSemana.getDate() - inicioSemana.getDay() + 1,
        );
        return inicioSemana.toISOString().split('T')[0];
      }
      case TipoPeriodoFlujo.MENSUAL:
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  private nextPeriod(fecha: Date, tipoPeriodo: TipoPeriodoFlujo): Date {
    const next = new Date(fecha);
    switch (tipoPeriodo) {
      case TipoPeriodoFlujo.DIARIO:
        next.setDate(next.getDate() + 1);
        break;
      case TipoPeriodoFlujo.SEMANAL:
        next.setDate(next.getDate() + 7);
        break;
      case TipoPeriodoFlujo.MENSUAL:
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  }
}
