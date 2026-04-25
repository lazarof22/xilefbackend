import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateKardexDto } from './dto/create-kardex.dto';
import { UpdateKardexDto } from './dto/update-kardex.dto';
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
  ): Promise<Kardex> {
    const { productoId, tipo, cantidad, motivo } = createKardexDto;

    if (!Types.ObjectId.isValid(productoId)) {
      throw new BadRequestException('El ID del producto no es válido');
    }
    const producto = await this.productoModel.findById(productoId);

    if (!producto) {
      throw new NotFoundException('No se encontró el producto');
    }

    if (cantidad <= 0) {
    throw new BadRequestException('La cantidad debe ser mayor a 0');
  }

    if (tipo === KardexTipo.SALIDA && producto.stock_inicial < cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    const nuevoStock = tipo === KardexTipo.ENTRADA ? producto.stock_inicial + cantidad : producto.stock_inicial - cantidad;

    const [productoAct, kardexCreado] = await Promise.all([
      this.productoModel.findByIdAndUpdate(productoId, { stock_inicial: nuevoStock }, { new: true }),
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
  async findAll(): Promise<Kardex[]> {
    return this.kardexModel
      .find()
      .populate({ path: 'productoId', select: 'nombre_producto stock_inicial' })
      .sort({ createdAt: -1 })
      .exec();
  }

  //Buscar todos los kardex de tipo salida
  async findAllSalidas(): Promise<Kardex[]> {
    return this.kardexModel
      .find({ tipo: KardexTipo.SALIDA })
      .populate({ path: 'productoId', select: 'nombre_producto stock_inicial' })
      .sort({ createdAt: -1 })
      .exec();
  }

  //Buscar un solo kardex
  async findOne(id: string): Promise<Kardex> {
    const kar = await this.kardexModel
      .findById(id)
      .populate({ path: 'productoId', select: 'nombre_producto stock_inicial' })
      .exec();

    if (!kar) {
      throw new NotFoundException('No se encontró el kardex');
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

  async remove(id: string): Promise<Kardex | { message: string }> {
    const deletekar = await this.kardexModel.findByIdAndDelete(id);

    if (!deletekar) {
      return { message: "El kardex no existe" }
    }
    return { message: "El kardex se elimino correctamente" };
  }
}
