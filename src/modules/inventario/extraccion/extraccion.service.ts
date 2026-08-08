import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateExtraccionDto } from './dto/create-extraccion.dto';
import { Extraccion, ExtraccionDocument } from './schema/extraccion.schema';

@Injectable()
export class ExtraccionService {
  constructor(
    @InjectModel(Extraccion.name)
    private extraccionModel: Model<ExtraccionDocument>,
  ) {}

  async create(dto: CreateExtraccionDto): Promise<Extraccion> {
    if (dto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor que cero');
    }

    const extraccion = new this.extraccionModel({
      monto: dto.monto,
      causa: dto.causa,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      responsable: dto.responsable,
    });

    return extraccion.save();
  }

  async findAll(): Promise<Extraccion[]> {
    return this.extraccionModel.find().sort({ fecha: -1 }).exec();
  }

  async findOne(id: string): Promise<Extraccion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Extracción no encontrada');
    const doc = await this.extraccionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Extracción no encontrada');
    return doc;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Extracción no encontrada');
    const removed = await this.extraccionModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Extracción no encontrada');
    return { deleted: true };
  }
}
