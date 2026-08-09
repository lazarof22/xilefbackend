import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateElementoGastoDto } from './dto/create-elemento-gasto.dto';
import { UpdateElementoGastoDto } from './dto/update-elemento-gasto.dto';
import {
  ElementoGasto,
  ElementoGastoDocument,
} from './schema/elemento-gasto.schema';

@Injectable()
export class ElementoGastoService {
  constructor(
    @InjectModel(ElementoGasto.name)
    private elementoModel: Model<ElementoGastoDocument>,
  ) {}

  async create(createDto: CreateElementoGastoDto): Promise<ElementoGasto> {
    const existente = await this.elementoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe un elemento de gasto con ese código',
      );
    const created = new this.elementoModel(createDto);
    return created.save();
  }

  async findAll(): Promise<ElementoGasto[]> {
    return this.elementoModel.find().sort({ codigo: 1 }).exec();
  }

  async findOne(id: string): Promise<ElementoGasto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Elemento de gasto no encontrado');
    const doc = await this.elementoModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Elemento de gasto no encontrado');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateElementoGastoDto,
  ): Promise<ElementoGasto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Elemento de gasto no encontrado');
    if (updateDto.codigo) {
      const existente = await this.elementoModel
        .findOne({ codigo: updateDto.codigo, _id: { $ne: id } })
        .exec();
      if (existente)
        throw new BadRequestException(
          'Ya existe un elemento de gasto con ese código',
        );
    }
    const updated = await this.elementoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException('Elemento de gasto no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Elemento de gasto no encontrado');
    const removed = await this.elementoModel.findByIdAndDelete(id).exec();
    if (!removed)
      throw new NotFoundException('Elemento de gasto no encontrado');
    return { deleted: true };
  }
}
