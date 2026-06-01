import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schemas/cliente.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClienteService {

  constructor(@InjectModel(Cliente.name)private clienteModel:Model<Cliente>){
    
  }


  //Crear un cliente
  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    // Validar id_cliente
    const existClienteById = await this.clienteModel.findOne({
        id_cliente: createClienteDto.id_cliente,
    });
    if (existClienteById) {
        throw new BadRequestException('Ya existe un cliente con ese ID');
    }

    // Validar teléfono
    const existClienteByTelefono = await this.clienteModel.findOne({
        telefono_cliente: createClienteDto.telefono_cliente,
    });
    if (existClienteByTelefono) {
        throw new BadRequestException('Ya existe un cliente con ese número de teléfono');
    }

    // Validar email
    const existClienteByEmail = await this.clienteModel.findOne({
        email_cliente: createClienteDto.email_cliente,
    });
    if (existClienteByEmail) {
        throw new BadRequestException('Ya existe un cliente con ese correo electrónico');
    }

    const nuevoCliente = new this.clienteModel(createClienteDto);
    return nuevoCliente.save();
}



  //Buscar todos los clientes
  async findAll(): Promise<Cliente[]> {
    return this.clienteModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
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
