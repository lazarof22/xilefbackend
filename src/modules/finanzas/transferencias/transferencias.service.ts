import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { UpdateTransferenciaDto } from './dto/update-transferencia.dto';
import { AplicarTransferenciaDto } from './dto/aplicar-transferencia.dto';
import {
  Transferencia,
  TransferenciaDocument,
} from './schema/transferencia.schema';
import {
  TipoCuentaRef,
  EstadoTransferencia,
  ResumenTransferencias,
} from './types/transferencia.types';
import { Banco, BancoDocument } from '../banco/schema/banco.schema';
import {
  Transaccion,
  TransaccionDocument,
} from '../transaccion/schema/transaccion.schema';
import {
  TipoTransaccion,
  MetodoPago,
} from '../transaccion/types/transaccion.types';
import {
  MovimientoCaja,
  MovimientoCajaDocument,
} from '../caja/schema/caja.schema';
import { TipoMovimientoCaja, ConceptoCaja } from '../caja/types/caja.types';

@Injectable()
export class TransferenciasService {
  private readonly logger = new Logger(TransferenciasService.name);

  constructor(
    @InjectModel(Transferencia.name)
    private transferenciaModel: Model<TransferenciaDocument>,
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>,
    @InjectModel(Transaccion.name)
    private transaccionModel: Model<TransaccionDocument>,
    @InjectModel(MovimientoCaja.name)
    private cajaModel: Model<MovimientoCajaDocument>,
  ) {}

  async create(createDto: CreateTransferenciaDto): Promise<Transferencia> {
    // Validate unique code
    const existente = await this.transferenciaModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe una transferencia con ese código',
      );

    // Validate origen != destino (same type AND same id)
    if (
      createDto.origenCuentaTipo === createDto.destinoCuentaTipo &&
      createDto.origenCuentaId === createDto.destinoCuentaId
    ) {
      throw new BadRequestException(
        'La cuenta origen y destino no pueden ser la misma',
      );
    }

    // Validate that origen and destino account IDs exist
    await this.validateAccountExists(
      createDto.origenCuentaTipo,
      createDto.origenCuentaId,
    );
    await this.validateAccountExists(
      createDto.destinoCuentaTipo,
      createDto.destinoCuentaId,
    );

    // Check balance sufficiency for origin account
    await this.checkBalanceSufficiency(
      createDto.origenCuentaTipo,
      createDto.origenCuentaId,
      createDto.monto + (createDto.comision ?? 0),
    );

