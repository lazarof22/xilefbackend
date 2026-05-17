import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTasaDepreciacionDto } from './dto/create-tasa_depreciacion.dto';
import { UpdateTasaDepreciacionDto } from './dto/update-tasa_depreciacion.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tasa_Depreciacion } from './schema/tasa_depresiacion.schema';
import { Model } from 'mongoose';

@Injectable()
export class TasaDepreciacionService {
  constructor(@InjectModel(Tasa_Depreciacion.name)private tasaModel:Model<Tasa_Depreciacion>){
        
      } 
  
  
    //Crear una tasa de depreciacion
      async create(
        createTasaDepreciacionDto: CreateTasaDepreciacionDto,
      ): Promise<Tasa_Depreciacion> {
        const existTasa = await this.tasaModel.findOne({
          tasa_depreciacion: createTasaDepreciacionDto.tasa_depreciacion,
        });
    
        if (existTasa) {
          throw new BadRequestException('Ya existe la tasa de depreciacion');
        }
        const nuevaTasa = new this.tasaModel(createTasaDepreciacionDto);
        return nuevaTasa.save();
      }
  
  
    //Buscar todas las tasas de depreciacion
      async findAll(): Promise<Tasa_Depreciacion[]> {
        return this.tasaModel
          .find()
          .sort({ createdAt: -1 })
          .exec();
      }
    
  
    // Buscar una tasa
      async findOne(id:string): Promise<Tasa_Depreciacion> {
      const tasa = await this.tasaModel.findById(id).exec();
      if (!tasa){
        throw new NotFoundException('No se encontró la tasa de depreciacion');
      }
      return tasa;
     }
  
  
  
     //Actualizar una tasa
      async update( id: string, updateTasaDepreciacionDto: UpdateTasaDepreciacionDto): Promise<Tasa_Depreciacion> {
      const updatetasa = await this.tasaModel.findByIdAndUpdate(id, updateTasaDepreciacionDto, {new :true}).exec();
    
      if (!updatetasa) {
        throw new NotFoundException('No se encontró la tasa de depreciacion');
      }
      return updatetasa;
    }
  
  
  
    //Eliminar una tasa
    
     async remove(id: string): Promise<void>{
      const deletetasa = await this.tasaModel.findByIdAndDelete(id);
    
      if (!deletetasa) {
        throw new NotFoundException('No se encontró la tasa de depreciacion');
      }
    }
}
