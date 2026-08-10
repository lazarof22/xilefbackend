import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FormaPago } from './schema/forma-pago.schema';
import { Model } from 'mongoose';

@Injectable()
export class FormaPagoService {
  constructor(
    @InjectModel(FormaPago.name) private formaPagoModel: Model<FormaPago>,
  ) {}

  async create(createFormaPagoDto: CreateFormaPagoDto): Promise<FormaPago> {
    const exist = await this.formaPagoModel.findOne({
      nombre: createFormaPagoDto.nombre,
    });

    if (exist) {
      throw new BadRequestException('Ya existe la forma de pago');
    }
    const nuevo = new this.formaPagoModel(createFormaPagoDto);
    return nuevo.save();
  }

  async findAll(): Promise<FormaPago[]> {
    return this.formaPagoModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<FormaPago> {
    const item = await this.formaPagoModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('No se encontró la forma de pago');
    }
    return item;
  }

  async update(
    id: string,
    updateFormaPagoDto: UpdateFormaPagoDto,
  ): Promise<FormaPago> {
    const item = await this.formaPagoModel
      .findByIdAndUpdate(id, updateFormaPagoDto, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('No se encontró la forma de pago');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const item = await this.formaPagoModel.findByIdAndDelete(id);

    if (!item) {
      throw new NotFoundException('No se encontró la forma de pago');
    }
  }
}
