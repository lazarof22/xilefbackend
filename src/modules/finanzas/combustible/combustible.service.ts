import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { CreateCargaDto } from './dto/create-carga.dto';
import { Vehiculo, VehiculoDocument } from './schema/vehiculo.schema';
import { TarjetaCombustible, TarjetaCombustibleDocument } from './schema/tarjeta-combustible.schema';
import { CargaCombustible, CargaCombustibleDocument } from './schema/carga-combustible.schema';
import { EstadoTarjeta } from './types/combustible.types';

@Injectable()
export class CombustibleService {
  constructor(
    @InjectModel(Vehiculo.name) private vehiculoModel: Model<VehiculoDocument>,
    @InjectModel(TarjetaCombustible.name) private tarjetaModel: Model<TarjetaCombustibleDocument>,
    @InjectModel(CargaCombustible.name) private cargaModel: Model<CargaCombustibleDocument>,
  ) {}

  async createVehiculo(createDto: CreateVehiculoDto): Promise<Vehiculo> {
    const existente = await this.vehiculoModel.findOne({ codigo: createDto.codigo }).exec();
    if (existente) throw new BadRequestException('Ya existe un vehículo con ese código');
    const created = new this.vehiculoModel(createDto);
    return created.save();
  }

  async findAllVehiculos(): Promise<Vehiculo[]> {
    return this.vehiculoModel.find().sort({ codigo: 1 }).exec();
  }

  async findVehiculo(id: string): Promise<Vehiculo> {
    if (!isValidObjectId(id)) throw new NotFoundException('Vehículo no encontrado');
    const doc = await this.vehiculoModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Vehículo no encontrado');
    return doc;
  }

  async removeVehiculo(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Vehículo no encontrado');
    const removed = await this.vehiculoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Vehículo no encontrado');
    return { deleted: true };
  }

  async createTarjeta(createDto: CreateTarjetaDto): Promise<TarjetaCombustible> {
    const existente = await this.tarjetaModel.findOne({ numeroTarjeta: createDto.numeroTarjeta }).exec();
    if (existente) throw new BadRequestException('Ya existe una tarjeta con ese número');
    const created = new this.tarjetaModel(createDto);
    return created.save();
  }

  async findAllTarjetas(): Promise<TarjetaCombustible[]> {
    return this.tarjetaModel.find().populate('vehiculo').exec();
  }

  async createCarga(createDto: CreateCargaDto): Promise<CargaCombustible> {
    const existente = await this.cargaModel.findOne({ codigo: createDto.codigo }).exec();
    if (existente) throw new BadRequestException('Ya existe una carga con ese código');
    const created = new this.cargaModel(createDto);
    return created.save();
  }

  async findAllCargas(): Promise<CargaCombustible[]> {
    return this.cargaModel.find().populate('tarjeta').populate('vehiculo').sort({ fecha: -1 }).exec();
  }

  async getCargasPorVehiculo(vehiculoId: string): Promise<CargaCombustible[]> {
    return this.cargaModel.find({ vehiculo: vehiculoId }).populate('tarjeta').sort({ fecha: -1 }).exec();
  }

  async getConsumoResumen(vehiculoId?: string): Promise<any> {
    const filtro: any = {};
    if (vehiculoId) filtro.vehiculo = vehiculoId;
    return this.cargaModel.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$vehiculo',
          totalLitros: { $sum: '$litros' },
          totalMonto: { $sum: '$monto' },
          cantidadCargas: { $sum: 1 },
        },
      },
      { $sort: { totalLitros: -1 } },
    ]).exec();
  }
}
