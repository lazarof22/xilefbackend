import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationClienteDto, PaginatedResponse } from './dto/pagination-cliente.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schemas/cliente.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClienteService {

  constructor(@InjectModel(Cliente.name)private clienteModel:Model<Cliente>){
    
  }


  //Crear un cliente
  async create(
    createClienteDto: CreateClienteDto,
  ): Promise<Cliente> {
    const existCliente = await this.clienteModel.findOne({
      id_cliente: createClienteDto.id_cliente,
    });

    if (existCliente) {
      throw new BadRequestException('Ya existe el cliente');
    }
    const nuevoCliente = new this.clienteModel(createClienteDto);
    return nuevoCliente.save();
  }



  //Buscar todos los clientes
  async findAll(paginationDto?: PaginationClienteDto): Promise<PaginatedResponse<Cliente> | Cliente[]> {
    // Si no hay parámetros de paginación, retornar todas las clientes (para compatibilidad)
    if (!paginationDto) {
      return this.clienteModel
        .find()
        .sort({ createdAt: -1 })
        .exec();
    }

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.clienteModel
        .find()
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.clienteModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }



  // Buscar un cliente
  async findOne(id:string): Promise<Cliente> {
  const cli = await this.clienteModel.findById(id).exec();
  if (!cli){
    throw new NotFoundException('No se encontró el cliente');
  }
  return cli;
 }


 //Actualizar un cliente
  async update( id: string, UpdateClienteDto: UpdateClienteDto): Promise<Cliente> {
  const updatecli = await this.clienteModel.findByIdAndUpdate(id, UpdateClienteDto, {new :true}).exec();

  if (!updatecli) {
    throw new NotFoundException('No se encontró el cliente');
  }
  return updatecli;
}

//Eliminar un cliente

 async remove(id: string): Promise<void>{
  const deletecli = await this.clienteModel.findByIdAndDelete(id);

  if (!deletecli) {
    throw new NotFoundException('No se encontró el cliente');
  }
}
}
