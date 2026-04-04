import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { PaginationVentaDto, PaginatedResponse } from './dto/pagination-venta.dto';
import { Venta } from './schema/venta.schema';
import { Cliente } from '../cliente/schemas/cliente.schema';
import { Producto } from '../producto/schemas/producto.schema';


@Injectable()
export class VentaService {
  constructor(
    @InjectModel(Venta.name) private ventaModel: Model<Venta>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @InjectModel(Producto.name) private productoModel: Model<Producto>,
  ) { }

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    // Verificar cliente
    const cliente = await this.clienteModel.findById(createVentaDto.clienteId);
    if (!cliente) {
      throw new NotFoundException(`Cliente no encontrado`);
    }

    // Verificar stock y descontar
    for (const item of createVentaDto.productos) {
      const producto = await this.productoModel.findById(item.productoId);

      if (!producto) {
        throw new NotFoundException(`Producto no encontrado`);
      }

      if (producto.stock_inicial < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para ${producto.nombre_producto}`);
      }

      // Descontar stock
      producto.stock_inicial -= item.cantidad;
      await producto.save();

      // Alerta si quedó bajo del mínimo
      if (producto.stock_inicial < producto.stock_minimo) {
        console.warn(`STOCK BAJO: ${producto.nombre_producto} tiene ${producto.stock_inicial} (mín: ${producto.stock_minimo})`);
      }
    }

    // Crear venta
    const venta = new this.ventaModel({
      ...createVentaDto,
      clienteNombre: cliente.nombre_cliente,
    });

    return venta.save();
  }

  async findAll(paginationDto?: PaginationVentaDto): Promise<PaginatedResponse<Venta> | Venta[]> {
    // Si no hay parámetros de paginación, retornar todas las ventas (para compatibilidad)
    if (!paginationDto) {
      return this.ventaModel
        .find()
        .populate('clienteId', 'nombre email telefono')
        .populate('productos.productoId', 'nombre_producto precio')
        .sort({ createdAt: -1 })
        .exec();
    }

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.ventaModel
        .find()
        .populate('clienteId', 'nombre email telefono')
        .populate('productos.productoId', 'nombre precio')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.ventaModel.countDocuments(),
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

  async findOne(id: string): Promise<Venta> {
    const venta = await this.ventaModel
      .findById(id)
      .populate('clienteId', 'nombre_cliente')
      .populate('productos.productoId', 'nombre_producto precio codigo')
      .exec();

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    let clienteNombre: string | undefined;

    if (updateVentaDto.clienteId) {
      const cliente = await this.clienteModel.findById(updateVentaDto.clienteId);
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${updateVentaDto.clienteId} no encontrado`);
      }
      clienteNombre = cliente.nombre_cliente;
    }

    const updateData = clienteNombre
      ? { ...updateVentaDto, clienteNombre }
      : updateVentaDto;

    const venta = await this.ventaModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async remove(id: string): Promise<void> {
    const result = await this.ventaModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
  }


  // Métodos adicionales útiles

  async findByCliente(clienteId: string): Promise<Venta[]> {
    return this.ventaModel
      .find({ clienteId })
      .populate('productos.productoId', 'nombre precio')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByFecha(fechaInicio: Date, fechaFin: Date): Promise<Venta[]> {
    return this.ventaModel
      .find({
        createdAt: {
          $gte: fechaInicio,
          $lte: fechaFin,
        },
      })
      .populate('clienteId', 'nombre')
      .exec();
  }
}

