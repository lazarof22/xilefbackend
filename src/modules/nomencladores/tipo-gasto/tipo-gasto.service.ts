import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTipoGastoDto } from './dto/create-tipo-gasto.dto';
import { UpdateTipoGastoDto } from './dto/update-tipo-gasto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TipoGasto } from './schema/tipo-gasto.schema';
import { Model } from 'mongoose';

@Injectable()
export class TipoGastoService {
  constructor(
    @InjectModel(TipoGasto.name) private tipoGastoModel: Model<TipoGasto>,
  ) {}

  async create(createTipoGastoDto: CreateTipoGastoDto): Promise<TipoGasto> {
    const exist = await this.tipoGastoModel.findOne({
      nombre: createTipoGastoDto.nombre,
    });

    if (exist) {
      throw new BadRequestException('Ya existe el tipo de gasto');
    }
    const nuevo = new this.tipoGastoModel(createTipoGastoDto);
    return nuevo.save();
  }

  async findAll(): Promise<TipoGasto[]> {
    return this.tipoGastoModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TipoGasto> {
    const item = await this.tipoGastoModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('No se encontró el tipo de gasto');
    }
    return item;
  }

  async update(
    id: string,
    updateTipoGastoDto: UpdateTipoGastoDto,
  ): Promise<TipoGasto> {
    const item = await this.tipoGastoModel
      .findByIdAndUpdate(id, updateTipoGastoDto, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('No se encontró el tipo de gasto');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const item = await this.tipoGastoModel.findByIdAndDelete(id);

    if (!item) {
      throw new NotFoundException('No se encontró el tipo de gasto');
    }
  }
}
