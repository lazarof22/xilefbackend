import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Estado } from './schema/estado.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { normalizeName } from '../shared/nomenclador-utils';

@Injectable()
export class EstadoService {
 constructor(@InjectModel(Estado.name)private estadoModel :Model<Estado>){
        
     } 

 async findOrCreate(nombre: string): Promise<Types.ObjectId> {
   const normalized = normalizeName(nombre);
   const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   let doc = await this.estadoModel.findOne({ estado: { $regex: new RegExp('^' + escaped + '$', 'i') } }).exec();
   if (!doc) {
     doc = await this.estadoModel.create({ estado: normalized });
   }
   return doc._id as Types.ObjectId;
 }
 
   //Crear una estado
     async create(
       createEstadoDto: CreateEstadoDto,
     ): Promise<Estado> {
       const existEstado = await this.estadoModel.findOne({
         estado: createEstadoDto.estado,
       });
   
       if (existEstado) {
         throw new BadRequestException('Ya existe el estado');
       }
       const nuevoEstado = new this.estadoModel(createEstadoDto);
       return nuevoEstado.save();
     }
 
 
   //Buscar todas los estados
     async findAll(): Promise<Estado[]> {
       return this.estadoModel
         .find()
         .sort({ createdAt: -1 })
         .exec();
     }
   
 
   // Buscar un estado
     async findOne(id:string): Promise<Estado> {
     const est = await this.estadoModel.findById(id).exec();
     if (!est){
       throw new NotFoundException('No se encontró el estado');
     }
     return est;
    }
 
 
 
    //Actualizar un estado
     async update( id: string, updateEstadoDto: UpdateEstadoDto): Promise<Estado> {
     const updatest = await this.estadoModel.findByIdAndUpdate(id, updateEstadoDto, {new :true}).exec();
   
     if (!updatest) {
       throw new NotFoundException('No se encontró el estado');
     }
     return updatest;
   }
 
 
 
   //Eliminar un estado
   
    async remove(id: string): Promise<void>{
     const deletest = await this.estadoModel.findByIdAndDelete(id);
   
     if (!deletest) {
       throw new NotFoundException('No se encontró el estado');
     }
   }
}
