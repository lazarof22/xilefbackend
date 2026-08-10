import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateGastoIndirectoDto } from './dto/create-gasto-indirecto.dto';
import { UpdateGastoIndirectoDto } from './dto/update-gasto-indirecto.dto';
import {
  GastoIndirecto,
  GastoIndirectoDocument,
} from './schema/gasto-indirecto.schema';

@Injectable()
export class GastoIndirectoService {
  constructor(
    @InjectModel(GastoIndirecto.name)
    private gastoIndirectoModel: Model<GastoIndirectoDocument>,
  ) {}

  async create(createDto: CreateGastoIndirectoDto): Promise<GastoIndirecto> {
    const existente = await this.gastoIndirectoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente) {
      throw new BadRequestException(
        'Ya existe un gasto indirecto con ese código',
      );
    }

    const created = new this.gastoIndirectoModel({
      ...createDto,
      fechaRegistro: createDto.fechaRegistro
        ? new Date(createDto.fechaRegistro)
        : new Date(),
    });
    return created.save();
  }

  async findAll(): Promise<GastoIndirecto[]> {
    return this.gastoIndirectoModel
      .find()
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ periodo: -1, fechaRegistro: -1 })
      .exec();
  }

  async findOne(id: string): Promise<GastoIndirecto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    const doc = await this.gastoIndirectoModel
      .findById(id)
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .exec();
    if (!doc) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    return doc;
  }

  async findByCentroCosto(centroCostoId: string): Promise<GastoIndirecto[]> {
    return this.gastoIndirectoModel
      .find({ centroCosto: centroCostoId })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ periodo: -1, fechaRegistro: -1 })
      .exec();
  }

  async findByPeriodo(periodo: string): Promise<GastoIndirecto[]> {
    return this.gastoIndirectoModel
      .find({ periodo })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ fechaRegistro: -1 })
      .exec();
  }

  async findNoDistribuidos(periodo: string): Promise<GastoIndirecto[]> {
    return this.gastoIndirectoModel
      .find({ periodo, distribuido: false })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ fechaRegistro: -1 })
      .exec();
  }

  async distribuir(id: string): Promise<GastoIndirecto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    const updated = await this.gastoIndirectoModel
      .findByIdAndUpdate(id, { distribuido: true }, { new: true })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .exec();
    if (!updated) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    return updated;
  }

  async update(
    id: string,
    updateDto: UpdateGastoIndirectoDto,
  ): Promise<GastoIndirecto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    if (updateDto.codigo) {
      const existente = await this.gastoIndirectoModel
        .findOne({ codigo: updateDto.codigo, _id: { $ne: id } })
        .exec();
      if (existente) {
        throw new BadRequestException(
          'Ya existe un gasto indirecto con ese código',
        );
      }
    }

    const updateData: Record<string, unknown> = { ...updateDto };
    if (updateDto.fechaRegistro) {
      updateData.fechaRegistro = new Date(updateDto.fechaRegistro);
    }

    const updated = await this.gastoIndirectoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .exec();
    if (!updated) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    const removed = await this.gastoIndirectoModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException('Gasto indirecto no encontrado');
    }
    return { deleted: true };
  }
}
