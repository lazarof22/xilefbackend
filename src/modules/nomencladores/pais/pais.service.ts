import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaiDto } from './dto/create-pai.dto';
import { UpdatePaiDto } from './dto/update-pai.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pais } from './schema/pais.schema';

@Injectable()
export class PaisService {
  constructor(@InjectModel(Pais.name) private paisModel: Model<Pais>) {

  }


  //Crear un pais
  async create(
    createPaiDto: CreatePaiDto,
  ): Promise<Pais> {
    const existP = await this.paisModel.findOne({
      nombrePais: createPaiDto.nombrePais,
    });

    if (existP) {
      throw new BadRequestException('Ya existe el pais');
    }
    const nuevoMoneda = new this.paisModel(createPaiDto);
    return nuevoMoneda.save();
  }


  //Buscar todos los paises
  async findAll(): Promise<Pais[]> {
    return this.paisModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }


  // Buscar un pais
  async findOne(id: string): Promise<Pais> {
    const pais = await this.paisModel.findById(id).exec();
    if (!pais) {
      throw new NotFoundException('No se encontró el pais');
    }
    return pais;
  }

  //Actualizar un pais
  async update(id: string, UpdateMonedaDto: UpdatePaiDto): Promise<Pais> {
    const updatep = await this.paisModel.findByIdAndUpdate(id, UpdateMonedaDto, { new: true }).exec();

    if (!updatep) {
      throw new NotFoundException('No se encontró el pais');
    }
    return updatep;
  }

  //Eliminar un pais

  async remove(id: string): Promise<void> {
    const deletep = await this.paisModel.findByIdAndDelete(id);

    if (!deletep) {
      throw new NotFoundException('No se encontró el país');
    }
  }
}
