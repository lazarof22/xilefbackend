import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { Compra, CompraDocument, Pago } from './schema/compra.schema';
import { Producto } from '../../inventario/producto/schemas/producto.schema';
import { Kardex, KardexTipo } from '../../inventario/kardex/schema/kardex.schema';

@Injectable()
export class CompraService {
  constructor(
    @InjectModel(Compra.name) private compraModel: Model<CompraDocument>,
    @InjectModel(Producto.name) private productoModel: Model<Producto>,
    @InjectModel(Kardex.name) private kardexModel: Model<Kardex>,
  ) { }

  private normalizeRate(r?: number) {
    if (!r) return 0;
    return r > 1 ? r / 100 : r; // if user passed 5 assume 5%
  }

  private calculateRecargo(dto: CreateCompraDto) {
    const tasaCentral = this.normalizeRate(dto.tasaBancoCentral);
    const tasaInformal = this.normalizeRate(dto.tasaBancoInformal);
    const fluctuacion = this.normalizeRate(dto.fluctuacion);

    const base = (dto.subtotalCompra || 0) - (dto.descuentoTotal || 0);
    let recargo = 0;

    if (dto.modoPago === Pago.EFECTIVO) recargo += 0;
    else if (dto.modoPago === Pago.TRANSFERENCIA) recargo += base * tasaCentral;
    else if (dto.modoPago === Pago.CREDITO) recargo += base * tasaInformal;

    if (fluctuacion) recargo += base * fluctuacion;

    return Math.round((recargo + Number.EPSILON) * 100) / 100;
  }

  async create(createCompraDto: CreateCompraDto) {
    if (createCompraDto.recargo === undefined || createCompraDto.recargo === null) {
      createCompraDto.recargo = this.calculateRecargo(createCompraDto);
    }

    for (const item of createCompraDto.productos) {
      const producto = await this.productoModel.findById(item.productoId);
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${item.productoId} no encontrado`);
      }

      producto.stock_inicial += item.cantidad;
      await producto.save();

      await this.kardexModel.create({
        productoId: producto._id,
        tipo: KardexTipo.COMPRA,
        cantidad: item.cantidad,
        stock: producto.stock_inicial,
        motivo: 'Compra',
      });
    }

    const created = new this.compraModel(createCompraDto as any);
    return created.save();
  }

  async findAll() {
    return this.compraModel.find().exec();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Compra no encontrada');
    const doc = await this.compraModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Compra no encontrada');
    return doc;
  }

  async update(id: string, updateCompraDto: UpdateCompraDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Compra no encontrada');
    // if recargo is not provided but payment/ratess/amount changed, recalculate
    if (updateCompraDto.recargo === undefined || updateCompraDto.recargo === null) {
      // need base fields to compute recargo — fetch existing and merge
      const existing = await this.compraModel.findById(id).lean().exec();
      if (!existing) throw new NotFoundException('Compra no encontrada');
      const merged: any = { ...existing, ...updateCompraDto };
      const computed = this.calculateRecargo(merged as CreateCompraDto);
      (updateCompraDto as any).recargo = computed;
    }

    const updated = await this.compraModel.findByIdAndUpdate(id, updateCompraDto as any, { new: true }).exec();
    if (!updated) throw new NotFoundException('Compra no encontrada');
    return updated;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Compra no encontrada');
    const removed = await this.compraModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Compra no encontrada');
    return { deleted: true };
  }
}
