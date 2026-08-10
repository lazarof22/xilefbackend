import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UnidadMedida } from './schema/unidad-medida.schema';
import { Model } from 'mongoose';

@Injectable()
export class UnidadMedidaService {
  constructor(
    @InjectModel(UnidadMedida.name)
    private unidadMedidaModel: Model<UnidadMedida>,
  ) {}

  async create(
    createUnidadMedidaDto: CreateUnidadMedidaDto,
  ): Promise<UnidadMedida> {
    const exist = await this.unidadMedidaModel.findOne({
      nombre: createUnidadMedidaDto.nombre,
    });

    if (exist) {
      throw new BadRequestException('Ya existe la unidad de medida');
    }
    const nuevo = new this.unidadMedidaModel(createUnidadMedidaDto);
    return nuevo.save();
  }

  async findAll(): Promise<UnidadMedida[]> {
    return this.unidadMedidaModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<UnidadMedida> {
    const item = await this.unidadMedidaModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('No se encontró la unidad de medida');
    }
    return item;
  }

  async update(
    id: string,
    updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ): Promise<UnidadMedida> {
    const item = await this.unidadMedidaModel
      .findByIdAndUpdate(id, updateUnidadMedidaDto, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('No se encontró la unidad de medida');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const item = await this.unidadMedidaModel.findByIdAndDelete(id);

    if (!item) {
      throw new NotFoundException('No se encontró la unidad de medida');
    }
  }
}
