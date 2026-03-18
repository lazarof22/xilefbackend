import { Injectable } from '@nestjs/common';
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
    ): Promise<Moneda | { message: string }> {
      const existMoneda = await this.monedaModel.findOne({
        tipo_moneda: createMonedaDto.tipo_moneda,
      });
  
      if (existMoneda) {
        return { message: 'Ya existe la moneda' };
      }
      const nuevoMoneda = new this.monedaModel(createMonedaDto);
      nuevoMoneda.save();
      return { message: 'La moneda se creo exitosamente' };
    }


  //Buscar todas las monedas
    async findAll(): Promise<Moneda[] | { message: string }> {
      return this.monedaModel.find();
    }
  

  // Buscar una moneda
    async findOne(id:string): Promise<Moneda | { message: string}> {
    const mon = await this.monedaModel.findById(id).exec();
    if (!mon){
      return {message:'No existe la moneda'}
    }
    return mon;
   }



   //Actualizar una moneda
    async update( id: string, UpdateClienteDto: UpdateMonedaDto): Promise<Moneda | { message: string}> {
    const updatemon = await this.monedaModel.findByIdAndUpdate(id, UpdateClienteDto, {new :true}).exec();
  
    if (!updatemon) {
      return{ message: `La moneda no existe`}
    }
    return updatemon;
  }



  //Eliminar una moneda
  
   async remove(id: string): Promise<Moneda| {message: string}>{
    const deletemon = await this.monedaModel.findByIdAndDelete(id);
  
    if (!deletemon) {
      return { message:"La moneda no existe"}
    }
    return { message:"La moneda se elimino correctamente"};
  }
}
