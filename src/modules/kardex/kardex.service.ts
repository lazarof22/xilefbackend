import { Injectable } from '@nestjs/common';
import { CreateKardexDto } from './dto/create-kardex.dto';
import { UpdateKardexDto } from './dto/update-kardex.dto';
import { PaginationKardexDto, PaginatedResponse } from './dto/pagination-kardex.dto';
import { Kardex, KardexTipo } from './schema/kardex.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Producto } from '../producto/schemas/producto.schema';

@Injectable()
export class KardexService {
  constructor(@InjectModel(Kardex.name) private kardexModel: Model<Kardex>, @InjectModel(Producto.name)
  private productoModel: Model<Producto>,) {

  }

  //Crear un kardex y actualizar el stock del producto
  async create(
  createKardexDto: CreateKardexDto,
): Promise<Kardex | { message: string }> {
  const { productoId, tipo, cantidad, motivo } = createKardexDto;

  const producto = await this.productoModel.findById(productoId);

  if (!producto) {
    return { message: 'Producto no encontrado' };
  }

  if(tipo === KardexTipo.SALIDA && producto.stock_inicial < cantidad){
    return { message: 'Stock insuficiente' };
  }

  const nuevoStock = tipo === KardexTipo.ENTRADA ? producto.stock_inicial + cantidad : producto.stock_inicial - cantidad;

  const [productoAct, kardexCreado] = await Promise.all([
    this.productoModel.findByIdAndUpdate(productoId, {stock_inicial: nuevoStock}, {new: true}),
    this.kardexModel.create({
      productoId: new Types.ObjectId(productoId),
      tipo,
      cantidad,
      motivo
    })
  ]);

  return kardexCreado;
}



  //Buscar todos los kardex
    async findAll(paginationDto?: PaginationKardexDto): Promise<PaginatedResponse<Kardex> | Kardex[]> {
      // Si no hay parámetros de paginación, retornar todas las kardex (para compatibilidad)
      if (!paginationDto) {
        return this.kardexModel
          .find()
          .populate({ path: 'productoId', select: 'nombre_producto stock_inicial' })
          .sort({ createdAt: -1 })
          .exec();
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      const [data, total] = await Promise.all([
        this.kardexModel
          .find()
          .populate({ path: 'productoId', select: 'nombre_producto stock_inicial' })
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.kardexModel.countDocuments(),
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
  

  // Buscar un kardex
    async findOne(id: string): Promise<Kardex | { message: string }> {
    const kar = await this.kardexModel
      .findById(id)
      .populate({ path: 'productoId', select: 'nombre_producto stock_inicial' })
      .exec();

    if (!kar) {
      return { message: 'No existe el kardex' };
    }

    return kar;
  }



  //Actualizar un kardex
      async update(id: string, updateKardexDto: UpdateKardexDto): Promise<Kardex | { message: string }> {
    const { cantidad: nuevaCantidad } = updateKardexDto;

    
    const kardexExistente = await this.kardexModel.findById(id);
    if (!kardexExistente) {
      return { message: 'El kardex no existe' };
    }

    const producto = await this.productoModel.findById(kardexExistente.productoId);
    if (!producto) {
      return { message: 'Producto no encontrado' };
    }

    const nuevoStock = kardexExistente.tipo === KardexTipo.ENTRADA ? producto.stock_inicial + nuevaCantidad : producto.stock_inicial - nuevaCantidad;

    if (nuevoStock < 0) {
      return { message: 'Stock insuficiente para la actualización' };
    }

    const [productoActualizado, kardexActualizado] = await Promise.all([
      this.productoModel.findByIdAndUpdate(kardexExistente.productoId, { stock_inicial: nuevoStock }, { new: true }),
      this.kardexModel.findByIdAndUpdate(id, { cantidad: nuevaCantidad }, { new: true })
    ]);
    if (!kardexActualizado) {
      return { message: 'Error al actualizar el kardex' };
    }

    return kardexActualizado;
  }



  //Eliminar un kardex
  
   async remove(id: string): Promise<Kardex| {message: string}>{
    const deletekar = await this.kardexModel.findByIdAndDelete(id);
  
    if (!deletekar) {
      return { message:"El kardex no existe"}
    }
    return { message:"El kardex se elimino correctamente"};
  }
}