    const created = new this.transferenciaModel({
      ...createDto,
      comision: createDto.comision ?? 0,
      fecha: new Date(createDto.fecha),
    });
    return created.save();
  }

  async findAll(): Promise<Transferencia[]> {
    return this.transferenciaModel
      .find()
      .populate('moneda')
      .sort({ fecha: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Transferencia> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transferencia no encontrada');
    const doc = await this.transferenciaModel
      .findById(id)
      .populate('moneda')
      .exec();
    if (!doc) throw new NotFoundException('Transferencia no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateTransferenciaDto,
  ): Promise<Transferencia> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transferencia no encontrada');
    const data: Record<string, unknown> = { ...updateDto };
    if (updateDto.fecha) data.fecha = new Date(updateDto.fecha);

    const updated = await this.transferenciaModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Transferencia no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transferencia no encontrada');
    const transferencia = await this.transferenciaModel.findById(id).exec();
    if (!transferencia)
      throw new NotFoundException('Transferencia no encontrada');
    if (transferencia.estado === EstadoTransferencia.APLICADA) {
      throw new BadRequestException(
        'No se puede eliminar una transferencia aplicada. Anúlela primero.',
      );
    }
    const removed = await this.transferenciaModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Transferencia no encontrada');
    return { deleted: true };
  }

  async aplicar(
    id: string,
    dto: AplicarTransferenciaDto,
  ): Promise<Transferencia> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transferencia no encontrada');

    const transferencia = await this.transferenciaModel.findById(id).exec();
    if (!transferencia)
      throw new NotFoundException('Transferencia no encontrada');
    if (transferencia.estado !== EstadoTransferencia.PENDIENTE) {
      throw new BadRequestException(
        `No se puede aplicar una transferencia en estado "${transferencia.estado}". Debe estar "pendiente".`,
      );
    }

    const montoTotal = transferencia.monto + transferencia.comision;

    // Check balance sufficiency again (it may have changed since creation)
    await this.checkBalanceSufficiency(
      transferencia.origenCuentaTipo,
      transferencia.origenCuentaId.toString(),
      montoTotal,
    );

    // 1. Decrement origin account balance
    await this.updateAccountBalance(
      transferencia.origenCuentaTipo,
      transferencia.origenCuentaId.toString(),
      -montoTotal,
    );

    // 2. Increment destination account balance
    await this.updateAccountBalance(
      transferencia.destinoCuentaTipo,
      transferencia.destinoCuentaId.toString(),
      transferencia.monto,
    );

    // 3. Create Transaccion pair: EGRESO from origin
    await this.createTransaccionRecord(
      transferencia,
      TipoTransaccion.EGRESO,
      dto.referencia,
    );

    // 4. Create Transaccion pair: INGRESO to destination
    await this.createTransaccionRecord(
      transferencia,
      TipoTransaccion.INGRESO,
      dto.referencia,
    );

    // 5. Update estado and fechaAplicacion
    const fechaAplicacion = dto.fechaAplicacion
      ? new Date(dto.fechaAplicacion)
      : new Date();
    if (dto.referencia) transferencia.comprobante = dto.referencia;
    transferencia.estado = EstadoTransferencia.APLICADA;
    transferencia.fechaAplicacion = fechaAplicacion;

    return transferencia.save();
  }

  async rechazar(id: string, motivo: string): Promise<Transferencia> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transferencia no encontrada');
    const transferencia = await this.transferenciaModel.findById(id).exec();
    if (!transferencia)
      throw new NotFoundException('Transferencia no encontrada');
    if (transferencia.estado !== EstadoTransferencia.PENDIENTE) {
      throw new BadRequestException(
        `No se puede rechazar una transferencia en estado "${transferencia.estado}". Debe estar "pendiente".`,
      );
    }

    transferencia.estado = EstadoTransferencia.RECHAZADA;
    transferencia.motivoRechazo = motivo;
    return transferencia.save();
  }

  async anular(id: string): Promise<Transferencia> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Transferencia no encontrada');
    const transferencia = await this.transferenciaModel.findById(id).exec();
    if (!transferencia)
      throw new NotFoundException('Transferencia no encontrada');
    if (transferencia.estado === EstadoTransferencia.PENDIENTE) {
      // Just mark as anulada, no balance changes needed
      transferencia.estado = EstadoTransferencia.ANULADA;
      return transferencia.save();
    }
    if (transferencia.estado !== EstadoTransferencia.APLICADA) {
      throw new BadRequestException(
        `No se puede anular una transferencia en estado "${transferencia.estado}".`,
      );
    }

    const montoTotal = transferencia.monto + transferencia.comision;

    // Reverse: increment origin, decrement destination
    await this.updateAccountBalance(
      transferencia.origenCuentaTipo,
      transferencia.origenCuentaId.toString(),
      montoTotal, // restore origin
    );

    await this.updateAccountBalance(
      transferencia.destinoCuentaTipo,
      transferencia.destinoCuentaId.toString(),
      -transferencia.monto, // revert destination
    );

    transferencia.estado = EstadoTransferencia.ANULADA;
    return transferencia.save();
  }

  async getAplicadas(): Promise<Transferencia[]> {
    return this.transferenciaModel
      .find({ estado: EstadoTransferencia.APLICADA })
      .populate('moneda')
      .sort({ fechaAplicacion: -1 })
      .exec();
  }

  async getPorPeriodo(desde: string, hasta: string): Promise<Transferencia[]> {
    return this.transferenciaModel
      .find({
        fecha: { $gte: new Date(desde), $lte: new Date(hasta) },
      })
      .populate('moneda')
      .sort({ fecha: -1 })
      .exec();
  }

  async getResumen(
    desde?: string,
    hasta?: string,
  ): Promise<ResumenTransferencias> {
    const filtro: Record<string, unknown> = {};
    if (desde && hasta) {
      filtro.fecha = { $gte: new Date(desde), $lte: new Date(hasta) };
    }

    const total = await this.transferenciaModel
      .find(filtro)
      .countDocuments()
      .exec();

    interface AggSum {
      _id: null;
      total: number;
    }
    interface AggGroup {
      _id: string;
      cantidad: number;
      monto: number;
    }

    const montoTotal = await this.transferenciaModel
      .aggregate<AggSum>([
        { $match: filtro },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ])
      .exec();

    const porTipo = await this.transferenciaModel
      .aggregate<AggGroup>([
        { $match: filtro },
        {
          $group: {
            _id: '$tipo',
            cantidad: { $sum: 1 },
            monto: { $sum: '$monto' },
          },
        },
      ])
      .exec();

    const porEstado = await this.transferenciaModel
      .aggregate<AggGroup>([
        { $match: filtro },
        {
          $group: {
            _id: '$estado',
            cantidad: { $sum: 1 },
            monto: { $sum: '$monto' },
          },
        },
      ])
      .exec();

    const formatGroup = (
      items: AggGroup[],
    ): Record<string, { cantidad: number; monto: number }> =>
      items.reduce(
        (acc, item) => {
          acc[item._id] = { cantidad: item.cantidad, monto: item.monto };
          return acc;
        },
        {} as Record<string, { cantidad: number; monto: number }>,
      );

    return {
      totalTransferencias: total,
      totalMonto: montoTotal.length > 0 ? montoTotal[0].total : 0,
      porTipo: formatGroup(porTipo),
      porEstado: formatGroup(porEstado),
    };
  }

  // ── Private helpers ──────────────────────────────────────────

  private async validateAccountExists(
    tipo: TipoCuentaRef,
    id: string,
  ): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID de cuenta ${tipo} inválido`);
    }

    if (tipo === TipoCuentaRef.BANCO) {
      const exists = await this.bancoModel.findById(id).exec();
      if (!exists)
        throw new BadRequestException('Cuenta bancaria origen no encontrada');
    } else if (tipo === TipoCuentaRef.CAJA) {
      const exists = await this.cajaModel.findById(id).exec();
      if (!exists)
        throw new BadRequestException('Cuenta de caja origen no encontrada');
    }
  }

  private async checkBalanceSufficiency(
    tipo: TipoCuentaRef,
    id: string,
    montoRequerido: number,
  ): Promise<void> {
    if (tipo === TipoCuentaRef.BANCO) {
      const cuenta = await this.bancoModel.findById(id).exec();
      if (!cuenta) throw new NotFoundException('Cuenta bancaria no encontrada');
      if (cuenta.saldoActual < montoRequerido) {
        throw new BadRequestException(
          `Saldo insuficiente en la cuenta bancaria. Saldo actual: ${cuenta.saldoActual}, requerido: ${montoRequerido}`,
        );
      }
    } else if (tipo === TipoCuentaRef.CAJA) {
      const saldo = await this.getCajaSaldo(id);
      if (saldo < montoRequerido) {
        throw new BadRequestException(
          `Saldo insuficiente en la caja. Saldo actual: ${saldo}, requerido: ${montoRequerido}`,
        );
      }
    }
  }

  private async updateAccountBalance(
    tipo: TipoCuentaRef,
    id: string,
    delta: number,
  ): Promise<void> {
    if (tipo === TipoCuentaRef.BANCO) {
      await this.bancoModel
        .findByIdAndUpdate(id, { $inc: { saldoActual: delta } })
        .exec();
    } else if (tipo === TipoCuentaRef.CAJA) {
      // Create a MovimientoCaja record to track the cash change
      const tipoMov =
        delta > 0 ? TipoMovimientoCaja.INGRESO : TipoMovimientoCaja.EGRESO;
      await this.cajaModel.create({
        codigo: `TRF-${new Types.ObjectId().toString().slice(-8).toUpperCase()}`,
        cajaId: new Types.ObjectId(id),
        tipo: tipoMov,
        concepto: ConceptoCaja.OTROS,
        descripcion: `Transferencia ${delta > 0 ? 'desde' : 'hacia'} cuenta bancaria`,
        monto: Math.abs(delta),
        fecha: new Date(),
      });
    }
  }

  private async getCajaSaldo(id: string): Promise<number> {
    const cajaObjectId = new Types.ObjectId(id);
    interface CajaSum {
      _id: null;
      total: number;
    }

    const ingresos = await this.cajaModel
      .aggregate<CajaSum>([
        {
          $match: {
            cajaId: cajaObjectId,
            tipo: {
              $in: [TipoMovimientoCaja.APERTURA, TipoMovimientoCaja.INGRESO],
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ])
      .exec();

    const egresos = await this.cajaModel
      .aggregate<CajaSum>([
        {
          $match: {
            cajaId: cajaObjectId,
            tipo: TipoMovimientoCaja.EGRESO,
          },
        },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ])
      .exec();

    const totalIngresos = ingresos.length > 0 ? ingresos[0].total : 0;
    const totalEgresos = egresos.length > 0 ? egresos[0].total : 0;
    return totalIngresos - totalEgresos;
  }

  private async createTransaccionRecord(
    transferencia: TransferenciaDocument,
    tipo: TipoTransaccion,
    referencia?: string,
  ): Promise<void> {
    const esEgreso = tipo === TipoTransaccion.EGRESO;
    const cuentaRef = esEgreso
      ? transferencia.origenCuentaId
      : transferencia.destinoCuentaId;
    const cuentaTipo = esEgreso
      ? transferencia.origenCuentaTipo
      : transferencia.destinoCuentaTipo;

    const descripcion = `Transferencia ${esEgreso ? 'desde' : 'hacia'} ${cuentaTipo}: ${transferencia.codigo}`;

    await this.transaccionModel.create({
      codigo: `${transferencia.codigo}-${esEgreso ? 'EGR' : 'ING'}`,
      tipo,
      monto: transferencia.monto,
      moneda: transferencia.moneda,
      fecha: transferencia.fechaAplicacion ?? transferencia.fecha,
      metodoPago: MetodoPago.TRANSFERENCIA,
      referencia: referencia ?? transferencia.codigo,
      descripcion,
      cuentaBancaria:
        cuentaTipo === TipoCuentaRef.BANCO ? cuentaRef : undefined,
    });
  }
}
