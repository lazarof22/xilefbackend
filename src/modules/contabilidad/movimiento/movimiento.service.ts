import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import {
  Movimiento,
  MovimientoDocument,
  TipoMovimiento,
} from './schema/movimiento.schema';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectModel(Movimiento.name)
    private movimientoModel: Model<MovimientoDocument>,
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    const created = new this.movimientoModel(createMovimientoDto);
    return created.save();
  }

  async findAll(): Promise<Movimiento[]> {
    return this.movimientoModel
      .find()
      .populate('activoFijo')
      .populate('areaOrigen')
      .populate('areaDestino')
      .populate('estadoAnterior')
      .populate('estadoNuevo')
      .populate('proveedorReparacion')
      .sort({ fechaMovimiento: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Movimiento> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Movimiento no encontrado');
    const doc = await this.movimientoModel
      .findById(id)
      .populate('activoFijo')
      .populate('areaOrigen')
      .populate('areaDestino')
      .populate('estadoAnterior')
      .populate('estadoNuevo')
      .populate('proveedorReparacion')
      .exec();
    if (!doc) throw new NotFoundException('Movimiento no encontrado');
    return doc;
  }

  async findByActivo(activoId: string): Promise<Movimiento[]> {
    if (!isValidObjectId(activoId))
      throw new NotFoundException('Activo no válido');
    return this.movimientoModel
      .find({ activoFijo: activoId })
      .populate('areaOrigen')
      .populate('areaDestino')
      .populate('estadoAnterior')
      .populate('estadoNuevo')
      .sort({ fechaMovimiento: -1 })
      .exec();
  }

  async update(
    id: string,
    updateMovimientoDto: UpdateMovimientoDto,
  ): Promise<Movimiento> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Movimiento no encontrado');
    const updated = await this.movimientoModel
      .findByIdAndUpdate(id, updateMovimientoDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Movimiento no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Movimiento no encontrado');
    const removed = await this.movimientoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Movimiento no encontrado');
    return { deleted: true };
  }

  getTiposMovimiento(): string[] {
    return Object.values(TipoMovimiento);
  }
}
