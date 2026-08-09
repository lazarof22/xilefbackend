import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';
import { Asiento, AsientoDocument } from './schema/asiento.schema';

@Injectable()
export class AsientoService {
  constructor(
    @InjectModel(Asiento.name) private asientoModel: Model<AsientoDocument>,
  ) {}

  async create(createDto: CreateAsientoDto): Promise<Asiento> {
    const created = new this.asientoModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Asiento[]> {
    return this.asientoModel.find().sort({ fecha: -1, createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Asiento> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Asiento no encontrado');
    const doc = await this.asientoModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Asiento no encontrado');
    return doc;
  }

  async update(id: string, updateDto: UpdateAsientoDto): Promise<Asiento> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Asiento no encontrado');
    const updated = await this.asientoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Asiento no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Asiento no encontrado');
    const removed = await this.asientoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Asiento no encontrado');
    return { deleted: true };
  }
}
