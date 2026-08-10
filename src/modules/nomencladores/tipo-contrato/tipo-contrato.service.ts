import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTipoContratoDto } from './dto/create-tipo-contrato.dto';
import { UpdateTipoContratoDto } from './dto/update-tipo-contrato.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TipoContrato } from './schema/tipo-contrato.schema';
import { Model } from 'mongoose';

@Injectable()
export class TipoContratoService {
  constructor(
    @InjectModel(TipoContrato.name)
    private tipoContratoModel: Model<TipoContrato>,
  ) {}

  async create(
    createTipoContratoDto: CreateTipoContratoDto,
  ): Promise<TipoContrato> {
    const exist = await this.tipoContratoModel.findOne({
      nombre: createTipoContratoDto.nombre,
    });

    if (exist) {
      throw new BadRequestException('Ya existe el tipo de contrato');
    }
    const nuevo = new this.tipoContratoModel(createTipoContratoDto);
    return nuevo.save();
  }

  async findAll(): Promise<TipoContrato[]> {
    return this.tipoContratoModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TipoContrato> {
    const item = await this.tipoContratoModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('No se encontró el tipo de contrato');
    }
    return item;
  }

  async update(
    id: string,
    updateTipoContratoDto: UpdateTipoContratoDto,
  ): Promise<TipoContrato> {
    const item = await this.tipoContratoModel
      .findByIdAndUpdate(id, updateTipoContratoDto, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('No se encontró el tipo de contrato');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const item = await this.tipoContratoModel.findByIdAndDelete(id);

    if (!item) {
      throw new NotFoundException('No se encontró el tipo de contrato');
    }
  }
}
