import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './schema/venta.schema';
import { Cliente } from '../../clientes y provedores/cliente/schemas/cliente.schema';
import { Producto } from '../../inventario/producto/schemas/producto.schema';
import { Kardex } from 'src/modules/inventario/kardex/schema/kardex.schema';
import { Pago } from '../pago/schema/pago.schema';
import { ReportePlus } from '../reporte_plus/schema/reporte_plus.schema';


@Injectable()
export class VentaService {
  constructor(
    @InjectModel(Venta.name) private ventaModel: Model<Venta>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @InjectModel(Producto.name) private productoModel: Model<Producto>,
    @InjectModel(Kardex.name) private kardexModel: Model<Kardex>,
    @InjectModel('Pago') private pagoModel: Model<Pago>,
    @InjectModel(ReportePlus.name) private reportePlusModel: Model<ReportePlus>,
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

      // Crear o actualizar reporte plus de venta para el producto
      const precioUnitario = producto.precio_venta || 0;
      const totalItem = precioUnitario * item.cantidad;
      const descuentoItem = item.descuentoMonto || 0;
      const descuentoPorcentaje = createVentaDto.descuento_total > 0 ? (descuentoItem / (totalItem || 1)) * 100 : 0;

      await this.reportePlusModel.findOneAndUpdate(
        { productoId: producto._id },
        {
          $set: {
            cantidad: item.cantidad,
            stockfinal: producto.stock_inicial,
            descuento: descuentoItem,
            impuesto: createVentaDto.impuesto.toString(),
            totalPagado: totalItem - descuentoItem,
            fecha: new Date(),
          },
        },
        { upsert: true, new: true }
      );

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

  async findAll(): Promise<Venta[]> {
    return this.ventaModel
      .find()
      .populate('productos.productoId', 'nombre_producto precio')
      .populate('pago')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Venta> {
    const venta = await this.ventaModel
      .findById(id)
      .populate('productos.productoId', 'nombre_producto precio codigo')
      .populate('pago')
      .exec();

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async update(id: string, updateVentaDto: UpdateVentaDto) {
    
  }

  async remove(id: string): Promise<void> {
    const result = await this.ventaModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
  }

}

