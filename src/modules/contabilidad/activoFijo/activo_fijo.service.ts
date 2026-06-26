import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';
import { ActivoFijo, ActivoFijoDocument } from './schema/activo_fijo.schema';
import {
  ActivoFijoExport,
  ActivosPorEstadoItem,
  CreateActivoResult,
  CreacionMasivaResponse,
  DepreciacionResult,
  DepreciacionScheduleItem,
  Estadisticas,
  ResumenEconomico,
  DeleteResponse,
  RecalcularMasivoResponse,
} from './types/activo_fijo.types';
import { BajaActivoDto } from './dto/baja-activo.dto';
import { RevaluacionActivoDto } from './dto/revaluacion-activo.dto';

@Injectable()
export class ActivoFijoService {
  constructor(
    @InjectModel(ActivoFijo.name)
    private activoModel: Model<ActivoFijoDocument>,
  ) {}

  async create(createActivoFijoDto: CreateActivoFijoDto): Promise<CreateActivoResult> {
    this.validarDatosDepreciacion(
      createActivoFijoDto.valorAdquisicion,
      createActivoFijoDto.valorResidual,
      createActivoFijoDto.vidaUtil,
    );

    const cantidad = createActivoFijoDto.cantidad ?? 1;
    const baseCodigo = createActivoFijoDto.codigoActivo;

    const activos: Partial<ActivoFijo>[] = [];
    for (let i = 0; i < cantidad; i++) {
      const codigo = cantidad > 1 ? `${baseCodigo}-${String(i + 1).padStart(3, '0')}` : baseCodigo;

      const existente = await this.activoModel.findOne({ codigoActivo: codigo }).exec();
      if (existente) {
        throw new BadRequestException(`Ya existe un activo con código ${codigo}`);
      }

      const depreciacion = this.calcularDepreciacionCompleta(
        createActivoFijoDto.valorAdquisicion,
        createActivoFijoDto.valorResidual,
        createActivoFijoDto.vidaUtil,
        createActivoFijoDto.fechaCompra,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cantidad: _, ...rest } = createActivoFijoDto;

      const activoCompleto: Record<string, unknown> = {
        ...rest,
        codigoActivo: codigo,
        ajusteValor: createActivoFijoDto.ajusteValor ?? 0,
        activo: createActivoFijoDto.activo ?? true,
        ...depreciacion,
      };

      activos.push(activoCompleto as Partial<ActivoFijo>);
    }

    if (cantidad === 1) {
      const created = new this.activoModel(activos[0]);
      return created.save() as unknown as ActivoFijoExport;
    }

    const creados = await this.activoModel.insertMany(activos);
    const response: CreacionMasivaResponse = {
      creados: creados.length,
      activos: creados.map((a) => ({
        _id: a._id as Types.ObjectId,
        codigoActivo: a.codigoActivo as string,
        descripcionActivo: a.descripcionActivo as string,
      })),
    };
    return response;
  }

  async findAll(): Promise<ActivoFijo[]> {
    return this.activoModel
      .find()
      .populate('proveedor')
      .populate('area')
      .populate('grupoActivo')
      .populate('tasaDepreciacion')
      .populate('moneda')
      .populate('pais')
      .populate('concepto')
      .populate('estadoActivo')
      .populate('cuentaDebe')
      .populate('cuentaHaber')
      .populate('cuentaDepreciacion')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ActivoFijo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Activo no encontrado');
    const doc = await this.activoModel
      .findById(id)
      .populate('proveedor')
      .populate('area')
      .populate('grupoActivo')
      .populate('tasaDepreciacion')
      .populate('moneda')
      .populate('pais')
      .populate('concepto')
      .populate('estadoActivo')
      .populate('cuentaDebe')
      .populate('cuentaHaber')
      .populate('cuentaDepreciacion')
      .exec();
    if (!doc) throw new NotFoundException('Activo no encontrado');
    return doc;
  }

  async update(
    id: string,
    updateActivoFijoDto: UpdateActivoFijoDto,
  ): Promise<ActivoFijo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Activo no encontrado');

    const activoActual = await this.activoModel.findById(id).exec();
    if (!activoActual) throw new NotFoundException('Activo no encontrado');

    const debeRecalcular =
      updateActivoFijoDto.valorAdquisicion !== undefined ||
      updateActivoFijoDto.valorResidual !== undefined ||
      updateActivoFijoDto.vidaUtil !== undefined ||
      updateActivoFijoDto.fechaCompra !== undefined;

