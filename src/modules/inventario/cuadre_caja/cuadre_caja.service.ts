import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCuadreCajaDto } from './dto/create-cuadre_caja.dto';
import { UpdateCuadreCajaDto } from './dto/update-cuadre_caja.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CuadreCaja } from './schema/cuadre_caja.schema';
import { Usuario } from '../../auth/schemas/empleado.schema';
import { Venta } from '../../venta/venta/schema/venta.schema';
import { Pago } from '../../venta/pago/schema/pago.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class CuadreCajaService {
  constructor(
    @InjectModel(CuadreCaja.name) private cuadreCajaModel: Model<CuadreCaja>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(Venta.name) private ventaModel: Model<Venta>,
    @InjectModel(Pago.name) private pagoModel: Model<Pago>,
  ) {}

  async create(createCuadreCajaDto: CreateCuadreCajaDto): Promise<CuadreCaja> {
    const { empleado, desglose_billetes } = createCuadreCajaDto;

    if (!Types.ObjectId.isValid(empleado)) {
      throw new BadRequestException('El ID del empleado no es válido');
    }

    const empleadoExist = await this.usuarioModel.findById(empleado);
    if (!empleadoExist) {
      throw new NotFoundException('El empleado no existe');
    }

    const totalEfectivo = this.calcularTotalDesglose(desglose_billetes);
    const nuevoCuadre = new this.cuadreCajaModel({
      ...createCuadreCajaDto,
      creditos: createCuadreCajaDto.creditos ?? 0,
      otros_motivos: createCuadreCajaDto.otros_motivos ?? [],
      total_efectivo: totalEfectivo,
    });
    return nuevoCuadre.save();
  }

  private calcularTotalDesglose(desglose: any): number {
    return (
      (desglose.billete5000 || 0) * 5000 +
      (desglose.billete2000 || 0) * 2000 +
      (desglose.billete1000 || 0) * 1000 +
      (desglose.billete500 || 0) * 500 +
      (desglose.billete200 || 0) * 200 +
      (desglose.billete100 || 0) * 100 +
      (desglose.billete50 || 0) * 50 +
      (desglose.billete20 || 0) * 20 +
      (desglose.billete10 || 0) * 10 +
      (desglose.billete5 || 0) * 5 +
      (desglose.billete3 || 0) * 3 +
      (desglose.billete1 || 0) * 1
    );
  }

  async findAll(fecha?: string): Promise<CuadreCaja[]> {
    const filter: Record<string, any> = {};
    if (fecha) {
      const start = new Date(fecha);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      filter.fecha = { $gte: start, $lte: end };
    }
    return this.cuadreCajaModel
      .find(filter)
      .populate({ path: 'empleado', select: 'nombre_empleado ci_empleado' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<CuadreCaja> {
    const cuadre = await this.cuadreCajaModel
      .findById(id)
      .populate({ path: 'empleado', select: 'nombre_empleado ci_empleado' })
      .exec();

    if (!cuadre) {
      throw new NotFoundException('No se encontró el cuadre de caja');
    }
    return cuadre;
  }

  async update(
    id: string,
    updateCuadreCajaDto: UpdateCuadreCajaDto,
  ): Promise<CuadreCaja> {
    if (updateCuadreCajaDto.empleado) {
      const existe = await this.usuarioModel.findById(
        updateCuadreCajaDto.empleado,
      );
      if (!existe) throw new NotFoundException('El empleado no existe');
    }

    const updateData: any = { ...updateCuadreCajaDto };

    if (updateCuadreCajaDto.desglose_billetes) {
      updateData.total_efectivo = this.calcularTotalDesglose(
        updateCuadreCajaDto.desglose_billetes,
      );
    }

    const updateCuadre = await this.cuadreCajaModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updateCuadre) {
      throw new NotFoundException('No se encontró el cuadre de caja');
    }
    return updateCuadre;
  }

  async remove(id: string): Promise<void> {
    const deleteCuadre = await this.cuadreCajaModel
      .findByIdAndDelete(id)
      .exec();
    if (!deleteCuadre) {
      throw new NotFoundException('No se encontró el cuadre de caja');
    }
  }

  async getResumenDiario(fecha?: string): Promise<any> {
    const start = fecha ? new Date(fecha) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const ventas = await this.ventaModel
      .find({ createdAt: { $gte: start, $lte: end } })
      .populate({ path: 'pago', select: 'metodoPago monto_pagado' })
      .lean()
      .exec();

    let totalVentas = 0;
    let totalEfectivo = 0;
    let totalTransferencias = 0;
    let totalCreditos = 0;
    let totalDescuentos = 0;

    for (const venta of ventas) {
      totalVentas += venta.subtotal_venta || 0;
      totalDescuentos += venta.descuento_total || 0;

      const pago = venta.pago as any;
      if (pago) {
        if (pago.metodoPago === 'efectivo') {
          totalEfectivo += pago.monto_pagado || 0;
        } else if (pago.metodoPago === 'transferencia') {
          totalTransferencias += pago.monto_pagado || 0;
        } else if (pago.metodoPago === 'credito') {
          totalCreditos += venta.subtotal_venta || 0;
        }
      }
    }

    const cuadresPrevios = await this.cuadreCajaModel
      .find({ fecha: { $gte: start, $lte: end } })
      .lean()
      .exec();

    const totalExtracciones = cuadresPrevios.reduce(
      (sum, c) => sum + (c.total_extracciones_dia || 0),
      0,
    );

    return {
      total_ventas_dia: totalVentas,
      total_efectivo: totalEfectivo,
      valor_transferencias: totalTransferencias,
      total_creditos: totalCreditos,
      descuentos: totalDescuentos,
      total_extracciones_dia: totalExtracciones,
    };
  }
}
