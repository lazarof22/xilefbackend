import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa } from './schema/empresa.schema';

@Injectable()
export class EmpresaService {
  constructor(@InjectModel(Empresa.name)private empresaModel:Model<Empresa>){
     
   }
   async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
      const exist = await this.empresaModel.findOne({ nombreEmpresa: createEmpresaDto.nombreEmpresa });
      if (exist) {
        throw new BadRequestException('Ya existe la empresa');
      }
      const nueva = new this.empresaModel(createEmpresaDto);
      return nueva.save();
    }
  
    async findAll(): Promise<Empresa[]> {
      return this.empresaModel.find().sort({ createdAt: -1 }).exec();
    }
  
    async findOne(id: string): Promise<Empresa> {
      const ent = await this.empresaModel.findById(id).exec();
      if (!ent) {
        throw new NotFoundException('No se encontró la empresa');
      }
      return ent;
    }
  
    async update(id: string, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
      const updated = await this.empresaModel.findByIdAndUpdate(id, updateEmpresaDto, { new: true }).exec();
      if (!updated) {
        throw new NotFoundException('No se encontró la empresa');
      }
      return updated;
    }
  
    async remove(id: string): Promise<void> {
      const deleted = await this.empresaModel.findByIdAndDelete(id);
      if (!deleted) {
        throw new NotFoundException('No se encontró la empresa');
      }
    }
}