    let datosActualizados: Record<string, unknown> = { ...updateActivoFijoDto };

    if (debeRecalcular) {
      const nuevoValor =
        updateActivoFijoDto.valorAdquisicion ?? activoActual.valorAdquisicion;
      const nuevoResidual =
        updateActivoFijoDto.valorResidual ?? activoActual.valorResidual;
      const nuevaVidaUtil =
        updateActivoFijoDto.vidaUtil ?? activoActual.vidaUtil;
      const nuevaFecha =
        updateActivoFijoDto.fechaCompra ?? activoActual.fechaCompra;

      this.validarDatosDepreciacion(nuevoValor, nuevoResidual, nuevaVidaUtil);

      const depreciacion = this.calcularDepreciacionCompleta(
        nuevoValor,
        nuevoResidual,
        nuevaVidaUtil,
        nuevaFecha instanceof Date ? nuevaFecha.toISOString() : nuevaFecha,
      );

      datosActualizados = { ...datosActualizados, ...depreciacion };
    }

    const updated = await this.activoModel
      .findByIdAndUpdate(id, datosActualizados, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Activo no encontrado');
    return updated;
  }

  async remove(id: string): Promise<DeleteResponse> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Activo no encontrado');
    const removed = await this.activoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Activo no encontrado');
    return { deleted: true };
  }

  async findByArea(areaId: string): Promise<ActivoFijo[]> {
    if (!isValidObjectId(areaId)) throw new NotFoundException('Área no válida');
    return this.activoModel
      .find({ area: areaId })
      .populate('proveedor')
      .populate('area')
      .populate('estadoActivo')
      .exec();
  }

  async findByEstado(estadoId: string): Promise<ActivoFijo[]> {
    if (!isValidObjectId(estadoId))
      throw new NotFoundException('Estado no válido');
    return this.activoModel
      .find({ estadoActivo: estadoId })
      .populate('area')
      .populate('estadoActivo')
      .exec();
  }

  async findActivos(): Promise<ActivoFijo[]> {
    return this.activoModel
      .find({ activo: true })
      .populate('area')
      .populate('estadoActivo')
      .populate('proveedor')
      .sort({ codigoActivo: 1 })
      .exec();
  }

  async recalcularDepreciacion(id: string): Promise<ActivoFijo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Activo no encontrado');
    const activo = await this.activoModel.findById(id).exec();
    if (!activo) throw new NotFoundException('Activo no encontrado');

    const depreciacion = this.calcularDepreciacionCompleta(
      activo.valorAdquisicion,
      activo.valorResidual,
      activo.vidaUtil,
      activo.fechaCompra,
    );

    const updated = await this.activoModel
      .findByIdAndUpdate(
        id,
        { ...depreciacion, fechaUltimaDepreciacion: new Date() },
        { new: true },
      )
      .exec();
    return updated!;
  }

  async recalcularDepreciacionMasiva(): Promise<RecalcularMasivoResponse> {
    const activos = await this.activoModel.find({ activo: true }).exec();
    let count = 0;

    for (const activo of activos) {
      const depreciacion = this.calcularDepreciacionCompleta(
        activo.valorAdquisicion,
        activo.valorResidual,
        activo.vidaUtil,
        activo.fechaCompra,
      );

      await this.activoModel
        .findByIdAndUpdate(activo._id, {
          ...depreciacion,
          fechaUltimaDepreciacion: new Date(),
        })
        .exec();
      count++;
    }

    return { modificados: count };
  }

  async getEstadisticas(): Promise<Estadisticas> {
    const totalActivos = await this.activoModel
      .countDocuments({ activo: true })
      .exec();
    const totalBajas = await this.activoModel
      .countDocuments({ activo: false })
      .exec();
    const totalValor = await this.activoModel
      .aggregate([
        { $match: { activo: true } },
        { $group: { _id: null, total: { $sum: '$valorAdquisicion' } } },
      ])
      .exec();

    const totalDepreciacion = await this.activoModel
      .aggregate([
        { $match: { activo: true } },
        { $group: { _id: null, total: { $sum: '$depreciacionAcumulada' } } },
      ])
      .exec();

    const totalValorLibros = await this.activoModel
      .aggregate([
        { $match: { activo: true } },
        { $group: { _id: null, total: { $sum: '$valorEnLibros' } } },
      ])
      .exec();

    const porEstado = await this.activoModel
      .aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$estadoActivo', count: { $sum: 1 } } },
      ])
      .exec();

    const porArea = await this.activoModel
      .aggregate([
        { $match: { activo: true } },
        {
          $group: {
            _id: '$area',
            count: { $sum: 1 },
            totalValor: { $sum: '$valorAdquisicion' },
          },
        },
      ])
      .exec();

    return {
      totalActivos,
      totalBajas,
      valorAdquisicionTotal: totalValor.length > 0 ? totalValor[0].total : 0,
      depreciacionAcumuladaTotal:
        totalDepreciacion.length > 0 ? totalDepreciacion[0].total : 0,
      valorEnLibrosTotal:
        totalValorLibros.length > 0 ? totalValorLibros[0].total : 0,
      porEstado,
      porArea,
    };
  }

  async registrarBaja(
    id: string,
    bajaDto: BajaActivoDto,
  ): Promise<ActivoFijo> {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const activo = await this.activoModel.findById(id).exec();
    if (!activo) throw new NotFoundException('Activo no encontrado');
    if (!activo.activo) throw new BadRequestException('El activo ya está dado de baja');

    const gananciaPerdidaBaja = Number((bajaDto.valorBaja - activo.valorEnLibros).toFixed(2));

    const datosBaja = {
      activo: false,
      fechaBaja: new Date(bajaDto.fechaBaja),
      motivoBaja: bajaDto.motivoBaja,
      tipoBaja: bajaDto.tipoBaja,
      valorBaja: bajaDto.valorBaja,
      documentoBaja: bajaDto.documentoBaja || undefined,
      gananciaPerdidaBaja,
      estadoActivo: undefined,
    };

    const updated = await this.activoModel.findByIdAndUpdate(id, datosBaja, { new: true }).exec();
    if (!updated) throw new NotFoundException('Activo no encontrado');
    return updated;
  }

  async registrarRevaluacion(
    id: string,
    revaluacionDto: RevaluacionActivoDto,
  ): Promise<ActivoFijo> {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const activo = await this.activoModel.findById(id).exec();
    if (!activo) throw new NotFoundException('Activo no encontrado');
    if (!activo.activo) throw new BadRequestException('No se puede revaluar un activo dado de baja');

    const diferenciaRevaluacion = revaluacionDto.valorAvaluo - activo.valorAdquisicion;

    const depreciacion = this.calcularDepreciacionCompleta(
      revaluacionDto.valorAvaluo,
      activo.valorResidual,
      activo.vidaUtil,
      activo.fechaCompra,
    );

    const datosRevaluacion = {
      valorAdquisicion: revaluacionDto.valorAvaluo,
      valorAvaluo: revaluacionDto.valorAvaluo,
      entidadAvaluadora: revaluacionDto.entidadAvaluadora,
      fechaUltimaRevaluacion: new Date(revaluacionDto.fechaRevaluacion),
      revaluacionAcumulada: activo.revaluacionAcumulada + diferenciaRevaluacion,
      ...depreciacion,
    };

    const updated = await this.activoModel.findByIdAndUpdate(id, datosRevaluacion, { new: true }).exec();
    if (!updated) throw new NotFoundException('Activo no encontrado');
    return updated;
  }

  async getActivosPorEstado(): Promise<ActivosPorEstadoItem[]> {
    return this.activoModel.aggregate([
      {
        $group: {
          _id: '$estadoActivo',
          cantidad: { $sum: 1 },
          valorAdquisicionTotal: { $sum: '$valorAdquisicion' },
          valorLibrosTotal: { $sum: '$valorEnLibros' },
          depreciacionTotal: { $sum: '$depreciacionAcumulada' },
        },
      },
      { $sort: { cantidad: -1 } },
    ]).exec();
  }

  async getResumenEconomico(): Promise<ResumenEconomico> {
    const activosActivos = await this.activoModel.countDocuments({ activo: true }).exec();
    const activosBaja = await this.activoModel.countDocuments({ activo: false }).exec();
    const totalGeneral = activosActivos + activosBaja;

    const totals = await this.activoModel.aggregate([
      {
        $group: {
          _id: null,
          valorAdquisicion: { $sum: '$valorAdquisicion' },
          valorResidual: { $sum: '$valorResidual' },
          depreciacionAcumulada: { $sum: '$depreciacionAcumulada' },
          valorEnLibros: { $sum: '$valorEnLibros' },
          revaluacionAcumulada: { $sum: '$revaluacionAcumulada' },
        },
      },
    ]).exec();

    const activosAct = totals.length > 0 ? totals[0] : {
      valorAdquisicion: 0,
      valorResidual: 0,
      depreciacionAcumulada: 0,
      valorEnLibros: 0,
      revaluacionAcumulada: 0,
    };

    return {
      resumenGeneral: {
        totalActivos: totalGeneral,
        activosVigentes: activosActivos,
        activosBaja,
        porcentajeBaja: totalGeneral > 0 ? Number(((activosBaja / totalGeneral) * 100).toFixed(2)) : 0,
      },
      resumenValores: {
        valorAdquisicionTotal: activosAct.valorAdquisicion,
        valorResidualTotal: activosAct.valorResidual,
        depreciacionAcumuladaTotal: activosAct.depreciacionAcumulada,
        valorLibrosTotal: activosAct.valorEnLibros,
        revaluacionAcumuladaTotal: activosAct.revaluacionAcumulada,
        porcentajeDepreciado: activosAct.valorAdquisicion > 0
          ? Number(((activosAct.depreciacionAcumulada / activosAct.valorAdquisicion) * 100).toFixed(2))
          : 0,
      },
    };
  }

  async getDepreciacionSchedule(): Promise<DepreciacionScheduleItem[]> {
    return this.activoModel
      .aggregate([
        { $match: { activo: true } },
        {
          $project: {
            codigoActivo: 1,
            descripcionActivo: 1,
            valorAdquisicion: 1,
            valorResidual: 1,
            vidaUtil: 1,
            depreciacionAnual: 1,
            depreciacionMensual: 1,
            depreciacionAcumulada: 1,
            valorEnLibros: 1,
            fechaCompra: 1,
            anosTranscurridos: {
              $floor: {
                $divide: [
                  { $subtract: [new Date(), '$fechaCompra'] },
                  365 * 24 * 60 * 60 * 1000,
                ],
              },
            },
          },
        },
        { $sort: { codigoActivo: 1 } },
      ])
      .exec();
  }

  calcularDepreciacionLineaRecta(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
  ): number {
    this.validarDatosDepreciacion(costoAdquisicion, valorResidual, vidaUtil);
    return Number(((costoAdquisicion - valorResidual) / vidaUtil).toFixed(2));
  }

  calcularDepreciacionAcumuladaMensual(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
    fechaCompra: string | Date,
  ): DepreciacionResult {
    this.validarDatosDepreciacion(costoAdquisicion, valorResidual, vidaUtil);
    return this.calcularDepreciacionCompleta(
      costoAdquisicion,
      valorResidual,
      vidaUtil,
      fechaCompra,
    );
  }

  private validarDatosDepreciacion(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
  ): void {
    if (vidaUtil <= 0) {
      throw new BadRequestException('La vida útil debe ser mayor a 0');
    }
    if (valorResidual < 0) {
      throw new BadRequestException('El valor residual no puede ser negativo');
    }
    if (valorResidual >= costoAdquisicion) {
      throw new BadRequestException(
        'El valor residual no puede ser igual o mayor al costo de adquisición',
      );
    }
  }

  private calcularDepreciacionCompleta(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
    fechaCompra: string | Date,
  ): DepreciacionResult {
    const depreciacionAnual = Number(
      ((costoAdquisicion - valorResidual) / vidaUtil).toFixed(2),
    );
    const depreciacionMensual = Number((depreciacionAnual / 12).toFixed(2));

    const fechaInicio = new Date(fechaCompra);
    const hoy = new Date();

    let mesesTranscurridos =
      (hoy.getFullYear() - fechaInicio.getFullYear()) * 12 +
      (hoy.getMonth() - fechaInicio.getMonth());

    if (hoy.getDate() < fechaInicio.getDate()) {
      mesesTranscurridos--;
    }

    mesesTranscurridos = Math.max(0, mesesTranscurridos);

    let depreciacionAcumulada = depreciacionMensual * mesesTranscurridos;
    const valorDepreciable = costoAdquisicion - valorResidual;
    if (depreciacionAcumulada > valorDepreciable) {
      depreciacionAcumulada = valorDepreciable;
    }

    depreciacionAcumulada = Number(depreciacionAcumulada.toFixed(2));
    const valorEnLibros = Number(
      (costoAdquisicion - depreciacionAcumulada).toFixed(2),
    );

    return {
      depreciacionAnual,
      depreciacionMensual,
      depreciacionAcumulada,
      valorEnLibros,
      fechaUltimaDepreciacion: hoy,
    };
  }
}
