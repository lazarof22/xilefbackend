import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCuentaPagarDto } from './dto/create-cuenta-pagar.dto';
import { UpdateCuentaPagarDto } from './dto/update-cuenta-pagar.dto';
import { CuentaPagar, CuentaPagarDocument } from './schema/cuenta-pagar.schema';
import { EstadoCxP, EnvejecimientoCxP } from './types/cuenta-pagar.types';

@Injectable()
export class CuentaPagarService {
  constructor(
    @InjectModel(CuentaPagar.name) private cxpModel: Model<CuentaPagarDocument>,
  ) {}

  async create(createDto: CreateCuentaPagarDto): Promise<CuentaPagar> {
    const existente = await this.cxpModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe una CxP con ese código');
    const created = new this.cxpModel({
      ...createDto,
      saldoPendiente: createDto.montoOriginal,
    });
    return created.save();
  }

  async findAll(): Promise<CuentaPagar[]> {
    return this.cxpModel
      .find()
      .populate('proveedor')
      .populate('concepto')
      .sort({ fechaEmision: -1 })
      .exec();
  }

  async findOne(id: string): Promise<CuentaPagar> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por pagar no encontrada');
    const doc = await this.cxpModel
      .findById(id)
      .populate('proveedor')
      .populate('concepto')
      .exec();
    if (!doc) throw new NotFoundException('Cuenta por pagar no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateCuentaPagarDto,
  ): Promise<CuentaPagar> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por pagar no encontrada');
    const updated = await this.cxpModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Cuenta por pagar no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por pagar no encontrada');
    const removed = await this.cxpModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Cuenta por pagar no encontrada');
    return { deleted: true };
  }

  async getVencidas(): Promise<CuentaPagar[]> {
    const hoy = new Date();
    return this.cxpModel
      .find({
        estado: {
          $in: [EstadoCxP.PENDIENTE, EstadoCxP.PARCIAL, EstadoCxP.VENCIDA],
        },
        fechaVencimiento: { $lt: hoy },
      })
      .populate('proveedor')
      .populate('concepto')
      .sort({ fechaVencimiento: 1 })
      .exec();
  }

  async getEnvejecimientoPorProveedor(
    proveedorId: string,
  ): Promise<EnvejecimientoCxP[]> {
    const hoy = new Date();
    const rangos = [
      { min: 0, max: 30, label: '0-30 días' },
      { min: 31, max: 60, label: '31-60 días' },
      { min: 61, max: 90, label: '61-90 días' },
      { min: 91, max: 999999, label: 'Más de 90 días' },
    ];
    const todas = await this.cxpModel
      .find({
        proveedor: proveedorId,
        estado: {
          $in: [EstadoCxP.PENDIENTE, EstadoCxP.PARCIAL, EstadoCxP.VENCIDA],
        },
      })
      .exec();

    return rangos.map((rango) => {
      const filtradas = todas.filter((c) => {
        const diff = Math.floor(
          (hoy.getTime() - c.fechaVencimiento.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return diff >= rango.min && diff <= rango.max;
      });
      const montoTotal = filtradas.reduce(
        (sum, c) => sum + c.saldoPendiente,
        0,
      );
      return { rango: rango.label, cantidad: filtradas.length, montoTotal };
    });
  }

  async getEnvejecimiento(): Promise<EnvejecimientoCxP[]> {
    const hoy = new Date();
    const rangos = [
      { min: 0, max: 30, label: '0-30 días' },
      { min: 31, max: 60, label: '31-60 días' },
      { min: 61, max: 90, label: '61-90 días' },
      { min: 91, max: 999999, label: 'Más de 90 días' },
    ];
    const todas = await this.cxpModel
      .find({
        estado: {
          $in: [EstadoCxP.PENDIENTE, EstadoCxP.PARCIAL, EstadoCxP.VENCIDA],
        },
      })
      .exec();

    return rangos.map((rango) => {
      const filtradas = todas.filter((c) => {
        const diff = Math.floor(
          (hoy.getTime() - c.fechaVencimiento.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return diff >= rango.min && diff <= rango.max;
      });
      const montoTotal = filtradas.reduce(
        (sum, c) => sum + c.saldoPendiente,
        0,
      );
      return { rango: rango.label, cantidad: filtradas.length, montoTotal };
    });
  }

  async abonar(
    id: string,
    abono: { monto: number; fechaPago?: string; referencia?: string },
  ): Promise<CuentaPagar> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por pagar no encontrada');
    const cxp = await this.cxpModel.findById(id).exec();
    if (!cxp) throw new NotFoundException('Cuenta por pagar no encontrada');
    if (cxp.estado === EstadoCxP.PAGADA)
      throw new BadRequestException('La cuenta ya está pagada');
    if (abono.monto <= 0)
      throw new BadRequestException('El monto debe ser mayor a 0');
    if (abono.monto > cxp.saldoPendiente)
      throw new BadRequestException('El monto excede el saldo pendiente');

    cxp.saldoPendiente = Number((cxp.saldoPendiente - abono.monto).toFixed(2));
    if (cxp.saldoPendiente === 0) cxp.estado = EstadoCxP.PAGADA;
    else cxp.estado = EstadoCxP.PARCIAL;
    return cxp.save();
  }

  async getResumen(): Promise<any> {
    const totalPendiente = await this.cxpModel
      .aggregate([
        { $match: { estado: { $ne: EstadoCxP.PAGADA } } },
        { $group: { _id: null, total: { $sum: '$saldoPendiente' } } },
      ])
      .exec();
    const porEstado = await this.cxpModel
      .aggregate([
        {
          $group: {
            _id: '$estado',
            cantidad: { $sum: 1 },
            total: { $sum: '$saldoPendiente' },
          },
        },
      ])
      .exec();
    return {
      totalPendiente: totalPendiente.length > 0 ? totalPendiente[0].total : 0,
      porEstado,
    };
  }
}
