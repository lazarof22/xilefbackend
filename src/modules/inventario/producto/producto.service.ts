import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Producto } from './schemas/producto.schema';
import { Model, Types } from 'mongoose';
import { Estado } from '../../nomencladores/estado/schema/estado.schema';
import { Categoria } from '../../nomencladores/categoria/schema/categoria.schema';


@Injectable()
export class ProductoService {
  constructor(@InjectModel(Producto.name) private productoModel: Model<Producto>,
    @InjectModel(Estado.name) private estadoModel: Model<Estado>,
    @InjectModel(Categoria.name) private categoriaModel: Model<Categoria>,) {

  }


  //Crear un producto
  async create(
    createProductoDto: CreateProductoDto,
  ): Promise<Producto> {
    const { codigo_producto, nombre_producto, categoria_producto, precio_compra, precio_venta, stock_inicial, stock_minimo, estado } = createProductoDto;

    // Validar que el producto no exista
    const existProducto = await this.productoModel.findOne({
      codigo_producto,
    });

    if (existProducto) {
      throw new BadRequestException('Ya existe el producto');
    }

    if (!Types.ObjectId.isValid(estado)) {
      throw new BadRequestException('El ID del estado no es válido');
    }
    const estadoExist = await this.estadoModel.findById(estado);
    if (!estadoExist) {
      throw new NotFoundException('El estado no existe');
    }

    if (!Types.ObjectId.isValid(categoria_producto)) {
      throw new BadRequestException('El ID de la categoría no es válido');
    }
    const categoriaExist = await this.categoriaModel.findById(categoria_producto);
    if (!categoriaExist) {
      throw new NotFoundException('La categoría no existe');
    }

    // Crear el producto
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
  async findOne(id: string): Promise<Producto> {
    const pro = await this.productoModel.findById(id).exec();
    if (!pro) {
      throw new NotFoundException('No se encontró el producto');
    }
    return pro;
  }


  //Actualizar un producto
  async update(id: string, UpdateProductoDto: UpdateProductoDto): Promise<Producto> {
    const updatepro = await this.productoModel.findByIdAndUpdate(id, UpdateProductoDto, { new: true }).exec();

    if (!updatepro) {
      throw new NotFoundException('No se encontró el producto');
    }
    return updatepro;
  }

  //Eliminar un producto

  async remove(id: string): Promise<void> {
    const deletepro = await this.productoModel.findByIdAndDelete(id);

    if (!deletepro) {
      throw new NotFoundException('No se encontró el producto');
    }
  }
}
