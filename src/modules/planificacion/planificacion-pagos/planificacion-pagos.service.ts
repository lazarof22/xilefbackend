import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreatePlanPagoDto } from './dto/create-plan-pago.dto';
import { UpdatePlanPagoDto } from './dto/update-plan-pago.dto';
import { EjecutarPlanPagoDto } from './dto/ejecutar-plan-pago.dto';
import { PlanPago, PlanPagoDocument } from './schema/plan-pago.schema';
import { EstadoPlanPago } from './types/plan-pago.types';
import { Transaccion } from '../../finanzas/transaccion/schema/transaccion.schema';
import { Banco } from '../../finanzas/banco/schema/banco.schema';
import {
  TipoTransaccion,
  MetodoPago,
} from '../../finanzas/transaccion/types/transaccion.types';

@Injectable()
export class PlanificacionPagosService {
  constructor(
    @InjectModel(PlanPago.name) private planPagoModel: Model<PlanPagoDocument>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<Transaccion>,
    @InjectModel(Banco.name) private bancoModel: Model<Banco>,
  ) {}

  async create(createDto: CreatePlanPagoDto): Promise<PlanPago> {
    const existente = await this.planPagoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe un plan de pago con ese código');
    const created = new this.planPagoModel({
      ...createDto,
      saldoProgramado: createDto.montoProgramado,
    });
    return created.save();
  }

  async findAll(): Promise<PlanPago[]> {
    return this.planPagoModel
      .find()
      .populate('proveedor')
      .sort({ fechaProgramada: -1 })
      .exec();
  }

