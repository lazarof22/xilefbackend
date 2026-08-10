import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateNaturalezaCuentaDto } from './dto/create-naturaleza-cuenta.dto';
import { UpdateNaturalezaCuentaDto } from './dto/update-naturaleza-cuenta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NaturalezaCuenta } from './schema/naturaleza-cuenta.schema';
import { Model } from 'mongoose';

@Injectable()
export class NaturalezaCuentaService {
  constructor(
    @InjectModel(NaturalezaCuenta.name)
    private naturalezaCuentaModel: Model<NaturalezaCuenta>,
  ) {}

  async create(
    createNaturalezaCuentaDto: CreateNaturalezaCuentaDto,
  ): Promise<NaturalezaCuenta> {
    const exist = await this.naturalezaCuentaModel.findOne({
      nombre: createNaturalezaCuentaDto.nombre,
    });

    if (exist) {
      throw new BadRequestException('Ya existe la naturaleza de cuenta');
    }
    const nuevo = new this.naturalezaCuentaModel(createNaturalezaCuentaDto);
    return nuevo.save();
  }

  async findAll(): Promise<NaturalezaCuenta[]> {
    return this.naturalezaCuentaModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<NaturalezaCuenta> {
    const item = await this.naturalezaCuentaModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('No se encontró la naturaleza de cuenta');
    }
    return item;
  }

  async update(
    id: string,
    updateNaturalezaCuentaDto: UpdateNaturalezaCuentaDto,
  ): Promise<NaturalezaCuenta> {
    const item = await this.naturalezaCuentaModel
      .findByIdAndUpdate(id, updateNaturalezaCuentaDto, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('No se encontró la naturaleza de cuenta');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const item = await this.naturalezaCuentaModel.findByIdAndDelete(id);

    if (!item) {
      throw new NotFoundException('No se encontró la naturaleza de cuenta');
    }
  }
}
