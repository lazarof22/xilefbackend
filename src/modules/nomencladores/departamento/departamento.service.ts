import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { Departamento } from './schema/departamento.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DepartamentoService {
  constructor(@InjectModel(Departamento.name) private departamentoModel: Model<Departamento>) {

  }

  //Crear una departamento
  async create(
    createDepartamentoDto: CreateDepartamentoDto,
  ): Promise<Departamento> {
    const existDep = await this.departamentoModel.findOne({
      estado: createDepartamentoDto.nombre_departamento,
    });

    if (existDep) {
      throw new BadRequestException('Ya existe el departamento');
    }
    const nuevoDep = new this.departamentoModel(createDepartamentoDto);
    return nuevoDep.save();
  }


  //Buscar todas los departamentos
  async findAll(): Promise<Departamento[]> {
    return this.departamentoModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }


  // Buscar un departamento
  async findOne(id: string): Promise<Departamento> {
    const dep = await this.departamentoModel.findById(id).exec();
    if (!dep) {
      throw new NotFoundException('No se encontró el departamento');
    }
    return dep;
  }


  //Actualizar un departamento
  async update(id: string, updateDepartamentoDto: UpdateDepartamentoDto): Promise<Departamento> {
    const updatedep = await this.departamentoModel.findByIdAndUpdate(id, updateDepartamentoDto, { new: true }).exec();

    if (!updatedep) {
      throw new NotFoundException('No se encontró el departamento');
    }
    return updatedep;
  }


  //Eliminar un departamento

  async remove(id: string): Promise<void> {
    const deletedep = await this.departamentoModel.findByIdAndDelete(id);

    if (!deletedep) {
      throw new NotFoundException('No se encontró el departamento');
    }
  }
}