  async findOne(id: string): Promise<PlanPago> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const doc = await this.planPagoModel
      .findById(id)
      .populate('proveedor')
      .exec();
    if (!doc) throw new NotFoundException('Plan de pago no encontrado');
    return doc;
  }

  async update(id: string, updateDto: UpdatePlanPagoDto): Promise<PlanPago> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const updated = await this.planPagoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Plan de pago no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const removed = await this.planPagoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Plan de pago no encontrado');
    return { deleted: true };
  }

  async confirmar(id: string): Promise<PlanPago> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const plan = await this.planPagoModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de pago no encontrado');
    if (plan.estado === EstadoPlanPago.EJECUTADO) {
      throw new BadRequestException(
        'No se puede confirmar un plan de pago ya ejecutado',
      );
    }
    if (plan.estado === EstadoPlanPago.CANCELADO) {
      throw new BadRequestException(
        'No se puede confirmar un plan de pago cancelado',
      );
    }
    plan.estado = EstadoPlanPago.CONFIRMADO;
    return plan.save();
  }

  async ejecutar(
    id: string,
    ejecutarDto: EjecutarPlanPagoDto,
  ): Promise<PlanPago> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const plan = await this.planPagoModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de pago no encontrado');
    if (plan.estado !== EstadoPlanPago.CONFIRMADO) {
      throw new BadRequestException(
        'El plan de pago debe estar en estado CONFIRMADO para ejecutarlo',
      );
    }
    if (ejecutarDto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }
    if (ejecutarDto.monto > plan.saldoProgramado) {
      throw new BadRequestException('El monto excede el saldo programado');
    }

    const fechaEjecucion = ejecutarDto.fechaEjecucion
      ? new Date(ejecutarDto.fechaEjecucion)
      : new Date();

    // Buscar moneda desde la cuenta bancaria asociada
    let monedaId: Types.ObjectId | undefined;
    if (plan.cuentaBancaria) {
      const banco = await this.bancoModel
        .findById(plan.cuentaBancaria)
        .select('moneda')
        .exec();
      if (banco?.moneda) {
        monedaId = banco.moneda;
      }
    }

    // Crear transacción de egreso
    await this.transaccionModel.create({
      codigo: `PP-${Date.now()}`,
      tipo: TipoTransaccion.EGRESO,
      monto: ejecutarDto.monto,
      fecha: fechaEjecucion,
      metodoPago:
        (ejecutarDto.metodoPago as MetodoPago) ?? MetodoPago.TRANSFERENCIA,
      referencia: ejecutarDto.referencia,
      descripcion: `Pago planificado: ${plan.codigo}`,
      proveedor: plan.proveedor,
      cuentaBancaria: plan.cuentaBancaria,
      moneda: monedaId,
    });

    // Actualizar saldo de la cuenta bancaria si aplica
    if (plan.cuentaBancaria) {
      await this.bancoModel
        .findByIdAndUpdate(plan.cuentaBancaria, {
          $inc: { saldoActual: -ejecutarDto.monto },
        })
        .exec();
    }

    plan.montoPagado = Number(
      (plan.montoPagado + ejecutarDto.monto).toFixed(2),
    );
    plan.saldoProgramado = Number(
      (plan.saldoProgramado - ejecutarDto.monto).toFixed(2),
    );
    plan.fechaEjecucion = fechaEjecucion;

    if (plan.saldoProgramado === 0) {
      plan.estado = EstadoPlanPago.EJECUTADO;
    }

    return plan.save();
  }

  async cancelar(id: string): Promise<PlanPago> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const plan = await this.planPagoModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de pago no encontrado');
    if (plan.estado === EstadoPlanPago.EJECUTADO) {
      throw new BadRequestException(
        'No se puede cancelar un plan de pago ya ejecutado',
      );
    }
    plan.estado = EstadoPlanPago.CANCELADO;
    return plan.save();
  }

  async reprogramar(id: string, nuevaFecha: string): Promise<PlanPago> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const plan = await this.planPagoModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de pago no encontrado');
    if (plan.estado === EstadoPlanPago.EJECUTADO) {
      throw new BadRequestException(
        'No se puede reprogramar un plan de pago ya ejecutado',
      );
    }
    if (plan.estado === EstadoPlanPago.CANCELADO) {
      throw new BadRequestException(
        'No se puede reprogramar un plan de pago cancelado',
      );
    }
    plan.fechaProgramada = new Date(nuevaFecha);
    plan.estado = EstadoPlanPago.REPROGRAMADO;
    return plan.save();
  }

  async getPorPeriodo(desde: string, hasta: string): Promise<PlanPago[]> {
    return this.planPagoModel
      .find({
        fechaProgramada: { $gte: new Date(desde), $lte: new Date(hasta) },
      })
      .populate('proveedor')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async getPendientes(): Promise<PlanPago[]> {
    return this.planPagoModel
      .find({
        estado: { $in: [EstadoPlanPago.PROGRAMADO, EstadoPlanPago.CONFIRMADO] },
      })
      .populate('proveedor')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async getProyeccion(
    hasta: string,
  ): Promise<{ periodo: string; totalProgramado: number; cantidad: number }[]> {
    const hastaDate = new Date(hasta);
    return this.planPagoModel
      .aggregate<{
        _id: { year: number; week: number };
        periodo: string;
        totalProgramado: number;
        cantidad: number;
      }>([
        {
          $match: {
            fechaProgramada: { $lte: hastaDate },
            estado: {
              $in: [EstadoPlanPago.PROGRAMADO, EstadoPlanPago.CONFIRMADO],
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $isoWeekYear: '$fechaProgramada' },
              week: { $isoWeek: '$fechaProgramada' },
            },
            periodo: {
              $first: {
                $dateToString: { format: '%Y-W%V', date: '$fechaProgramada' },
              },
            },
            totalProgramado: { $sum: '$saldoProgramado' },
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
        {
          $project: {
            _id: 0,
            periodo: 1,
            totalProgramado: { $round: ['$totalProgramado', 2] },
            cantidad: 1,
          },
        },
      ])
      .exec();
  }

  async getResumen(): Promise<{
    porEstado: {
      _id: string;
      cantidad: number;
      totalProgramado: number;
      totalPagado: number;
      saldoPendiente: number;
    }[];
    totalGeneral: {
      totalProgramado: number;
      totalPagado: number;
      saldoPendiente: number;
      cantidad: number;
    };
  }> {
    const porEstado = await this.planPagoModel
      .aggregate<{
        _id: string;
        cantidad: number;
        totalProgramado: number;
        totalPagado: number;
        saldoPendiente: number;
      }>([
        {
          $group: {
            _id: '$estado',
            cantidad: { $sum: 1 },
            totalProgramado: { $sum: '$montoProgramado' },
            totalPagado: { $sum: '$montoPagado' },
            saldoPendiente: { $sum: '$saldoProgramado' },
          },
        },
      ])
      .exec();

    const totalGeneral = await this.planPagoModel
      .aggregate<{
        _id: null;
        totalProgramado: number;
        totalPagado: number;
        saldoPendiente: number;
        cantidad: number;
      }>([
        {
          $match: {
            estado: {
              $nin: [EstadoPlanPago.CANCELADO, EstadoPlanPago.EJECUTADO],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalProgramado: { $sum: '$montoProgramado' },
            totalPagado: { $sum: '$montoPagado' },
            saldoPendiente: { $sum: '$saldoProgramado' },
            cantidad: { $sum: 1 },
          },
        },
      ])
      .exec();

    return {
      porEstado,
      totalGeneral:
        totalGeneral.length > 0
          ? totalGeneral[0]
          : {
              totalProgramado: 0,
              totalPagado: 0,
              saldoPendiente: 0,
              cantidad: 0,
            },
    };
  }

  async findPendientes(): Promise<PlanPago[]> {
    return this.planPagoModel
      .find({
        estado: { $in: [EstadoPlanPago.PROGRAMADO, EstadoPlanPago.CONFIRMADO] },
      })
      .populate('proveedor')
      .populate('cuentaPagar')
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async findVencidos(): Promise<PlanPago[]> {
    const hoy = new Date();
    return this.planPagoModel
      .find({
        fechaProgramada: { $lt: hoy },
        estado: {
          $in: [EstadoPlanPago.PROGRAMADO, EstadoPlanPago.CONFIRMADO],
        },
      })
      .populate('proveedor')
      .populate('cuentaPagar')
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async findByProveedor(proveedorId: string): Promise<PlanPago[]> {
    return this.planPagoModel
      .find({ proveedor: proveedorId })
      .populate('proveedor')
      .populate('cuentaPagar')
      .populate('cuentaBancaria')
      .populate('cajaOrigen')
      .sort({ fechaProgramada: -1 })
      .exec();
  }

  async priorizar(id: string, prioridad: number): Promise<PlanPago> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de pago no encontrado');
    const plan = await this.planPagoModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de pago no encontrado');
    plan.prioridad = prioridad;
    return plan.save();
  }
}
