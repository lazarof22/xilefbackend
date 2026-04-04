import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { PaginationMonedaDto, PaginatedResponse } from './dto/pagination-moneda.dto';
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
    async findAll(paginationDto?: PaginationMonedaDto): Promise<PaginatedResponse<Moneda> | Moneda[]> {
      // Si no hay parámetros de paginación, retornar todas las monedas (para compatibilidad)
      if (!paginationDto) {
        return this.monedaModel
          .find()
          .sort({ createdAt: -1 })
          .exec();
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      const [data, total] = await Promise.all([
        this.monedaModel
          .find()
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.monedaModel.countDocuments(),
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
  

  // Buscar una moneda
    async findOne(id:string): Promise<Moneda> {
    const mon = await this.monedaModel.findById(id).exec();
    if (!mon){
      throw new NotFoundException('No se encontró la moneda');
    }
    return mon;
   }



   //Actualizar una moneda
    async update( id: string, UpdateClienteDto: UpdateMonedaDto): Promise<Moneda> {
    const updatemon = await this.monedaModel.findByIdAndUpdate(id, UpdateClienteDto, {new :true}).exec();
  
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
