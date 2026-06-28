import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';
import { CreateArqueoCajaDto } from './dto/create-arqueo-caja.dto';
import { MovimientoCaja, MovimientoCajaDocument } from './schema/caja.schema';
import { ArqueoCaja, ArqueoCajaDocument } from './schema/arqueo-caja.schema';
import { TipoMovimientoCaja, EstadoArqueo } from './types/caja.types';

@Injectable()
export class CajaService {
  constructor(
    @InjectModel(MovimientoCaja.name) private cajaModel: Model<MovimientoCajaDocument>,
    @InjectModel(ArqueoCaja.name) private arqueoModel: Model<ArqueoCajaDocument>,
  ) {}

  async createMovimiento(createDto: CreateMovimientoCajaDto): Promise<MovimientoCaja> {
    const existente = await this.cajaModel.findOne({ codigo: createDto.codigo }).exec();
    if (existente) throw new BadRequestException('Ya existe un movimiento con ese código');
    const created = new this.cajaModel(createDto);
    return created.save();
  }

  async findAll(): Promise<MovimientoCaja[]> {
    return this.cajaModel.find().sort({ fecha: -1 }).exec();
  }

  async findOne(id: string): Promise<MovimientoCaja> {
    if (!isValidObjectId(id)) throw new NotFoundException('Movimiento de caja no encontrado');
    const doc = await this.cajaModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Movimiento de caja no encontrado');
    return doc;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Movimiento de caja no encontrado');
    const removed = await this.cajaModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Movimiento de caja no encontrado');
    return { deleted: true };
  }

  async getSaldoActual(): Promise<{ saldo: number }> {
    const ingresos = await this.cajaModel.aggregate([
      { $match: { tipo: { $in: [TipoMovimientoCaja.APERTURA, TipoMovimientoCaja.INGRESO] } } },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]).exec();
    const egresos = await this.cajaModel.aggregate([
      { $match: { tipo: TipoMovimientoCaja.EGRESO } },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]).exec();
    const totalIngresos = ingresos.length > 0 ? ingresos[0].total : 0;
    const totalEgresos = egresos.length > 0 ? egresos[0].total : 0;
    return { saldo: totalIngresos - totalEgresos };
  }

  async getMovimientosDelDia(fecha?: string): Promise<MovimientoCaja[]> {
    const dia = fecha ? new Date(fecha) : new Date();
    const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
    const fin = new Date(inicio.getTime() + 86400000);
    return this.cajaModel.find({ fecha: { $gte: inicio, $lt: fin } }).sort({ fecha: -1 }).exec();
  }

  async realizarArqueo(arqueoDto: CreateArqueoCajaDto): Promise<ArqueoCaja> {
    const { saldo } = await this.getSaldoActual();
    const diferencia = Number((arqueoDto.efectivoContado - saldo).toFixed(2));
    const estado = diferencia === 0 ? EstadoArqueo.CUADRADO : EstadoArqueo.DIFERENCIA;
    const arqueo = new this.arqueoModel({
      fecha: new Date(),
      saldoEsperado: saldo,
      efectivoContado: arqueoDto.efectivoContado,
      diferencia,
      estado,
      observaciones: arqueoDto.observaciones,
      realizadoPor: arqueoDto.realizadoPor,
    });
    return arqueo.save();
  }

  async getArqueos(): Promise<ArqueoCaja[]> {
    return this.arqueoModel.find().sort({ fecha: -1 }).exec();
  }

  async getResumenPorConcepto(desde?: string, hasta?: string): Promise<any> {
    const filtro: any = {};
    if (desde && hasta) filtro.fecha = { $gte: new Date(desde), $lte: new Date(hasta) };
    return this.cajaModel.aggregate([
      { $match: filtro },
      { $group: { _id: '$concepto', total: { $sum: '$monto' }, cantidad: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]).exec();
  }
}
