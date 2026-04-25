import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Moneda } from './schema/moneda.schem';
import { Model } from 'mongoose';

@Injectable()
export class MonedaService {

  constructor(@InjectModel(Moneda.name)private monedaModel:Model<Moneda>){
      
    } 


  //Crear una moneda
    async create(
      createMonedaDto: CreateMonedaDto,
    ): Promise<Moneda> {
      const existMoneda = await this.monedaModel.findOne({
        tipo_moneda: createMonedaDto.tipo_moneda,
      });
  
      if (existMoneda) {
        throw new BadRequestException('Ya existe la moneda');
      }
      const nuevoMoneda = new this.monedaModel(createMonedaDto);
      return nuevoMoneda.save();
    }


  //Buscar todas las monedas
    async findAll(): Promise<Moneda[]> {
      return this.monedaModel
        .find()
        .sort({ createdAt: -1 })
        .exec();
    }
  

  // Buscar una moneda
    async findOne(id:string): Promise<Moneda> {
    const mon = await this.monedaModel.findById(id).exec();
    if (!mon){
      throw new NotFoundException('No se encontró la moneda');
    }
    return mon;
   }



   //Actualizar una moneda
    async update( id: string, UpdateMonedaDto: UpdateMonedaDto): Promise<Moneda> {
    const updatemon = await this.monedaModel.findByIdAndUpdate(id, UpdateMonedaDto, {new :true}).exec();
  
    if (!updatemon) {
      throw new NotFoundException('No se encontró la moneda');
    }
    return updatemon;
  }



  //Eliminar una moneda
  
   async remove(id: string): Promise<void>{
    const deletemon = await this.monedaModel.findByIdAndDelete(id);
  
    if (!deletemon) {
      throw new NotFoundException('No se encontró la moneda');
    }
  }
}
