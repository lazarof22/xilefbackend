import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateAnticipoDto } from './dto/create-anticipo.dto';
import { UpdateAnticipoDto } from './dto/update-anticipo.dto';
import { CreateLiquidacionViaticoDto } from './dto/create-liquidacion-viatico.dto';
import { Anticipo, AnticipoDocument } from './schema/anticipo.schema';
import {
  LiquidacionViatico,
  LiquidacionViaticoDocument,
} from './schema/liquidacion-viatico.schema';
import {
  Transaccion,
  TransaccionDocument,
} from '../transaccion/schema/transaccion.schema';
import {
  TipoAnticipo,
  EstadoAnticipo,
  ResultadoLiquidacion,
  EstadoLiquidacion,
  ResumenAnticiposViaticos,
} from './types/anticipos-viaticos.types';
import {
  TipoTransaccion,
  MetodoPago,
} from '../transaccion/types/transaccion.types';

@Injectable()
export class AnticiposViaticosService {
  constructor(
    @InjectModel(Anticipo.name) private anticipoModel: Model<AnticipoDocument>,
    @InjectModel(LiquidacionViatico.name)
    private liquidacionModel: Model<LiquidacionViaticoDocument>,
    @InjectModel(Transaccion.name)
    private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async createAnticipo(createDto: CreateAnticipoDto): Promise<Anticipo> {
    const existente = await this.anticipoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe un anticipo con ese código');

    const created = new this.anticipoModel({
      ...createDto,
      fecha: new Date(createDto.fecha),
      estado: EstadoAnticipo.ENTREGADO,
    });
    return created.save();
  }

  async findAllAnticipos(): Promise<Anticipo[]> {
    return this.anticipoModel
      .find()
      .populate('beneficiario')
      .populate('cajaOrigen')
      .populate('cuentaBancariaOrigen')
      .populate('liquidacion')
      .sort({ fecha: -1 })
      .exec();
  }

  async findOneAnticipo(id: string): Promise<Anticipo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Anticipo no encontrado');
    const doc = await this.anticipoModel
      .findById(id)
      .populate('beneficiario')
      .populate('cajaOrigen')
      .populate('cuentaBancariaOrigen')
      .populate('liquidacion')
      .exec();
    if (!doc) throw new NotFoundException('Anticipo no encontrado');
    return doc;
  }

