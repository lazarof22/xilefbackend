import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';
import { UpdateCentroCostoDto } from './dto/update-centro-costo.dto';
import { CentroCosto, CentroCostoDocument } from './schema/centro-costo.schema';

@Injectable()
export class CentroCostoService {
  constructor(
    @InjectModel(CentroCosto.name)
    private centroModel: Model<CentroCostoDocument>,
  ) {}

  async create(createDto: CreateCentroCostoDto): Promise<CentroCosto> {
    const existente = await this.centroModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe un centro de costo con ese código',
      );
    const created = new this.centroModel(createDto);
    return created.save();
  }

  async findAll(): Promise<CentroCosto[]> {
    return this.centroModel.find().sort({ codigo: 1 }).exec();
  }

  async findOne(id: string): Promise<CentroCosto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Centro de costo no encontrado');
    const doc = await this.centroModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Centro de costo no encontrado');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateCentroCostoDto,
  ): Promise<CentroCosto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Centro de costo no encontrado');
    if (updateDto.codigo) {
      const existente = await this.centroModel
        .findOne({ codigo: updateDto.codigo, _id: { $ne: id } })
        .exec();
      if (existente)
        throw new BadRequestException(
          'Ya existe un centro de costo con ese código',
        );
    }
    const updated = await this.centroModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Centro de costo no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Centro de costo no encontrado');
    const removed = await this.centroModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Centro de costo no encontrado');
    return { deleted: true };
  }
}
