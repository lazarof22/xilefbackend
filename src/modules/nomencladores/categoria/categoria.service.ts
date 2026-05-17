import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Categoria } from './schema/categoria.schema';
import { Model } from 'mongoose';

@Injectable()
export class CategoriaService {
  constructor(@InjectModel(Categoria.name)private categoriaModel:Model<Categoria>){
        
      } 
  
  
    //Crear una categoria
      async create(
        createCategoriaDto: CreateCategoriaDto,
      ): Promise<Categoria> {
        const existCat = await this.categoriaModel.findOne({
          nombre_categoria: createCategoriaDto.nombre_categoria,
        });
    
        if (existCat) {
          throw new BadRequestException('Ya existe la categoria');
        }
        const nuevaCat = new this.categoriaModel(createCategoriaDto);
        return nuevaCat.save();
      }
  
  
    //Buscar todas las categorias
      async findAll(): Promise<Categoria[]> {
        return this.categoriaModel
          .find()
          .sort({ createdAt: -1 })
          .exec();
      }
    
  
    // Buscar una categoria
      async findOne(id:string): Promise<Categoria> {
      const cat = await this.categoriaModel.findById(id).exec();
      if (!cat){
        throw new NotFoundException('No se encontró la categoria');
      }
      return cat;
     }
  
  
  
     //Actualizar una categoria
      async update( id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
      const updatecat = await this.categoriaModel.findByIdAndUpdate(id, updateCategoriaDto, {new :true}).exec();
    
      if (!updatecat) {
        throw new NotFoundException('No se encontró la categoria');
      }
      return updatecat;
    }
  
  
  
    //Eliminar una categoria
    
     async remove(id: string): Promise<void>{
      const deletecat = await this.categoriaModel.findByIdAndDelete(id);
    
      if (!deletecat) {
        throw new NotFoundException('No se encontró la categoria');
      }
    }
}
