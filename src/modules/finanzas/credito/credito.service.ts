import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { Credito, CreditoDocument } from './schema/credito.schema';
import { EstadoCredito } from './types/credito.types';

@Injectable()
export class CreditoService {
  constructor(@InjectModel(Credito.name) private creditoModel: Model<CreditoDocument>) {}
  async create(createDto: CreateCreditoDto): Promise<Credito> {
    const existente = await this.creditoModel.findOne({ codigo: createDto.codigo }).exec();
    if (existente) throw new BadRequestException('Ya existe un crédito con ese código');
    const created = new this.creditoModel(createDto);
    return created.save();
  }
  async findAll(): Promise<Credito[]> {
    return this.creditoModel.find().populate('banco').sort({ fechaSolicitud: -1 }).exec();
  }
  async findOne(id: string): Promise<Credito> {
    if (!isValidObjectId(id)) throw new NotFoundException('Crédito no encontrado');
    const doc = await this.creditoModel.findById(id).populate('banco').exec();
    if (!doc) throw new NotFoundException('Crédito no encontrado');
    return doc;
  }
  async update(id: string, updateDto: UpdateCreditoDto): Promise<Credito> {
    if (!isValidObjectId(id)) throw new NotFoundException('Crédito no encontrado');
    const updated = await this.creditoModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Crédito no encontrado');
    return updated;
  }
  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Crédito no encontrado');
    const removed = await this.creditoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Crédito no encontrado');
    return { deleted: true };
  }
  async getVencidos(): Promise<Credito[]> {
    const hoy = new Date();
    return this.creditoModel.find({
      estado: { $in: [EstadoCredito.EN_PAGO, EstadoCredito.VENCIDO] },
      fechaVencimiento: { $lt: hoy },
    }).populate('banco').exec();
  }
  async getClasificacionRiesgo(): Promise<any> {
    return this.creditoModel.aggregate([
      { $group: { _id: '$clasificacionRiesgo', cantidad: { $sum: 1 }, montoTotal: { $sum: '$saldoPendiente' } } },
      { $sort: { _id: 1 } },
    ]).exec();
  }
  async getResumen(): Promise<any> {
    const totalDesembolsado = await this.creditoModel.aggregate([
      { $match: { estado: { $nin: [EstadoCredito.SOLICITADO] } } },
      { $group: { _id: null, total: { $sum: '$montoDesembolsado' } } },
    ]).exec();
    const totalPendiente = await this.creditoModel.aggregate([
      { $match: { estado: { $in: [EstadoCredito.EN_PAGO, EstadoCredito.VENCIDO] } } },
      { $group: { _id: null, total: { $sum: '$saldoPendiente' } } },
    ]).exec();
    return {
      totalDesembolsado: totalDesembolsado.length > 0 ? totalDesembolsado[0].total : 0,
      totalPendiente: totalPendiente.length > 0 ? totalPendiente[0].total : 0,
      porEstado: await this.creditoModel.aggregate([{ $group: { _id: '$estado', cantidad: { $sum: 1 } } }]).exec(),
    };
  }
}
