import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePlanCobroDto } from './dto/create-plan-cobro.dto';
import { UpdatePlanCobroDto } from './dto/update-plan-cobro.dto';
import { CobrarPlanCobroDto } from './dto/cobrar-plan-cobro.dto';
import { PlanCobro, PlanCobroDocument } from './schema/plan-cobro.schema';
import { EstadoPlanCobro, ProyeccionCobros } from './types/plan-cobro.types';

@Injectable()
export class PlanificacionCobrosService {
  constructor(
    @InjectModel(PlanCobro.name)
    private planCobroModel: Model<PlanCobroDocument>,
  ) {}

  async create(createDto: CreatePlanCobroDto): Promise<PlanCobro> {
    const existente = await this.planCobroModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe un plan de cobro con ese código',
      );
    const created = new this.planCobroModel({
      ...createDto,
      saldoProgramado: createDto.montoProgramado,
    });
    return created.save();
  }

  async findAll(): Promise<PlanCobro[]> {
    return this.planCobroModel
      .find()
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ fechaProgramada: -1 })
      .exec();
  }

  async findOne(id: string): Promise<PlanCobro> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de cobro no encontrado');
    const doc = await this.planCobroModel
      .findById(id)
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .exec();
    if (!doc) throw new NotFoundException('Plan de cobro no encontrado');
    return doc;
  }

  async update(id: string, updateDto: UpdatePlanCobroDto): Promise<PlanCobro> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de cobro no encontrado');
    const updated = await this.planCobroModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Plan de cobro no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de cobro no encontrado');
    const removed = await this.planCobroModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Plan de cobro no encontrado');
    return { deleted: true };
  }

  async confirmar(id: string): Promise<PlanCobro> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de cobro no encontrado');
    const plan = await this.planCobroModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de cobro no encontrado');
    if (plan.estado === EstadoPlanCobro.COBRADO)
      throw new BadRequestException('El plan ya fue cobrado');
    if (plan.estado === EstadoPlanCobro.CANCELADO)
      throw new BadRequestException('El plan está cancelado');
    plan.estado = EstadoPlanCobro.CONFIRMADO;
    return plan.save();
  }

  async cobrar(id: string, cobroDto: CobrarPlanCobroDto): Promise<PlanCobro> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de cobro no encontrado');
    const plan = await this.planCobroModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de cobro no encontrado');
    if (plan.estado === EstadoPlanCobro.COBRADO)
      throw new BadRequestException('El plan ya fue cobrado');
    if (plan.estado === EstadoPlanCobro.CANCELADO)
      throw new BadRequestException('El plan está cancelado');
    if (cobroDto.monto <= 0)
      throw new BadRequestException('El monto debe ser mayor a 0');
    if (cobroDto.monto > plan.saldoProgramado)
      throw new BadRequestException('El monto excede el saldo programado');

    plan.montoCobrado = Number((plan.montoCobrado + cobroDto.monto).toFixed(2));
    plan.saldoProgramado = Number(
      (plan.saldoProgramado - cobroDto.monto).toFixed(2),
    );
    plan.fechaCobro = cobroDto.fechaCobro
      ? new Date(cobroDto.fechaCobro)
      : new Date();
    if (cobroDto.metodoPago) plan.metodoPago = cobroDto.metodoPago;

    if (plan.saldoProgramado === 0) {
      plan.estado = EstadoPlanCobro.COBRADO;
    }

    return plan.save();
  }

  async cancelar(id: string): Promise<PlanCobro> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de cobro no encontrado');
    const plan = await this.planCobroModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de cobro no encontrado');
    if (plan.estado === EstadoPlanCobro.COBRADO)
      throw new BadRequestException('No se puede cancelar un plan ya cobrado');
    plan.estado = EstadoPlanCobro.CANCELADO;
    return plan.save();
  }

  async reprogramar(id: string, nuevaFecha: string): Promise<PlanCobro> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de cobro no encontrado');
    const plan = await this.planCobroModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de cobro no encontrado');
    if (plan.estado === EstadoPlanCobro.COBRADO)
      throw new BadRequestException(
        'No se puede reprogramar un plan ya cobrado',
      );
    if (plan.estado === EstadoPlanCobro.CANCELADO)
      throw new BadRequestException(
        'No se puede reprogramar un plan cancelado',
      );
    plan.fechaProgramada = new Date(nuevaFecha);
    plan.estado = EstadoPlanCobro.REPROGRAMADO;
    return plan.save();
  }

  async getPorPeriodo(desde: string, hasta: string): Promise<PlanCobro[]> {
    return this.planCobroModel
      .find({
        fechaProgramada: { $gte: new Date(desde), $lte: new Date(hasta) },
      })
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async getPendientes(): Promise<PlanCobro[]> {
    return this.planCobroModel
      .find({
        estado: {
          $in: [
            EstadoPlanCobro.PROGRAMADO,
            EstadoPlanCobro.CONFIRMADO,
            EstadoPlanCobro.REPROGRAMADO,
          ],
        },
      })
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async getProyeccionIngresos(hasta: string): Promise<ProyeccionCobros[]> {
    const hoy = new Date();
    const hastaDate = new Date(hasta);
    const pipeline = [
      {
        $match: {
          estado: {
            $in: [
              EstadoPlanCobro.PROGRAMADO,
              EstadoPlanCobro.CONFIRMADO,
              EstadoPlanCobro.REPROGRAMADO,
            ],
          },
          fechaProgramada: { $gte: hoy, $lte: hastaDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$fechaProgramada' },
          },
          totalProgramado: { $sum: '$saldoProgramado' },
          cantidad: { $sum: 1 },
          probabilidadPromedio: { $avg: '$probabilidad' },
        },
      },
      { $sort: { _id: 1 as const } },
      {
        $project: {
          _id: 0,
          periodo: '$_id',
          totalProgramado: { $round: ['$totalProgramado', 2] },
          cantidad: 1,
          probabilidadPromedio: { $round: ['$probabilidadPromedio', 0] },
        },
      },
    ];
    return this.planCobroModel.aggregate<ProyeccionCobros>(pipeline).exec();
  }

  async getResumen(): Promise<any> {
    const totalProgramado = await this.planCobroModel
      .aggregate<{ total: number; cantidad: number }>([
        { $match: { estado: { $ne: EstadoPlanCobro.CANCELADO } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$saldoProgramado' },
            cantidad: { $sum: 1 },
          },
        },
      ])
      .exec();
    const porEstado = await this.planCobroModel
      .aggregate([
        {
          $group: {
            _id: '$estado',
            cantidad: { $sum: 1 },
            total: { $sum: '$saldoProgramado' },
          },
        },
      ])
      .exec();
    const probabilidadPromedio = await this.planCobroModel
      .aggregate<{ promedio: number }>([
        {
          $match: {
            estado: {
              $in: [
                EstadoPlanCobro.PROGRAMADO,
                EstadoPlanCobro.CONFIRMADO,
                EstadoPlanCobro.REPROGRAMADO,
              ],
            },
          },
        },
        { $group: { _id: null, promedio: { $avg: '$probabilidad' } } },
      ])
      .exec();
    return {
      totalProgramado:
        totalProgramado.length > 0 ? totalProgramado[0].total : 0,
      cantidad: totalProgramado.length > 0 ? totalProgramado[0].cantidad : 0,
      porEstado,
      probabilidadPromedio:
        probabilidadPromedio.length > 0
          ? Math.round(probabilidadPromedio[0].promedio)
          : 0,
    };
  }

  async getPorProbabilidad(umbral: number): Promise<PlanCobro[]> {
    return this.planCobroModel
      .find({
        estado: {
          $in: [
            EstadoPlanCobro.PROGRAMADO,
            EstadoPlanCobro.CONFIRMADO,
            EstadoPlanCobro.REPROGRAMADO,
          ],
        },
        probabilidad: { $gte: umbral },
      })
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ probabilidad: 1 })
      .exec();
  }

  async findPendientes(): Promise<PlanCobro[]> {
    return this.planCobroModel
      .find({
        estado: {
          $in: [EstadoPlanCobro.PROGRAMADO, EstadoPlanCobro.REPROGRAMADO],
        },
      })
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async findVencidos(): Promise<PlanCobro[]> {
    const hoy = new Date();
    return this.planCobroModel
      .find({
        fechaProgramada: { $lt: hoy },
        estado: {
          $in: [EstadoPlanCobro.PROGRAMADO, EstadoPlanCobro.REPROGRAMADO],
        },
      })
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ fechaProgramada: 1 })
      .exec();
  }

  async findByCliente(clienteId: string): Promise<PlanCobro[]> {
    return this.planCobroModel
      .find({ cliente: clienteId })
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ fechaProgramada: -1 })
      .exec();
  }

  async proyectarMorosidad(diasMora: number): Promise<PlanCobro[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasMora);
    return this.planCobroModel
      .find({
        fechaProgramada: { $lt: fechaLimite },
        estado: {
          $in: [EstadoPlanCobro.PROGRAMADO, EstadoPlanCobro.REPROGRAMADO],
        },
      })
      .populate('cliente')
      .populate('cuentaCobrar')
      .populate('cuentaBancaria')
      .populate('cajaDestino')
      .sort({ fechaProgramada: 1 })
      .exec();
  }
}
