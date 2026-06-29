import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { GenerarAmortizacionDto } from './dto/generar-amortizacion.dto';
import { AbonarCuotaDto } from './dto/abonar-cuota.dto';
import { Credito, CreditoDocument } from './schema/credito.schema';
import {
  CuotaCredito,
  CuotaCreditoDocument,
} from './schema/cuota-credito.schema';
import {
  EstadoCredito,
  MetodoAmortizacion,
  EstadoCuota,
  ClasificacionRiesgo,
} from './types/credito.types';
import {
  calcularAmortizacionFrances,
  calcularAmortizacionAleman,
} from './amortizacion.helper';
import {
  Transaccion,
  TransaccionDocument,
} from '../transaccion/schema/transaccion.schema';
import {
  TipoTransaccion,
  MetodoPago,
} from '../transaccion/types/transaccion.types';

@Injectable()
export class CreditoService {
  constructor(
    @InjectModel(Credito.name) private creditoModel: Model<CreditoDocument>,
    @InjectModel(CuotaCredito.name)
    private cuotaCreditoModel: Model<CuotaCreditoDocument>,
    @InjectModel(Transaccion.name)
    private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async create(createDto: CreateCreditoDto): Promise<Credito> {
    const existente = await this.creditoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe un crédito con ese código');
    const created = new this.creditoModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Credito[]> {
    return this.creditoModel
      .find()
      .populate('banco')
      .sort({ fechaSolicitud: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Credito> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Crédito no encontrado');
    const doc = await this.creditoModel.findById(id).populate('banco').exec();
    if (!doc) throw new NotFoundException('Crédito no encontrado');
    return doc;
  }

  async update(id: string, updateDto: UpdateCreditoDto): Promise<Credito> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Crédito no encontrado');
    const updated = await this.creditoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Crédito no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Crédito no encontrado');
    const removed = await this.creditoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Crédito no encontrado');
    await this.cuotaCreditoModel
      .deleteMany({ credito: new Types.ObjectId(id) })
      .exec();
    return { deleted: true };
  }

  async getVencidos(): Promise<Credito[]> {
    const hoy = new Date();
    return this.creditoModel
      .find({
        estado: { $in: [EstadoCredito.EN_PAGO, EstadoCredito.VENCIDO] },
        fechaVencimiento: { $lt: hoy },
      })
      .populate('banco')
      .exec();
  }

  async getClasificacionRiesgo(): Promise<any> {
    return this.creditoModel
      .aggregate([
        {
          $group: {
            _id: '$clasificacionRiesgo',
            cantidad: { $sum: 1 },
            montoTotal: { $sum: '$saldoPendiente' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();
  }

  async getResumen(): Promise<any> {
    const totalDesembolsado = await this.creditoModel
      .aggregate([
        { $match: { estado: { $nin: [EstadoCredito.SOLICITADO] } } },
        { $group: { _id: null, total: { $sum: '$montoDesembolsado' } } },
      ])
      .exec();
    const totalPendiente = await this.creditoModel
      .aggregate([
        {
          $match: {
            estado: { $in: [EstadoCredito.EN_PAGO, EstadoCredito.VENCIDO] },
          },
        },
        { $group: { _id: null, total: { $sum: '$saldoPendiente' } } },
      ])
      .exec();
    return {
      totalDesembolsado:
        totalDesembolsado.length > 0 ? totalDesembolsado[0].total : 0,
      totalPendiente: totalPendiente.length > 0 ? totalPendiente[0].total : 0,
      porEstado: await this.creditoModel
        .aggregate([{ $group: { _id: '$estado', cantidad: { $sum: 1 } } }])
        .exec(),
    };
  }

  // ─── Plan de Amortización ────────────────────────────────────────────────────

  async generarPlanAmortizacion(
    creditoId: string,
    dto?: GenerarAmortizacionDto,
  ): Promise<CuotaCredito[]> {
    if (!isValidObjectId(creditoId))
      throw new NotFoundException('Crédito no encontrado');
    const credito = await this.creditoModel.findById(creditoId).exec();
    if (!credito) throw new NotFoundException('Crédito no encontrado');

    if (credito.cuotasGeneradas > 0 && !dto?.forzar) {
      throw new BadRequestException(
        'El crédito ya tiene cuotas generadas. Use forzar=true para regenerar.',
      );
    }

    const metodo =
      dto?.metodo ?? credito.metodoAmortizacion ?? MetodoAmortizacion.FRANCES;
    const fechaInicio = credito.fechaDesembolso ?? credito.fechaSolicitud;
    const principal = credito.montoDesembolsado || credito.montoSolicitado;

    let cuotasCalculadas;
    if (metodo === MetodoAmortizacion.ALEMAN) {
      cuotasCalculadas = calcularAmortizacionAleman(
        principal,
        credito.tasaInteres,
        credito.plazoMeses,
        fechaInicio,
      );
    } else {
      cuotasCalculadas = calcularAmortizacionFrances(
        principal,
        credito.tasaInteres,
        credito.plazoMeses,
        fechaInicio,
      );
    }

    // Remove existing cuotas if forcing
    if (dto?.forzar && credito.cuotasGeneradas > 0) {
      await this.cuotaCreditoModel
        .deleteMany({ credito: credito._id as Types.ObjectId })
        .exec();
      await this.creditoModel
        .findByIdAndUpdate(creditoId, { cuotas: [], cuotasGeneradas: 0 })
        .exec();
    }

    const cuotaDocs = cuotasCalculadas.map((c) => ({
      numeroCuota: `${credito.codigo}-C${c.numero}`,
      credito: credito._id as Types.ObjectId,
      numero: c.numero,
      fechaVencimiento: c.fechaVencimiento,
      capital: c.capital,
      interes: c.interes,
      cuotaTotal: c.cuotaTotal,
      saldoPendiente: c.cuotaTotal,
      estado: EstadoCuota.PENDIENTE,
    }));

    const saved = await this.cuotaCreditoModel.insertMany(cuotaDocs);

    const cuotaIds = saved.map((c) => c._id as Types.ObjectId);
    await this.creditoModel
      .findByIdAndUpdate(creditoId, {
        cuotasGeneradas: saved.length,
        cuotas: cuotaIds,
        metodoAmortizacion: metodo,
      })
      .exec();

    return this.cuotaCreditoModel
      .find({ credito: creditoId })
      .sort({ numero: 1 })
      .exec();
  }

  async getPlanAmortizacion(creditoId: string): Promise<CuotaCredito[]> {
    if (!isValidObjectId(creditoId))
      throw new NotFoundException('Crédito no encontrado');
    const credito = await this.creditoModel.findById(creditoId).exec();
    if (!credito) throw new NotFoundException('Crédito no encontrado');
    return this.cuotaCreditoModel
      .find({ credito: creditoId })
      .sort({ numero: 1 })
      .exec();
  }

  async regenerarPlan(
    creditoId: string,
    dto?: GenerarAmortizacionDto,
  ): Promise<CuotaCredito[]> {
    if (!isValidObjectId(creditoId))
      throw new NotFoundException('Crédito no encontrado');
    const credito = await this.creditoModel.findById(creditoId).exec();
    if (!credito) throw new NotFoundException('Crédito no encontrado');

    await this.cuotaCreditoModel
      .deleteMany({ credito: credito._id as Types.ObjectId })
      .exec();

    return this.generarPlanAmortizacion(creditoId, { ...dto, forzar: true });
  }

  // ─── Abono a Cuota ──────────────────────────────────────────────────────────

  async abonarCuota(
    cuotaId: string,
    dto: AbonarCuotaDto,
  ): Promise<CuotaCredito> {
    if (!isValidObjectId(cuotaId))
      throw new NotFoundException('Cuota no encontrada');
    const cuota = await this.cuotaCreditoModel.findById(cuotaId).exec();
    if (!cuota) throw new NotFoundException('Cuota no encontrada');
    if (cuota.estado === EstadoCuota.PAGADA)
      throw new BadRequestException('La cuota ya está pagada');

    const capitalAbono = dto.capital ?? 0;
    const interesAbono = dto.interes ?? 0;
    const montoTotal = dto.monto;
    const fechaPago = dto.fechaPago ? new Date(dto.fechaPago) : new Date();

    // Validate abono distribution
    if (capitalAbono + interesAbono > montoTotal) {
      throw new BadRequestException(
        'La suma de capital e interés no puede exceder el monto total',
      );
    }

    const nuevoCapitalPagado = cuota.capitalPagado + capitalAbono;
    const nuevoInteresPagado = cuota.interesPagado + interesAbono;
    const nuevoSaldoPendiente =
      cuota.cuotaTotal - nuevoCapitalPagado - nuevoInteresPagado;

    let nuevoEstado: EstadoCuota = cuota.estado;
    if (nuevoSaldoPendiente <= 0) {
      nuevoEstado = EstadoCuota.PAGADA;
    } else if (nuevoCapitalPagado > 0 || nuevoInteresPagado > 0) {
      nuevoEstado = EstadoCuota.PARCIAL;
    }

    // Calculate mora if payment is after due date
    const mora =
      fechaPago > cuota.fechaVencimiento
        ? Math.floor(
            (fechaPago.getTime() - cuota.fechaVencimiento.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : undefined;

    const updated = await this.cuotaCreditoModel
      .findByIdAndUpdate(
        cuotaId,
        {
          capitalPagado: nuevoCapitalPagado,
          interesPagado: nuevoInteresPagado,
          saldoPendiente: Math.max(0, nuevoSaldoPendiente),
          estado: nuevoEstado,
          fechaPago,
          ...(mora !== undefined ? { mora } : {}),
        },
        { new: true },
      )
      .exec();

    if (!updated) throw new NotFoundException('Cuota no encontrada');

    // Decrease credito saldoPendiente
    const credito = await this.creditoModel.findById(cuota.credito).exec();
    if (credito) {
      const abonoTotal = capitalAbono + interesAbono;
      await this.creditoModel
        .findByIdAndUpdate(cuota.credito, {
          $inc: { saldoPendiente: -abonoTotal },
        })
        .exec();

      // Check if all cuotas are paid -> mark credito as PAGADO
      if (nuevoEstado === EstadoCuota.PAGADA) {
        const pendientes = await this.cuotaCreditoModel
          .countDocuments({
            credito: cuota.credito,
            estado: { $nin: [EstadoCuota.PAGADA] },
          })
          .exec();
        if (pendientes === 0) {
          await this.creditoModel
            .findByIdAndUpdate(cuota.credito, {
              estado: EstadoCredito.PAGADO,
            })
            .exec();
        }
      }
    }

    // Create Transaccion EGRESO
    await this.transaccionModel.create({
      codigo: `PAG-CUOTA-${cuota.numeroCuota}-${Date.now()}`,
      tipo: TipoTransaccion.EGRESO,
      categoria: credito?.banco ?? cuota.credito,
      monto: montoTotal,
      moneda: new Types.ObjectId('000000000000000000000000'), // placeholder — user should configure
      fecha: fechaPago,
      metodoPago: MetodoPago.TRANSFERENCIA,
      referencia: dto.referencia,
      descripcion: `Pago cuota ${cuota.numeroCuota} del crédito ${credito?.codigo ?? ''}`,
    });

    return updated;
  }

  // ─── Transiciones de Estado ──────────────────────────────────────────────────

  async aprobarCredito(id: string): Promise<Credito> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Crédito no encontrado');
    const credito = await this.creditoModel.findById(id).exec();
    if (!credito) throw new NotFoundException('Crédito no encontrado');
    if (credito.estado !== EstadoCredito.SOLICITADO) {
      throw new BadRequestException(
        'Solo se pueden aprobar créditos en estado solicitado',
      );
    }
    const updated = await this.creditoModel
      .findByIdAndUpdate(
        id,
        { estado: EstadoCredito.APROBADO, fechaAprobacion: new Date() },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Crédito no encontrado');
    return updated;
  }

  async desembolsarCredito(id: string): Promise<Credito> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Crédito no encontrado');
    const credito = await this.creditoModel.findById(id).exec();
    if (!credito) throw new NotFoundException('Crédito no encontrado');
    if (credito.estado !== EstadoCredito.APROBADO) {
      throw new BadRequestException(
        'Solo se pueden desembolsar créditos aprobados',
      );
    }

    const montoDesembolsado = credito.montoSolicitado;
    const fechaDesembolso = new Date();
    const fechaVencimiento = new Date(fechaDesembolso);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + credito.plazoMeses);

    const updated = await this.creditoModel
      .findByIdAndUpdate(
        id,
        {
          estado: EstadoCredito.DESEMBOLSADO,
          montoDesembolsado,
          saldoPendiente: montoDesembolsado,
          fechaDesembolso,
          fechaVencimiento,
        },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Crédito no encontrado');

    // Auto-generar plan de amortización
    await this.generarPlanAmortizacion(id);

    // Update estado to EN_PAGO after generating plan
    await this.creditoModel
      .findByIdAndUpdate(id, { estado: EstadoCredito.EN_PAGO })
      .exec();

    // Create Transaccion INGRESO
    await this.transaccionModel.create({
      codigo: `DES-${credito.codigo}-${Date.now()}`,
      tipo: TipoTransaccion.INGRESO,
      categoria: credito.banco,
      monto: montoDesembolsado,
      moneda: new Types.ObjectId('000000000000000000000000'), // placeholder
      fecha: fechaDesembolso,
      metodoPago: MetodoPago.TRANSFERENCIA,
      descripcion: `Desembolso crédito ${credito.codigo}`,
    });

    const result = await this.creditoModel.findById(id).exec();
    if (!result)
      throw new NotFoundException(
        'Crédito no encontrado después del desembolso',
      );
    return result;
  }

  async castigarCredito(id: string): Promise<Credito> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Crédito no encontrado');
    const credito = await this.creditoModel.findById(id).exec();
    if (!credito) throw new NotFoundException('Crédito no encontrado');
    if (
      credito.estado !== EstadoCredito.EN_PAGO &&
      credito.estado !== EstadoCredito.VENCIDO
    ) {
      throw new BadRequestException(
        'Solo se pueden castigar créditos en pago o vencidos',
      );
    }

    const updated = await this.creditoModel
      .findByIdAndUpdate(
        id,
        {
          estado: EstadoCredito.CASTIGADO,
          clasificacionRiesgo: ClasificacionRiesgo.PERDIDA,
        },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Crédito no encontrado');

    // Set all pending cuotas to VENCIDA
    await this.cuotaCreditoModel
      .updateMany(
        {
          credito: new Types.ObjectId(id),
          estado: { $in: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL] },
        },
        { estado: EstadoCuota.VENCIDA },
      )
      .exec();

    return updated;
  }
}
