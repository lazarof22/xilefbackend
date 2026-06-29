import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTasaCambioDto } from './dto/create-tasa-cambio.dto';
import { UpdateTasaCambioDto } from './dto/update-tasa-cambio.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TasaCambio } from './schema/tasa-cambio.schema';
import { Model, Types } from 'mongoose';
import { TipoTasa, ConversionResult } from './types/tasa-cambio.types';

export function convertirMonto(monto: number, tasa: number): number {
  return Number((monto * tasa).toFixed(2));
}

@Injectable()
export class TasaCambioService {
  constructor(
    @InjectModel(TasaCambio.name)
    private tasaCambioModel: Model<TasaCambio>,
  ) {}

  async create(createTasaCambioDto: CreateTasaCambioDto): Promise<TasaCambio> {
    const nuevaTasa = new this.tasaCambioModel({
      ...createTasaCambioDto,
      monedaOrigen: new Types.ObjectId(createTasaCambioDto.monedaOrigen),
      monedaDestino: new Types.ObjectId(createTasaCambioDto.monedaDestino),
    });
    return nuevaTasa.save();
  }

  async findAll(): Promise<TasaCambio[]> {
    return this.tasaCambioModel
      .find()
      .populate('monedaOrigen monedaDestino')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<TasaCambio> {
    const tasa = await this.tasaCambioModel
      .findById(id)
      .populate('monedaOrigen monedaDestino')
      .exec();
    if (!tasa) {
      throw new NotFoundException('No se encontró la tasa de cambio');
    }
    return tasa;
  }

  async update(
    id: string,
    updateTasaCambioDto: UpdateTasaCambioDto,
  ): Promise<TasaCambio> {
    const { monedaOrigen, monedaDestino, ...rest } = updateTasaCambioDto;
    const updateData: Record<string, unknown> = { ...rest };
    if (monedaOrigen) {
      updateData.monedaOrigen = new Types.ObjectId(monedaOrigen);
    }
    if (monedaDestino) {
      updateData.monedaDestino = new Types.ObjectId(monedaDestino);
    }
    const update = await this.tasaCambioModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!update) {
      throw new NotFoundException('No se encontró la tasa de cambio');
    }
    return update;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.tasaCambioModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('No se encontró la tasa de cambio');
    }
  }

  async getVigente(
    monedaOrigen: string,
    monedaDestino: string,
    tipo?: TipoTasa,
  ): Promise<TasaCambio | null> {
    const filter: Record<string, unknown> = {
      monedaOrigen: new Types.ObjectId(monedaOrigen),
      monedaDestino: new Types.ObjectId(monedaDestino),
    };
    if (tipo) {
      filter.tipo = tipo;
    }
    return this.tasaCambioModel
      .findOne(filter)
      .sort({ fecha: -1 })
      .populate('monedaOrigen monedaDestino')
      .exec();
  }

  async convertir(
    monto: number,
    monedaOrigen: string,
    monedaDestino: string,
    tipo?: TipoTasa,
  ): Promise<ConversionResult> {
    let tasaDoc = await this.getVigente(monedaOrigen, monedaDestino, tipo);

    if (!tasaDoc) {
      // Try inverse pair
      tasaDoc = await this.getVigente(monedaDestino, monedaOrigen, tipo);
      if (!tasaDoc) {
        throw new NotFoundException(
          'No se encontró una tasa de cambio vigente para el par solicitado',
        );
      }
      const tasa = Number((1 / tasaDoc.tasa).toFixed(6));
      return {
        montoConvertido: convertirMonto(monto, tasa),
        tasa,
        fechaTasa: tasaDoc.fecha,
        monedaOrigen,
        monedaDestino,
      };
    }

    return {
      montoConvertido: convertirMonto(monto, tasaDoc.tasa),
      tasa: tasaDoc.tasa,
      fechaTasa: tasaDoc.fecha,
      monedaOrigen,
      monedaDestino,
    };
  }

  async getHistorico(
    monedaOrigen: string,
    monedaDestino: string,
    hasta?: string,
    tipo?: TipoTasa,
  ): Promise<TasaCambio[]> {
    const filter: Record<string, unknown> = {
      monedaOrigen: new Types.ObjectId(monedaOrigen),
      monedaDestino: new Types.ObjectId(monedaDestino),
    };
    if (tipo) {
      filter.tipo = tipo;
    }
    if (hasta) {
      filter.fecha = { $lte: new Date(hasta) } as unknown;
    }
    return this.tasaCambioModel
      .find(filter)
      .sort({ fecha: -1 })
      .populate('monedaOrigen monedaDestino')
      .exec();
  }
}
