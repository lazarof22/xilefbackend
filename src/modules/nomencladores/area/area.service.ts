import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Area } from './schema/area.schema';
import { Model } from 'mongoose';

@Injectable()
export class AreaService {
  constructor(@InjectModel(Area.name) private areaModel: Model<Area>) {

  }


  //Crear un area
  async create(
    createAreaDto: CreateAreaDto,
  ): Promise<Area> {
    const existArea = await this.areaModel.findOne({
      estado: createAreaDto.nombre_area,
    });

    if (existArea) {
      throw new BadRequestException('Ya existe el area');
    }
    const nuevaArea = new this.areaModel(createAreaDto);
    return nuevaArea.save();
  }


  //Buscar todas las areas
  async findAll(): Promise<Area[]> {
    return this.areaModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }


  // Buscar un area
  async findOne(id: string): Promise<Area> {
    const area = await this.areaModel.findById(id).exec();
    if (!area) {
      throw new NotFoundException('No se encontró el area');
    }
    return area;
  }



  //Actualizar un area
  async update(id: string, updateAreaDto: UpdateAreaDto): Promise<Area> {
    const updatea = await this.areaModel.findByIdAndUpdate(id, updateAreaDto, { new: true }).exec();

    if (!updatea) {
      throw new NotFoundException('No se encontró el area');
    }
    return updatea;
  }



  //Eliminar un area

  async remove(id: string): Promise<void> {
    const deletea = await this.areaModel.findByIdAndDelete(id);

    if (!deletea) {
      throw new NotFoundException('No se encontró el area');
    }
  }
}
