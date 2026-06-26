import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';
import { UpdateConciliacionDto } from './dto/update-conciliacion.dto';
import { Conciliacion, ConciliacionDocument } from './schema/conciliacion.schema';
import { EstadoConciliacion } from './types/conciliacion.types';

@Injectable()
export class ConciliacionService {
  constructor(@InjectModel(Conciliacion.name) private conciliacionModel: Model<ConciliacionDocument>) {}

  async create(createDto: CreateConciliacionDto): Promise<Conciliacion> {
    const existente = await this.conciliacionModel.findOne({ codigo: createDto.codigo }).exec();
    if (existente) throw new BadRequestException('Ya existe una conciliación con ese código');

    const [mes, anio] = createDto.periodo.split('-');
    const fechaInicio = new Date(parseInt(anio), parseInt(mes) - 1, 1);
    const fechaFin = new Date(parseInt(anio), parseInt(mes), 0);

    const created = new this.conciliacionModel({
      ...createDto,
      diferencia: createDto.saldoBanco - createDto.saldoLibros,
      fechaInicio,
      fechaFin,
    });
    return created.save();
  }

  async findAll(): Promise<Conciliacion[]> {
    return this.conciliacionModel.find().populate('cuentaBancaria').sort({ fechaFin: -1 }).exec();
  }

  async findOne(id: string): Promise<Conciliacion> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conciliación no encontrada');
    const doc = await this.conciliacionModel.findById(id).populate('cuentaBancaria').exec();
    if (!doc) throw new NotFoundException('Conciliación no encontrada');
    return doc;
  }

  async update(id: string, updateDto: UpdateConciliacionDto): Promise<Conciliacion> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conciliación no encontrada');
    const data: any = { ...updateDto };
    if (updateDto.saldoBanco !== undefined && updateDto.saldoLibros !== undefined) {
      data.diferencia = updateDto.saldoBanco - updateDto.saldoLibros;
    } else if (updateDto.saldoBanco !== undefined) {
      const actual = await this.conciliacionModel.findById(id).exec();
      data.diferencia = updateDto.saldoBanco - (actual?.saldoLibros ?? 0);
    } else if (updateDto.saldoLibros !== undefined) {
      const actual = await this.conciliacionModel.findById(id).exec();
      data.diferencia = (actual?.saldoBanco ?? 0) - updateDto.saldoLibros;
    }
    const updated = await this.conciliacionModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Conciliación no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conciliación no encontrada');
    const removed = await this.conciliacionModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Conciliación no encontrada');
    return { deleted: true };
  }

  async procesar(id: string): Promise<Conciliacion> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conciliación no encontrada');
    const conciliacion = await this.conciliacionModel.findById(id).exec();
    if (!conciliacion) throw new NotFoundException('Conciliación no encontrada');

    conciliacion.diferencia = conciliacion.saldoBanco - conciliacion.saldoLibros;
    conciliacion.estado = conciliacion.diferencia === 0
      ? EstadoConciliacion.CONCILIADA
      : EstadoConciliacion.DIFERENCIA;

    return conciliacion.save();
  }

  async getPendientes(): Promise<Conciliacion[]> {
    return this.conciliacionModel.find({
      estado: { $in: [EstadoConciliacion.PENDIENTE, EstadoConciliacion.EN_PROCESO] },
    }).populate('cuentaBancaria').sort({ fechaFin: -1 }).exec();
  }
}
