import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { Cuenta, CuentaDocument } from './schema/cuenta.schema';

@Injectable()
export class CuentaService {
  constructor(@InjectModel(Cuenta.name) private cuentaModel: Model<CuentaDocument>) {}

  async create(createDto: CreateCuentaDto): Promise<Cuenta> {
    const existente = await this.cuentaModel.findOne({ codigoCuenta: createDto.codigoCuenta }).exec();
    if (existente) throw new BadRequestException('Ya existe una cuenta con ese código');
    const created = new this.cuentaModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Cuenta[]> {
    return this.cuentaModel.find().sort({ codigoCuenta: 1 }).exec();
  }

  async findOne(id: string): Promise<Cuenta> {
    if (!isValidObjectId(id)) throw new NotFoundException('Cuenta no encontrada');
    const doc = await this.cuentaModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Cuenta no encontrada');
    return doc;
  }

  async update(id: string, updateDto: UpdateCuentaDto): Promise<Cuenta> {
    if (!isValidObjectId(id)) throw new NotFoundException('Cuenta no encontrada');
    const updated = await this.cuentaModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Cuenta no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Cuenta no encontrada');
    const removed = await this.cuentaModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Cuenta no encontrada');
    return { deleted: true };
  }
}
