import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';
import { ActivoFijo, ActivoFijoDocument } from './schema/activo_fijo.schema';

@Injectable()
export class ActivoFijoService {
  constructor(@InjectModel(ActivoFijo.name) private activoModel: Model<ActivoFijoDocument>) {}

  // ═══════════════════════════════════════════════════════
  // MÉTODOS DE CÁLCULO DE DEPRECIACIÓN ANUAL
  // ═══════════════════════════════════════════════════════

  /**
   * Método de Línea Recta - Depreciación ANUAL
   * Fórmula: (costo de adquisición - valor residual) / vida útil
   */
  calcularDepreciacionLineaRecta(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
  ): number {
    if (vidaUtil <= 0) {
      throw new Error('La vida útil debe ser mayor a 0');
    }
    if (valorResidual >= costoAdquisicion) {
      throw new Error('El valor residual no puede ser mayor o igual al costo de adquisición');
    }
    return (costoAdquisicion - valorResidual) / vidaUtil;
  }

  /**
   * Método por Tasa de Depreciación - Depreciación ANUAL
   * Fórmula: costo de adquisición × tasa de depreciación
   */
  calcularDepreciacionPorTasa(
    costoAdquisicion: number,
    tasaDepreciacion: number,
  ): number {
    if (tasaDepreciacion < 0 || tasaDepreciacion > 1) {
      throw new Error('La tasa de depreciación debe estar entre 0 y 1');
    }
    return costoAdquisicion * tasaDepreciacion;
  }

  // ═══════════════════════════════════════════════════════
  // MÉTODOS DE CÁLCULO DE DEPRECIACIÓN MENSUAL
  // ═══════════════════════════════════════════════════════

  /**
   * Método de Línea Recta - Depreciación MENSUAL
   * Fórmula: (costo de adquisición - valor residual) / (vida útil × 12 meses)
   */
  calcularDepreciacionMensualLineaRecta(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
  ): number {
    const depreciacionAnual = this.calcularDepreciacionLineaRecta(
      costoAdquisicion,
      valorResidual,
      vidaUtil,
    );
    return depreciacionAnual / 12;
  }

  /**
   * Método por Tasa de Depreciación - Depreciación MENSUAL
   * Fórmula: (costo de adquisición × tasa de depreciación) / 12 meses
   */
  calcularDepreciacionMensualPorTasa(
    costoAdquisicion: number,
    tasaDepreciacion: number,
  ): number {
    const depreciacionAnual = this.calcularDepreciacionPorTasa(
      costoAdquisicion,
      tasaDepreciacion,
    );
    return depreciacionAnual / 12;
  }

  /**
   * Calcular depreciación acumulada MENSUAL hasta una fecha determinada
   * (método de línea recta)
   */
  calcularDepreciacionAcumuladaMensual(
    costoAdquisicion: number,
    valorResidual: number,
    vidaUtil: number,
    fechaCompra: Date,
    fechaCorte: Date = new Date(),
  ): {
    depreciacionMensual: number;
    mesesTranscurridos: number;
    depreciacionAcumulada: number;
    valorNeto: number;
  } {
    const depreciacionMensual = this.calcularDepreciacionMensualLineaRecta(
      costoAdquisicion,
      valorResidual,
      vidaUtil,
    );

    // Calcular meses transcurridos entre fecha de compra y fecha de corte
    const mesesTranscurridos = this.calcularMesesEntre(fechaCompra, fechaCorte);

    const depreciacionMaxima = costoAdquisicion - valorResidual;
    const depreciacionAcumulada = Math.min(
      depreciacionMensual * mesesTranscurridos,
      depreciacionMaxima,
    );

    const valorNeto = costoAdquisicion - depreciacionAcumulada;

    return {
      depreciacionMensual,
      mesesTranscurridos,
      depreciacionAcumulada,
      valorNeto,
    };
  }

  // ═══════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════

  /**
   * Calcula la cantidad de meses completos entre dos fechas
   */
  private calcularMesesEntre(fechaInicio: Date, fechaFin: Date): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    let meses = (fin.getFullYear() - inicio.getFullYear()) * 12;
    meses += fin.getMonth() - inicio.getMonth();

    // Si el día de fin es menor al día de inicio, restamos un mes
    if (fin.getDate() < inicio.getDate()) {
      meses--;
    }

    return Math.max(0, meses);
  }

  // ═══════════════════════════════════════════════════════
  // CRUD
  // ═══════════════════════════════════════════════════════

  async create(createActivoFijoDto: CreateActivoFijoDto): Promise<ActivoFijo> {
    const created = new this.activoModel(createActivoFijoDto);
    return created.save();
  }

  async findAll() {
    return this.activoModel.find()
      .populate('area')
      .populate('estadoActivo')
      .populate('depreciacionActivo')
      .exec();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const doc = await this.activoModel.findById(id)
      .populate('area')
      .populate('estadoActivo')
      .populate('depreciacionActivo')
      .exec();
    if (!doc) throw new NotFoundException('Activo no encontrado');
    return doc;
  }

  async update(id: string, updateActivoFijoDto: UpdateActivoFijoDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const updated = await this.activoModel.findByIdAndUpdate(
      id,
      updateActivoFijoDto as any,
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
}