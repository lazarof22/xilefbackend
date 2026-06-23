import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCargoEmpleadoDto } from './dto/create-cargo_empleado.dto';
import { UpdateCargoEmpleadoDto } from './dto/update-cargo_empleado.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CargoEmpleado } from './schema/cargo_empleado.schema';
import { Model, Types } from 'mongoose';
import { normalizeName } from '../shared/nomenclador-utils';

@Injectable()
export class CargoEmpleadoService {
  constructor(@InjectModel(CargoEmpleado.name) private cargoModel: Model<CargoEmpleado>) {

  }

  async findOrCreate(nombre: string): Promise<Types.ObjectId> {
    const normalized = normalizeName(nombre);
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let doc = await this.cargoModel.findOne({ nombre_cargo: { $regex: new RegExp('^' + escaped + '$', 'i') } }).exec();
    if (!doc) {
      doc = await this.cargoModel.create({ nombre_cargo: normalized });
    }
    return doc._id as Types.ObjectId;
  }

  //Crear una cargo
  async create(
    createCargoEmpleadoDto: CreateCargoEmpleadoDto,
  ): Promise<CargoEmpleado> {
    const existCargo = await this.cargoModel.findOne({
      estado: createCargoEmpleadoDto.nombre_cargo,
    });

    if (existCargo) {
      throw new BadRequestException('Ya existe el cargo');
    }
    const nuevoCargo = new this.cargoModel(createCargoEmpleadoDto);
    return nuevoCargo.save();
  }


  //Buscar todas los cargos
  async findAll(): Promise<CargoEmpleado[]> {
    return this.cargoModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }


  // Buscar un cargo
  async findOne(id: string): Promise<CargoEmpleado> {
    const car = await this.cargoModel.findById(id).exec();
    if (!car) {
      throw new NotFoundException('No se encontró el cargo');
    }
    return car;
  }



  //Actualizar un cargo
  async update(id: string, updateCargoEmpleadoDto: UpdateCargoEmpleadoDto): Promise<CargoEmpleado> {
    const updatecargo = await this.cargoModel.findByIdAndUpdate(id, updateCargoEmpleadoDto, { new: true }).exec();

    if (!updatecargo) {
      throw new NotFoundException('No se encontró el cargo');
    }
    return updatecargo;
  }



  //Eliminar un cargo

  async remove(id: string): Promise<void> {
    const deletecargo = await this.cargoModel.findByIdAndDelete(id);

    if (!deletecargo) {
      throw new NotFoundException('No se encontró el cargo');
    }
  }
}
