import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';
import { ActivoFijo, ActivoFijoDocument } from './schema/activo_fijo.schema';

@Injectable()
export class ActivoFijoService {
  constructor(@InjectModel(ActivoFijo.name) private activoModel: Model<ActivoFijoDocument>) {}

  // ═══════════════════════════════════════════════════
  // CREAR ACTIVO CON DEPRECIACIÓN AUTO-CALCULADA
  // ═══════════════════════════════════════════════════
  async create(createActivoFijoDto: CreateActivoFijoDto): Promise<ActivoFijo> {
    // Validar datos
    this.validarDatosDepreciacion(
      createActivoFijoDto.valor,
      createActivoFijoDto.valorResidual,
      createActivoFijoDto.vidaUtil,
    );

    // Calcular todos los campos de depreciación
    const depreciacion = this.calcularDepreciacionCompleta(
      createActivoFijoDto.valor,
      createActivoFijoDto.valorResidual,
      createActivoFijoDto.vidaUtil,
      createActivoFijoDto.fechaCompra,
    );

    // Combinar DTO con campos calculados
    const activoCompleto = {
      ...createActivoFijoDto,
      ajusteValor: createActivoFijoDto.ajusteValor ?? 0,
      ...depreciacion,
    };

    const created = new this.activoModel(activoCompleto);
    return created.save();
  }

  async findAll() {
    return this.activoModel.find()
      .populate('proveedor')
      .populate('area')
      .populate('depreciacionActivo')
      .populate('moneda')
      .populate('pais')
      .populate('concepto')
      .populate('movimiento')
      .populate('estadoActivo')
      .exec();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const doc = await this.activoModel.findById(id)
      .populate('proveedor')
      .populate('area')
      .populate('depreciacionActivo')
      .populate('moneda')
      .populate('pais')
      .populate('concepto')
      .populate('movimiento')
      .populate('estadoActivo')
      .exec();
    if (!doc) throw new NotFoundException('Activo no encontrado');
    return doc;
  }

  async update(id: string, updateActivoFijoDto: UpdateActivoFijoDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');

    const activoActual = await this.activoModel.findById(id).exec();
    if (!activoActual) throw new NotFoundException('Activo no encontrado');

    // Determinar si hay que recalcular depreciación
    const debeRecalcular =
      updateActivoFijoDto.valor !== undefined ||
      updateActivoFijoDto.valorResidual !== undefined ||
      updateActivoFijoDto.vidaUtil !== undefined ||
      updateActivoFijoDto.fechaCompra !== undefined;

    let datosActualizados: any = { ...updateActivoFijoDto };

    if (debeRecalcular) {
      const nuevoValor = updateActivoFijoDto.valor ?? activoActual.valor;
      const nuevoResidual = updateActivoFijoDto.valorResidual ?? activoActual.valorResidual;
      const nuevaVidaUtil = updateActivoFijoDto.vidaUtil ?? activoActual.vidaUtil;
      const nuevaFecha = updateActivoFijoDto.fechaCompra ?? activoActual.fechaCompra;

      this.validarDatosDepreciacion(nuevoValor, nuevoResidual, nuevaVidaUtil);

      const depreciacion = this.calcularDepreciacionCompleta(
        nuevoValor,
        nuevoResidual,
        nuevaVidaUtil,
        nuevaFecha instanceof Date ? nuevaFecha.toISOString() : nuevaFecha,
      );

      datosActualizados = {
        ...datosActualizados,
        ...depreciacion,
      };
    }

    const updated = await this.activoModel.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true },
    ).exec();

    if (!updated) throw new NotFoundException('Activo no encontrado');
    return updated;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const removed = await this.activoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Activo no encontrado');
    return { deleted: true };
  }

  // ═══════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS PARA EL CONTROLLER
  // ═══════════════════════════════════════════════════

  /**
   * Fórmula: (costoAdquisicion - valorResidual) / vidaUtil
   */
  calcularDepreciacionLineaRecta(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
  ): number {
    this.validarDatosDepreciacion(costoAdquisicion, valorResidual, vidaUtil);
    const depreciacionAnual = (costoAdquisicion - valorResidual) / vidaUtil;
    return Number(depreciacionAnual.toFixed(2));
  }

  calcularDepreciacionAcumuladaMensual(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
    fechaCompra: string | Date,
  ) {
    this.validarDatosDepreciacion(costoAdquisicion, valorResidual, vidaUtil);
    return this.calcularDepreciacionCompleta(
      costoAdquisicion,
      valorResidual,
      vidaUtil,
      fechaCompra,
    );
  }

  // ═══════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════

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
  ) {
    // Depreciación anual: (costo - residual) / vida útil
    const depreciacionAnual = Number(
      ((costoAdquisicion - valorResidual) / vidaUtil).toFixed(2),
    );

    // Depreciación mensual
    const depreciacionMensual = Number((depreciacionAnual / 12).toFixed(2));

    // Calcular meses transcurridos desde la compra
    const fechaInicio = new Date(fechaCompra);
    const hoy = new Date();

    let mesesTranscurridos =
      (hoy.getFullYear() - fechaInicio.getFullYear()) * 12 +
      (hoy.getMonth() - fechaInicio.getMonth());

    if (hoy.getDate() < fechaInicio.getDate()) {
      mesesTranscurridos--;
    }

    mesesTranscurridos = Math.max(0, mesesTranscurridos);

    // Depreciación acumulada
    let depreciacionAcumulada = depreciacionMensual * mesesTranscurridos;

    // Ajustar si supera el valor depreciable total
    const valorDepreciable = costoAdquisicion - valorResidual;
    if (depreciacionAcumulada > valorDepreciable) {
      depreciacionAcumulada = valorDepreciable;
    }

    depreciacionAcumulada = Number(depreciacionAcumulada.toFixed(2));

    // Valor en libros
    const valorEnLibros = Number((costoAdquisicion - depreciacionAcumulada).toFixed(2));

    return {
      depreciacionAnual,
      depreciacionMensual,
      depreciacionAcumulada,
      valorEnLibros,
    };
  }
}