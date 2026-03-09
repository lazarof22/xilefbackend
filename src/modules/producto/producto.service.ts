import { Injectable } from '@nestjs/common';
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
    ): Promise<Producto | { message: string }> {
      const existProducto = await this.productoModel.findOne({
        codigo_producto: createProductoDto.codigo_producto,
      });
  
      if (existProducto) {
        return { message: 'Ya existe el producto' };
      }
      const nuevoCliente = new this.productoModel(createProductoDto);
      nuevoCliente.save();
      return { message: 'El producto se creo exitosamente' };
    }
  
  
  
    //Buscar todos los productos
    async findAll(): Promise<Producto[] | { message: string }> {
      return this.productoModel.find();
    }
  
  
  
    // Buscar un producto
    async findOne(id:string): Promise<Producto | { message: string}> {
    const pro = await this.productoModel.findById(id).exec();
    if (!pro){
      return {message:'No existe el producto'}
    }
    return pro;
   }
  
  
   //Actualizar un producto
    async update( id: string, UpdateProductoDto: UpdateProductoDto): Promise<Producto | { message: string}> {
    const updatepro = await this.productoModel.findByIdAndUpdate(id, UpdateProductoDto, {new :true}).exec();
  
    if (!updatepro) {
      return{ message: `El producto no existe`}
    }
    return updatepro;
  }
  
  //Eliminar un producto
  
   async remove(id: string): Promise<Producto| {message: string}>{
    const deletepro = await this.productoModel.findByIdAndDelete(id);
  
    if (!deletepro) {
      return { message:"El producto no existe"}
    }
    return { message:"El producto se elimino correctamente"};
  }
}
