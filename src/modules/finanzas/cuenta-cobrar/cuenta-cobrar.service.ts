import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCuentaCobrarDto } from './dto/create-cuenta-cobrar.dto';
import { UpdateCuentaCobrarDto } from './dto/update-cuenta-cobrar.dto';
import {
  CuentaCobrar,
  CuentaCobrarDocument,
} from './schema/cuenta-cobrar.schema';
import { EstadoCxC, EnvejecimientoCxC } from './types/cuenta-cobrar.types';

@Injectable()
export class CuentaCobrarService {
  constructor(
    @InjectModel(CuentaCobrar.name)
    private cxcModel: Model<CuentaCobrarDocument>,
  ) {}

  async create(createDto: CreateCuentaCobrarDto): Promise<CuentaCobrar> {
    const existente = await this.cxcModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe una CxC con ese código');
    const created = new this.cxcModel({
      ...createDto,
      saldoPendiente: createDto.montoOriginal,
    });
    return created.save();
  }

  async findAll(): Promise<CuentaCobrar[]> {
    return this.cxcModel
      .find()
      .populate('cliente')
      .populate('concepto')
      .sort({ fechaEmision: -1 })
      .exec();
  }

  async findOne(id: string): Promise<CuentaCobrar> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    const doc = await this.cxcModel
      .findById(id)
      .populate('cliente')
      .populate('concepto')
      .exec();
    if (!doc) throw new NotFoundException('Cuenta por cobrar no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateCuentaCobrarDto,
  ): Promise<CuentaCobrar> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    const updated = await this.cxcModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    const removed = await this.cxcModel.findByIdAndDelete(id).exec();
    if (!removed)
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    return { deleted: true };
  }

  async getVencidas(): Promise<CuentaCobrar[]> {
    const hoy = new Date();
    return this.cxcModel
      .find({
        estado: {
          $in: [EstadoCxC.PENDIENTE, EstadoCxC.PARCIAL, EstadoCxC.VENCIDA],
        },
        fechaVencimiento: { $lt: hoy },
      })
      .populate('cliente')
      .populate('concepto')
      .sort({ fechaVencimiento: 1 })
      .exec();
  }

  private async _computeEnvejecimiento<T extends { saldoPendiente: number }>(
    documentos: T[],
    rangos: { min: number; max: number; label: string }[],
    hoy: Date,
  ): Promise<
    {
      rango: string;
      cantidad: number;
      montoTotal: number;
      porcentaje: number;
    }[]
  > {
    const totalGeneral = documentos.reduce(
      (sum, c) => sum + c.saldoPendiente,
      0,
    );
    return rangos.map((rango) => {
      const filtradas = documentos.filter((c) => {
        const diff = Math.floor(
          (hoy.getTime() - new Date(c['fechaVencimiento']).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return diff >= rango.min && diff <= rango.max;
      });
      const montoTotal = filtradas.reduce(
        (sum, c) => sum + c.saldoPendiente,
        0,
      );
      return {
        rango: rango.label,
        cantidad: filtradas.length,
        montoTotal,
        porcentaje:
          totalGeneral > 0
            ? Number(((montoTotal / totalGeneral) * 100).toFixed(2))
            : 0,
      };
    });
  }

  async getEnvejecimiento(): Promise<EnvejecimientoCxC[]> {
    const hoy = new Date();
    const rangos = [
      { min: 0, max: 30, label: '0-30 días' },
      { min: 31, max: 60, label: '31-60 días' },
      { min: 61, max: 90, label: '61-90 días' },
      { min: 91, max: 999999, label: 'Más de 90 días' },
    ];
    const todas = await this.cxcModel
      .find({
        estado: {
          $in: [EstadoCxC.PENDIENTE, EstadoCxC.PARCIAL, EstadoCxC.VENCIDA],
        },
      })
      .exec();

    return this._computeEnvejecimiento(todas, rangos, hoy);
  }

  async abonar(
    id: string,
    abono: { monto: number; fechaPago?: string; referencia?: string },
  ): Promise<CuentaCobrar> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    const cxc = await this.cxcModel.findById(id).exec();
    if (!cxc) throw new NotFoundException('Cuenta por cobrar no encontrada');
    if (cxc.estado === EstadoCxC.PAGADA)
      throw new BadRequestException('La cuenta ya está pagada');
    if (cxc.estado === EstadoCxC.CASTIGADA)
      throw new BadRequestException('La cuenta está castigada');
    if (abono.monto <= 0)
      throw new BadRequestException('El monto debe ser mayor a 0');
    if (abono.monto > cxc.saldoPendiente)
      throw new BadRequestException('El monto excede el saldo pendiente');

    cxc.saldoPendiente = Number((cxc.saldoPendiente - abono.monto).toFixed(2));
    if (cxc.saldoPendiente === 0) cxc.estado = EstadoCxC.PAGADA;
    else cxc.estado = EstadoCxC.PARCIAL;
    return cxc.save();
  }

  async getEnvejecimientoPorCliente(
    clienteId: string,
  ): Promise<EnvejecimientoCxC[]> {
    const hoy = new Date();
    const rangos = [
      { min: 0, max: 30, label: '0-30 días' },
      { min: 31, max: 60, label: '31-60 días' },
      { min: 61, max: 90, label: '61-90 días' },
      { min: 91, max: 999999, label: 'Más de 90 días' },
    ];
    const todas = await this.cxcModel
      .find({
        cliente: clienteId,
        estado: {
          $in: [EstadoCxC.PENDIENTE, EstadoCxC.PARCIAL, EstadoCxC.VENCIDA],
        },
      })
      .exec();

    return this._computeEnvejecimiento(todas, rangos, hoy);
  }

  async getResumen(): Promise<any> {
    const totalPendiente = await this.cxcModel
      .aggregate([
        { $match: { estado: { $ne: EstadoCxC.PAGADA } } },
        { $group: { _id: null, total: { $sum: '$saldoPendiente' } } },
      ])
      .exec();
    const porEstado = await this.cxcModel
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
