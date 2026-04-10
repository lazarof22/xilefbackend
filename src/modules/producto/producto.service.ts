import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Producto } from './schemas/producto.schema';
import { Model } from 'mongoose';


@Injectable()
export class ProductoService {
  constructor(@InjectModel(Producto.name)private productoModel:Model<Producto>){
      
    }
  
  
    //Crear un producto
    async create(
      createProductoDto: CreateProductoDto,
    ): Promise<Producto> {
      const existProducto = await this.productoModel.findOne({
        codigo_producto: createProductoDto.codigo_producto,
      });
  
      if (existProducto) {
        throw new BadRequestException('Ya existe el producto');
      }
      const nuevoProducto = new this.productoModel(createProductoDto);
      return nuevoProducto.save();
    }
  
  
  
    //Buscar todos los productos
    async findAll(): Promise<Producto[]> {
      return this.productoModel
        .find()
        .sort({ createdAt: -1 })
        .exec();
    }
  
  
  
    // Buscar un producto
    async findOne(id:string): Promise<Producto> {
    const pro = await this.productoModel.findById(id).exec();
    if (!pro){
      throw new NotFoundException('No se encontró el producto');
    }
    return pro;
   }
  
  
   //Actualizar un producto
    async update( id: string, UpdateProductoDto: UpdateProductoDto): Promise<Producto> {
    const updatepro = await this.productoModel.findByIdAndUpdate(id, UpdateProductoDto, {new :true}).exec();
  
    if (!updatepro) {
      throw new NotFoundException('No se encontró el producto');
    }
    return updatepro;
  }
  
  //Eliminar un producto
  
   async remove(id: string): Promise<void>{
    const deletepro = await this.productoModel.findByIdAndDelete(id);
  
    if (!deletepro) {
      throw new NotFoundException('No se encontró el producto');
    }
  }
}
