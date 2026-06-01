import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';
import { ActivoFijo, ActivoFijoDocument } from './schema/activo_fijo.schema';

@Injectable()
export class ActivoFijoService {
  constructor(@InjectModel(ActivoFijo.name) private activoModel: Model<ActivoFijoDocument>) {}

  async create(createActivoFijoDto: CreateActivoFijoDto) {
    const created = new this.activoModel(createActivoFijoDto as any);
    return created.save();
  }

  async findAll() {
    return this.activoModel.find().populate('area').populate('estadoActivo').exec();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const doc = await this.activoModel.findById(id).populate('area').populate('estadoActivo').exec();
    if (!doc) throw new NotFoundException('Activo no encontrado');
    return doc;
  }

  async update(id: string, updateActivoFijoDto: UpdateActivoFijoDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Activo no encontrado');
    const updated = await this.activoModel.findByIdAndUpdate(id, updateActivoFijoDto as any, { new: true }).exec();
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
