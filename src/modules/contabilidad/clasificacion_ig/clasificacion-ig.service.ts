import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateClasificacionIGDto } from './dto/create-clasificacion-ig.dto';
import { UpdateClasificacionIGDto } from './dto/update-clasificacion-ig.dto';
import {
  ClasificacionIG,
  ClasificacionIGDocument,
} from './schema/clasificacion-ig.schema';

@Injectable()
export class ClasificacionIGService {
  constructor(
    @InjectModel(ClasificacionIG.name)
    private clasificacionModel: Model<ClasificacionIGDocument>,
  ) {}

  async create(createDto: CreateClasificacionIGDto): Promise<ClasificacionIG> {
    const existente = await this.clasificacionModel
      .findOne({ cuentaId: createDto.cuentaId })
      .exec();
    if (existente)
      throw new BadRequestException('Esta cuenta ya está clasificada');
    const created = new this.clasificacionModel(createDto);
    return created.save();
  }

  async findAll(): Promise<ClasificacionIG[]> {
    return this.clasificacionModel.find().sort({ tipo: 1 }).exec();
  }

  async findOne(id: string): Promise<ClasificacionIG> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Clasificación no encontrada');
    const doc = await this.clasificacionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Clasificación no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateClasificacionIGDto,
  ): Promise<ClasificacionIG> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Clasificación no encontrada');
    if (updateDto.cuentaId) {
      const existente = await this.clasificacionModel
        .findOne({ cuentaId: updateDto.cuentaId, _id: { $ne: id } })
        .exec();
      if (existente)
        throw new BadRequestException('Esta cuenta ya está clasificada');
    }
    const updated = await this.clasificacionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Clasificación no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Clasificación no encontrada');
    const removed = await this.clasificacionModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Clasificación no encontrada');
    return { deleted: true };
  }
}
