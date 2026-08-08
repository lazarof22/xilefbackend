import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Banco } from './schema/banco.schema';
import { Model } from 'mongoose';

@Injectable()
export class BancoService {
   constructor(@InjectModel(Banco.name) private bancoModel: Model<Banco>) {
  
    }
  
  
    //Crear un area
    async create(
      createBancoDto: CreateBancoDto,
    ): Promise<Banco> {
      const existBanco = await this.bancoModel.findOne({
        estado: createBancoDto.nombreBanco,
      });
  
      if (existBanco) {
        throw new BadRequestException('Ya existe el banco');
      }
      const nuevoBanco = new this.bancoModel(createBancoDto);
      return nuevoBanco.save();
    }
  
  
    //Buscar todas los bancos
    async findAll(): Promise<Banco[]> {
      return this.bancoModel
        .find()
        .sort({ createdAt: -1 })
        .exec();
    }
  
  
    // Buscar un banco
    async findOne(id: string): Promise<Banco> {
      const banco = await this.bancoModel.findById(id).exec();
      if (!banco) {
        throw new NotFoundException('No se encontró el banco');
      }
      return banco;
    }
  
  
  
    //Actualizar un banco
    async update(id: string, updateBancoDto: UpdateBancoDto): Promise<Banco> {
      const updateb = await this.bancoModel.findByIdAndUpdate(id, updateBancoDto, { new: true }).exec();
  
      if (!updateb) {
        throw new NotFoundException('No se encontró el banco');
      }
      return updateb;
    }
  
  
  
    //Eliminar un banco
  
    async remove(id: string): Promise<void> {
      const deleteb = await this.bancoModel.findByIdAndDelete(id);
  
      if (!deleteb) {
        throw new NotFoundException('No se encontró el banco');
      }
    }
}
