import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateOperacionFinancieraDto } from './dto/create-operacion-financiera.dto';
import { UpdateOperacionFinancieraDto } from './dto/update-operacion-financiera.dto';
import { PagarOperacionFinancieraDto } from './dto/pagar-operacion-financiera.dto';
import {
  OperacionFinanciera,
  OperacionFinancieraDocument,
} from './schema/operacion-financiera.schema';
import {
  EstadoOperacion,
  TipoOperacionFinanciera,
} from './types/operacion-financiera.types';
import {
  Transaccion,
  TransaccionDocument,
} from '../transaccion/schema/transaccion.schema';
import {
  TipoTransaccion,
  MetodoPago,
} from '../transaccion/types/transaccion.types';

@Injectable()
export class OperacionFinancieraService {
  constructor(
    @InjectModel(OperacionFinanciera.name)
    private operacionModel: Model<OperacionFinancieraDocument>,
    @InjectModel(Transaccion.name)
    private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async create(
    createDto: CreateOperacionFinancieraDto,
  ): Promise<OperacionFinanciera> {
    const existente = await this.operacionModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe una operación financiera con ese código',
      );
    const created = new this.operacionModel({
      ...createDto,
      fechaLimite: new Date(createDto.fechaLimite),
      saldoPendiente: createDto.monto,
    });
    return created.save();
  }

  async findAll(): Promise<OperacionFinanciera[]> {
    return this.operacionModel
      .find()
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .sort({ fechaLimite: -1 })
      .exec();
  }

  async findOne(id: string): Promise<OperacionFinanciera> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación financiera no encontrada');
    const doc = await this.operacionModel
      .findById(id)
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .exec();
    if (!doc) throw new NotFoundException('Operación financiera no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateOperacionFinancieraDto,
  ): Promise<OperacionFinanciera> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación financiera no encontrada');
    const updated = await this.operacionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException('Operación financiera no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación financiera no encontrada');
    const removed = await this.operacionModel.findByIdAndDelete(id).exec();
    if (!removed)
      throw new NotFoundException('Operación financiera no encontrada');
    return { deleted: true };
  }

  async pagar(
    id: string,
    pagarDto: PagarOperacionFinancieraDto,
  ): Promise<OperacionFinanciera> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación financiera no encontrada');
    const operacion = await this.operacionModel.findById(id).exec();
    if (!operacion)
      throw new NotFoundException('Operación financiera no encontrada');
    if (operacion.estado === EstadoOperacion.PAGADA)
      throw new BadRequestException('La operación ya está pagada');
    if (operacion.estado === EstadoOperacion.ANULADA)
      throw new BadRequestException('La operación está anulada');
    if (pagarDto.monto <= 0)
      throw new BadRequestException('El monto debe ser mayor a 0');
    if (pagarDto.monto > operacion.saldoPendiente)
      throw new BadRequestException('El monto excede el saldo pendiente');

    operacion.saldoPendiente = Number(
      (operacion.saldoPendiente - pagarDto.monto).toFixed(2),
    );
    operacion.montoPagado = Number(
      (operacion.montoPagado + pagarDto.monto).toFixed(2),
    );

    if (operacion.saldoPendiente <= 0)
      operacion.estado = EstadoOperacion.PAGADA;
    else operacion.estado = EstadoOperacion.PARCIAL;

    if (pagarDto.fechaPago) operacion.fechaPago = new Date(pagarDto.fechaPago);
    else operacion.fechaPago = new Date();

    if (pagarDto.comprobante) operacion.comprobante = pagarDto.comprobante;

    // Crear transacción de egreso asociada
    const codigoTransaccion = `PAG-${operacion.codigo}-${Date.now()}`;
    await this.transaccionModel.create({
      codigo: codigoTransaccion,
      tipo: TipoTransaccion.EGRESO,
      categoria: new Types.ObjectId(),
      monto: pagarDto.monto,
      moneda: new Types.ObjectId(),
      fecha: operacion.fechaPago,
      metodoPago: MetodoPago.TRANSFERENCIA,
      referencia: operacion.codigo,
      descripcion: `Pago ${operacion.tipo} - ${operacion.periodo}`,
      cuentaBancaria: operacion.cuentaBancaria,
    });

    return operacion.save();
  }

  async getVencidas(): Promise<OperacionFinanciera[]> {
    const hoy = new Date();
    return this.operacionModel
      .find({
        estado: { $in: [EstadoOperacion.PENDIENTE, EstadoOperacion.PARCIAL] },
        fechaLimite: { $lt: hoy },
      })
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .sort({ fechaLimite: 1 })
      .exec();
  }

  async getPorPeriodo(periodo: string): Promise<OperacionFinanciera[]> {
    return this.operacionModel
      .find({ periodo })
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .sort({ fechaLimite: -1 })
      .exec();
  }

  async getPorTipo(
    tipo: TipoOperacionFinanciera,
  ): Promise<OperacionFinanciera[]> {
    return this.operacionModel
      .find({ tipo })
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .sort({ fechaLimite: -1 })
      .exec();
  }

  async getResumen() {
    const totalPendiente = await this.operacionModel
      .aggregate<{ total: number }>([
        {
          $match: {
            estado: { $nin: [EstadoOperacion.PAGADA, EstadoOperacion.ANULADA] },
          },
        },
        { $group: { _id: null, total: { $sum: '$saldoPendiente' } } },
      ])
      .exec();
    const porTipo = await this.operacionModel
      .aggregate([
        {
          $group: {
            _id: '$tipo',
            cantidad: { $sum: 1 },
            totalMonto: { $sum: '$monto' },
            totalPagado: { $sum: '$montoPagado' },
            totalPendiente: { $sum: '$saldoPendiente' },
          },
        },
      ])
      .exec();
    const porEstado = await this.operacionModel
      .aggregate([
        {
          $group: {
            _id: '$estado',
            cantidad: { $sum: 1 },
            total: { $sum: '$saldoPendiente' },
          },
        },
      ])
      .exec();
    return {
      totalPendiente: totalPendiente.length > 0 ? totalPendiente[0].total : 0,
      porTipo,
      porEstado,
    };
  }
}
