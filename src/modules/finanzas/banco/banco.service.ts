import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { Banco, BancoDocument } from './schema/banco.schema';
import { SaldoResponse } from './types/banco.types';

@Injectable()
export class BancoService {
  constructor(@InjectModel(Banco.name) private bancoModel: Model<BancoDocument>) {}

  async create(createDto: CreateBancoDto): Promise<Banco> {
    const existente = await this.bancoModel.findOne({ codigoBanco: createDto.codigoBanco }).exec();
    if (existente) throw new BadRequestException('Ya existe una cuenta con ese código');
    const saldoInicial = createDto.saldoInicial ?? 0;
    const created = new this.bancoModel({ ...createDto, saldoInicial, saldoActual: saldoInicial });
    return created.save();
  }

  async findAll(): Promise<Banco[]> {
    return this.bancoModel.find().populate('moneda').sort({ codigoBanco: 1 }).exec();
  }

  async findOne(id: string): Promise<Banco> {
    if (!isValidObjectId(id)) throw new NotFoundException('Cuenta bancaria no encontrada');
    const doc = await this.bancoModel.findById(id).populate('moneda').exec();
    if (!doc) throw new NotFoundException('Cuenta bancaria no encontrada');
    return doc;
  }

  async update(id: string, updateDto: UpdateBancoDto): Promise<Banco> {
    if (!isValidObjectId(id)) throw new NotFoundException('Cuenta bancaria no encontrada');
    const updated = await this.bancoModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Cuenta bancaria no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Cuenta bancaria no encontrada');
    const removed = await this.bancoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Cuenta bancaria no encontrada');
    return { deleted: true };
  }

  async getSaldos(): Promise<SaldoResponse[]> {
    const cuentas = await this.bancoModel.find({ activo: true }).populate('moneda').exec();
    return cuentas.map(c => ({
      cuentaId: c._id.toString(),
      numeroCuenta: c.numeroCuenta,
      nombreBanco: c.nombreBanco,
      tipoCuenta: c.tipoCuenta,
      saldoActual: c.saldoActual,
    }));
  }

  async actualizarSaldo(id: string, monto: number): Promise<Banco> {
    const cuenta = await this.bancoModel.findById(id).exec();
    if (!cuenta) throw new NotFoundException('Cuenta bancaria no encontrada');
    cuenta.saldoActual += monto;
    return cuenta.save();
  }
}