  async updateAnticipo(
    id: string,
    updateDto: UpdateAnticipoDto,
  ): Promise<Anticipo> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Anticipo no encontrado');
    const updateData: Record<string, unknown> = { ...updateDto };
    if (updateDto.fecha) updateData.fecha = new Date(updateDto.fecha);
    const updated = await this.anticipoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Anticipo no encontrado');
    return updated;
  }

  async removeAnticipo(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Anticipo no encontrado');
    const removed = await this.anticipoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Anticipo no encontrado');
    return { deleted: true };
  }

  async liquidarViatico(
    anticipoId: string,
    dto: CreateLiquidacionViaticoDto,
  ): Promise<LiquidacionViatico> {
    if (!isValidObjectId(anticipoId))
      throw new NotFoundException('Anticipo no encontrado');

    const anticipo = await this.anticipoModel.findById(anticipoId).exec();
    if (!anticipo) throw new NotFoundException('Anticipo no encontrado');
    if (anticipo.estado === EstadoAnticipo.LIQUIDADO) {
      throw new BadRequestException('El anticipo ya está liquidado');
    }
    if (anticipo.estado === EstadoAnticipo.CANCELADO) {
      throw new BadRequestException('El anticipo está cancelado');
    }

    const montoAnticipo = anticipo.monto;
    const gastoReal = dto.gastoReal;
    const diferencia = Number((gastoReal - montoAnticipo).toFixed(2));

    let resultado: ResultadoLiquidacion;
    if (diferencia > 0) resultado = ResultadoLiquidacion.SOBRANTE;
    else if (diferencia < 0) resultado = ResultadoLiquidacion.FALTANTE;
    else resultado = ResultadoLiquidacion.EXACTO;

    // Create liquidacion
    const liquidacion = new this.liquidacionModel({
      codigo: `LIQ-${anticipo.codigo}-${Date.now()}`,
      anticipo: anticipo._id,
      fecha: new Date(dto.fecha),
      montoAnticipo,
      gastoReal,
      diferencia,
      resultado,
      detalleGastos: dto.detalleGastos.map((g) => ({
        descripcion: g.descripcion,
        monto: g.monto,
        categoria: new Types.ObjectId(g.categoria),
        fecha: new Date(g.fecha),
      })),
      observaciones: dto.observaciones,
      estado: EstadoLiquidacion.PENDIENTE,
    });
    const savedLiquidacion = await liquidacion.save();

    // Update anticipo
    const updateData: Record<string, unknown> = {
      montoLiquidado: gastoReal,
      liquidacion: savedLiquidacion._id,
      estado: EstadoAnticipo.LIQUIDADO,
    };

    // Create transactions for differences
    if (resultado === ResultadoLiquidacion.FALTANTE) {
      // Employee must return the excess (gastoReal < montoAnticipo)
      // This is an ingreso for the company (employee pays back)
      const montoDevolver = Math.abs(diferencia);
      updateData.montoDevuelto = montoDevolver;

      await this.transaccionModel.create({
        codigo: `REEMB-${anticipo.codigo}-${Date.now()}`,
        tipo: TipoTransaccion.INGRESO,
        categoria:
          anticipo.tipo === TipoAnticipo.VIATICO
            ? anticipo.cajaOrigen ||
              anticipo.cuentaBancariaOrigen ||
              new Types.ObjectId('000000000000000000000000')
            : anticipo.cajaOrigen ||
              anticipo.cuentaBancariaOrigen ||
              new Types.ObjectId('000000000000000000000000'),
        monto: montoDevolver,
        moneda: new Types.ObjectId('000000000000000000000000'),
        fecha: new Date(),
        metodoPago: MetodoPago.EFECTIVO,
        descripcion: `Reembolso por sobrante de anticipo ${anticipo.codigo} - ${dto.observaciones || ''}`,
      });
    } else if (resultado === ResultadoLiquidacion.SOBRANTE) {
      // Company owes employee the extra (gastoReal > montoAnticipo)
      // This is an egreso for the company
      const montoReembolsar = Math.abs(diferencia);
      updateData.montoReembolsado = montoReembolsar;

      await this.transaccionModel.create({
        codigo: `DEV-${anticipo.codigo}-${Date.now()}`,
        tipo: TipoTransaccion.EGRESO,
        categoria:
          anticipo.cajaOrigen ||
          anticipo.cuentaBancariaOrigen ||
          new Types.ObjectId('000000000000000000000000'),
        monto: montoReembolsar,
        moneda: new Types.ObjectId('000000000000000000000000'),
        fecha: new Date(),
        metodoPago: MetodoPago.EFECTIVO,
        descripcion: `Devolución por faltante de anticipo ${anticipo.codigo} - ${dto.observaciones || ''}`,
      });
    }

    await this.anticipoModel.findByIdAndUpdate(anticipoId, updateData).exec();

    return savedLiquidacion.populate('anticipo');
  }

  async aprobarLiquidacion(id: string): Promise<LiquidacionViatico> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Liquidación no encontrada');
    const liquidacion = await this.liquidacionModel
      .findByIdAndUpdate(
        id,
        { estado: EstadoLiquidacion.APROBADA },
        { new: true },
      )
      .exec();
    if (!liquidacion) throw new NotFoundException('Liquidación no encontrada');
    return liquidacion;
  }

  async rechazarLiquidacion(
    id: string,
    motivo?: string,
  ): Promise<LiquidacionViatico> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Liquidación no encontrada');
    const updateData: Record<string, unknown> = {
      estado: EstadoLiquidacion.RECHAZADA,
    };
    if (motivo) updateData.observaciones = motivo;
    const liquidacion = await this.liquidacionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!liquidacion) throw new NotFoundException('Liquidación no encontrada');
    return liquidacion;
  }

  async getAnticiposPendientes(): Promise<Anticipo[]> {
    return this.anticipoModel
      .find({
        estado: {
          $in: [
            EstadoAnticipo.ENTREGADO,
            EstadoAnticipo.PARCIALMENTE_LIQUIDADO,
          ],
        },
      })
      .populate('beneficiario')
      .populate('cajaOrigen')
      .populate('cuentaBancariaOrigen')
      .sort({ fecha: -1 })
      .exec();
  }

  async getPorBeneficiario(empleadoId: string): Promise<Anticipo[]> {
    if (!isValidObjectId(empleadoId))
      throw new NotFoundException('Empleado no encontrado');
    return this.anticipoModel
      .find({ beneficiario: empleadoId })
      .populate('beneficiario')
      .populate('cajaOrigen')
      .populate('cuentaBancariaOrigen')
      .populate('liquidacion')
      .sort({ fecha: -1 })
      .exec();
  }

  async getLiquidaciones(): Promise<LiquidacionViatico[]> {
    return this.liquidacionModel
      .find()
      .populate('anticipo')
      .populate('detalleGastos.categoria')
      .sort({ fecha: -1 })
      .exec();
  }

  async getResumen(): Promise<ResumenAnticiposViaticos> {
    const [
      totalAnticipos,
      montoTotalEntregado,
      montoTotalLiquidado,
      pendientes,
      liquidados,
    ] = await Promise.all([
      this.anticipoModel.countDocuments().exec(),
      this.anticipoModel
        .aggregate<{
          _id: null;
          total: number;
        }>([{ $group: { _id: null, total: { $sum: '$monto' } } }])
        .exec(),
      this.anticipoModel
        .aggregate<{
          _id: null;
          total: number;
        }>([{ $group: { _id: null, total: { $sum: '$montoLiquidado' } } }])
        .exec(),
      this.anticipoModel
        .countDocuments({
          estado: {
            $in: [
              EstadoAnticipo.ENTREGADO,
              EstadoAnticipo.PARCIALMENTE_LIQUIDADO,
            ],
          },
        })
        .exec(),
      this.anticipoModel
        .countDocuments({ estado: EstadoAnticipo.LIQUIDADO })
        .exec(),
    ]);

    const totalEntregado =
      montoTotalEntregado.length > 0 ? montoTotalEntregado[0].total : 0;
    const totalLiquidado =
      montoTotalLiquidado.length > 0 ? montoTotalLiquidado[0].total : 0;

    return {
      totalAnticipos,
      montoTotalEntregado: totalEntregado,
      montoTotalLiquidado: totalLiquidado,
      montoPendienteLiquidar: totalEntregado - totalLiquidado,
      cantidadPendientes: pendientes,
      cantidadLiquidados: liquidados,
    };
  }
}
