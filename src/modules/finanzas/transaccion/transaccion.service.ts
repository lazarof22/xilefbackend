import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';
import { Transaccion, TransaccionDocument } from './schema/transaccion.schema';
import {
  TipoTransaccion,
  ResumenTransacciones,
} from './types/transaccion.types';

@Injectable()
export class TransaccionService {
  constructor(
    @InjectModel(Transaccion.name)
    private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async create(createDto: CreateTransaccionDto): Promise<Transaccion> {
    const existente = await this.transaccionModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe una transacción con ese código');
    const created = new this.transaccionModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Transaccion[]> {
    return this.transaccionModel
      .find()
      .populate('categoria')
      .populate('moneda')
      .populate('cuentaBancaria')
      .populate('cliente')
      .populate('proveedor')
      .sort({ fecha: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Transaccion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transacción no encontrada');
    const doc = await this.transaccionModel
      .findById(id)
      .populate('categoria')
      .populate('moneda')
      .populate('cuentaBancaria')
      .populate('cliente')
      .populate('proveedor')
      .exec();
    if (!doc) throw new NotFoundException('Transacción no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateTransaccionDto,
  ): Promise<Transaccion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transacción no encontrada');
    const updated = await this.transaccionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Transacción no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transacción no encontrada');
    const removed = await this.transaccionModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Transacción no encontrada');
    return { deleted: true };
  }

  async getPorPeriodo(desde: string, hasta: string): Promise<Transaccion[]> {
    return this.transaccionModel
      .find({
        fecha: { $gte: new Date(desde), $lte: new Date(hasta) },
      })
      .populate('categoria')
      .populate('moneda')
      .populate('cuentaBancaria')
      .sort({ fecha: -1 })
      .exec();
  }

  async getResumen(
    desde?: string,
    hasta?: string,
  ): Promise<ResumenTransacciones> {
    const filtro: any = {};
    if (desde && hasta)
      filtro.fecha = { $gte: new Date(desde), $lte: new Date(hasta) };

    const ingresos = await this.transaccionModel
      .aggregate([
        { $match: { ...filtro, tipo: TipoTransaccion.INGRESO } },
        {
          $group: {
            _id: null,
            total: { $sum: '$monto' },
            cantidad: { $sum: 1 },
          },
        },
      ])
      .exec();
    const egresos = await this.transaccionModel
      .aggregate([
        { $match: { ...filtro, tipo: TipoTransaccion.EGRESO } },
        {
          $group: {
            _id: null,
            total: { $sum: '$monto' },
            cantidad: { $sum: 1 },
          },
        },
      ])
      .exec();

    const totalIngresos = ingresos.length > 0 ? ingresos[0].total : 0;
    const totalEgresos = egresos.length > 0 ? egresos[0].total : 0;

    return {
      totalIngresos,
      totalEgresos,
      saldoNeto: totalIngresos - totalEgresos,
      cantidadIngresos: ingresos.length > 0 ? ingresos[0].cantidad : 0,
      cantidadEgresos: egresos.length > 0 ? egresos[0].cantidad : 0,
    };
  }

  async getFlujoEfectivo(desde: string, hasta: string): Promise<any> {
    const filtro = { fecha: { $gte: new Date(desde), $lte: new Date(hasta) } };
    const transaction = await this.transaccionModel
      .aggregate([
        { $match: filtro },
        {
          $group: {
            _id: '$tipo',
            total: { $sum: '$monto' },
            cantidad: { $sum: 1 },
          },
        },
      ])
      .exec();

    const ingresos = transaction.find((t) => t._id === 'ingreso');
    const egresos = transaction.find((t) => t._id === 'egreso');

    return {
      periodo: { desde, hasta },
      flujoOperativo: {
        ingresos: ingresos?.total ?? 0,
        egresos: egresos?.total ?? 0,
        neto: (ingresos?.total ?? 0) - (egresos?.total ?? 0),
      },
    };
  }
}
