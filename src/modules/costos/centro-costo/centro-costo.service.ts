import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';
import { UpdateCentroCostoDto } from './dto/update-centro-costo.dto';
import {
  CentroCosto,
  CentroCostoDocument,
  TipoCentroCosto,
} from './schema/centro-costo.schema';

@Injectable()
export class CentroCostoService {
  constructor(
    @InjectModel(CentroCosto.name)
    private centroCostoModel: Model<CentroCostoDocument>,
  ) {}

  async create(createDto: CreateCentroCostoDto): Promise<CentroCosto> {
    const existente = await this.centroCostoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente) {
      throw new BadRequestException(
        'Ya existe un centro de costo con ese código',
      );
    }
    const created = new this.centroCostoModel(createDto);
    return created.save();
  }

  async findAll(): Promise<CentroCosto[]> {
    return this.centroCostoModel
      .find()
      .populate('departamento')
      .populate('centroPadre')
      .sort({ codigo: 1 })
      .exec();
  }

  async findOne(id: string): Promise<CentroCosto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Centro de costo no encontrado');
    }
    const doc = await this.centroCostoModel
      .findById(id)
      .populate('departamento')
      .populate('centroPadre')
      .exec();
    if (!doc) {
      throw new NotFoundException('Centro de costo no encontrado');
    }
    return doc;
  }

  async findSubcentros(centroId: string): Promise<CentroCosto[]> {
    return this.centroCostoModel
      .find({ centroPadre: centroId })
      .populate('departamento')
      .populate('centroPadre')
      .sort({ codigo: 1 })
      .exec();
  }

  async findByTipo(tipo: TipoCentroCosto): Promise<CentroCosto[]> {
    return this.centroCostoModel
      .find({ tipo })
      .populate('departamento')
      .populate('centroPadre')
      .sort({ codigo: 1 })
      .exec();
  }

  async update(
    id: string,
    updateDto: UpdateCentroCostoDto,
  ): Promise<CentroCosto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Centro de costo no encontrado');
    }
    if (updateDto.codigo) {
      const existente = await this.centroCostoModel
        .findOne({ codigo: updateDto.codigo, _id: { $ne: id } })
        .exec();
      if (existente) {
        throw new BadRequestException(
          'Ya existe un centro de costo con ese código',
        );
      }
    }
    const updated = await this.centroCostoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('departamento')
      .populate('centroPadre')
      .exec();
    if (!updated) {
      throw new NotFoundException('Centro de costo no encontrado');
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Centro de costo no encontrado');
    }
    const removed = await this.centroCostoModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException('Centro de costo no encontrado');
    }
    return { deleted: true };
  }
}
