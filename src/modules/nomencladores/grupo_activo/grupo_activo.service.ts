import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateGrupoActivoDto } from './dto/create-grupo_activo.dto';
import { UpdateGrupoActivoDto } from './dto/update-grupo_activo.dto';
import { GrupoActivo, GrupoActivoDocument } from './schema/grupo_activo.schema';

@Injectable()
export class GrupoActivoService {
  constructor(
    @InjectModel(GrupoActivo.name) private grupoModel: Model<GrupoActivoDocument>,
  ) {}

  async create(createDto: CreateGrupoActivoDto): Promise<GrupoActivo> {
    const existente = await this.grupoModel.findOne({ codigo: createDto.codigo }).exec();
    if (existente) {
      throw new BadRequestException('Ya existe un grupo con ese código');
    }
    const created = new this.grupoModel(createDto);
    return created.save();
  }

  async findAll(): Promise<GrupoActivo[]> {
    return this.grupoModel.find().sort({ codigo: 1 }).exec();
  }

  async findOne(id: string): Promise<GrupoActivo> {
    if (!isValidObjectId(id)) throw new NotFoundException('Grupo no encontrado');
    const doc = await this.grupoModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Grupo no encontrado');
    return doc;
  }

  async update(id: string, updateDto: UpdateGrupoActivoDto): Promise<GrupoActivo> {
    if (!isValidObjectId(id)) throw new NotFoundException('Grupo no encontrado');
    const updated = await this.grupoModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Grupo no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Grupo no encontrado');
    const removed = await this.grupoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Grupo no encontrado');
    return { deleted: true };
  }

  async getGruposActivos(): Promise<GrupoActivo[]> {
    return this.grupoModel.find({ activo: true }).sort({ codigo: 1 }).exec();
  }
}
