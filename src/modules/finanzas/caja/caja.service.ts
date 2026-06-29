import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';
import { CreateArqueoCajaDto } from './dto/create-arqueo-caja.dto';
import { CreateCuentaCajaDto } from './dto/create-cuenta-caja.dto';
import { UpdateCuentaCajaDto } from './dto/update-cuenta-caja.dto';
import { ReponerFondoFijoDto } from './dto/reponer-fondo-fijo.dto';
import { MovimientoCaja, MovimientoCajaDocument } from './schema/caja.schema';
import { ArqueoCaja, ArqueoCajaDocument } from './schema/arqueo-caja.schema';
import { CuentaCaja, CuentaCajaDocument } from './schema/cuenta-caja.schema';
import { Banco, BancoDocument } from '../banco/schema/banco.schema';
import {
  TipoMovimientoCaja,
  ConceptoCaja,
  EstadoArqueo,
} from './types/caja.types';

@Injectable()
export class CajaService {
  constructor(
    @InjectModel(MovimientoCaja.name)
    private cajaModel: Model<MovimientoCajaDocument>,
    @InjectModel(ArqueoCaja.name)
    private arqueoModel: Model<ArqueoCajaDocument>,
    @InjectModel(CuentaCaja.name)
    private cuentaCajaModel: Model<CuentaCajaDocument>,
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>,
  ) {}

  // ──────────────────────────────────────────────
  //  CuentaCaja CRUD
  // ──────────────────────────────────────────────

  async createCuentaCaja(dto: CreateCuentaCajaDto): Promise<CuentaCaja> {
    const existente = await this.cuentaCajaModel
      .findOne({ codigo: dto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe una cuenta de caja con ese código',
      );
    const saldoInicial = dto.saldoInicial ?? 0;
    const created = new this.cuentaCajaModel({
      ...dto,
      saldoInicial,
      saldoActual: saldoInicial,
    });
    return created.save();
  }

  async findAllCuentasCaja(): Promise<CuentaCaja[]> {
    return this.cuentaCajaModel
      .find()
      .populate('moneda')
      .sort({ codigo: 1 })
      .exec();
  }

  async findOneCuentaCaja(id: string): Promise<CuentaCaja> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta de caja no encontrada');
    const doc = await this.cuentaCajaModel
      .findById(id)
      .populate('moneda')
      .exec();
    if (!doc) throw new NotFoundException('Cuenta de caja no encontrada');
    return doc;
  }

  async updateCuentaCaja(
    id: string,
    dto: UpdateCuentaCajaDto,
  ): Promise<CuentaCaja> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta de caja no encontrada');
    const updated = await this.cuentaCajaModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Cuenta de caja no encontrada');
    return updated;
  }

  async removeCuentaCaja(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta de caja no encontrada');
    const removed = await this.cuentaCajaModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Cuenta de caja no encontrada');
    return { deleted: true };
  }

  async getSaldosCajas(): Promise<CuentaCaja[]> {
    return this.cuentaCajaModel
      .find({ activa: true })
      .populate('moneda')
      .sort({ codigo: 1 })
      .exec();
  }

  // ──────────────────────────────────────────────
  //  Fondo Fijo
  // ──────────────────────────────────────────────

  async reponerFondoFijo(
    cajaId: string,
    dto: ReponerFondoFijoDto,
  ): Promise<CuentaCaja> {
    if (!isValidObjectId(cajaId))
      throw new NotFoundException('Cuenta de caja no encontrada');
    const cuenta = await this.cuentaCajaModel.findById(cajaId).exec();
    if (!cuenta) throw new NotFoundException('Cuenta de caja no encontrada');

    let monto = dto.monto;
    if (!monto) {
      monto = (cuenta.montoFondoFijo || 0) - cuenta.saldoActual;
      if (monto <= 0)
        throw new BadRequestException('El fondo fijo no necesita reposición');
    }

    cuenta.saldoActual += monto;
    await cuenta.save();

    const movimiento = new this.cajaModel({
      codigo: `REP-${Date.now()}`,
      tipo: TipoMovimientoCaja.INGRESO,
      concepto: ConceptoCaja.FONDO_FIJO_REPOSICION,
      descripcion: 'Reposición de fondo fijo',
      monto,
      fecha: new Date(),
      cajaId: cuenta._id,
      referencia: dto.referencia,
    });
    await movimiento.save();

    if (cuenta.cuentaBancariaReposicion) {
      const banco = await this.bancoModel
        .findById(cuenta.cuentaBancariaReposicion)
        .exec();
      if (banco) {
        banco.saldoActual -= monto;
        await banco.save();
      }
    }

    return cuenta;
  }

  async ajustarSaldoCaja(cajaId: string, monto: number): Promise<CuentaCaja> {
    if (!isValidObjectId(cajaId))
      throw new NotFoundException('Cuenta de caja no encontrada');
    const cuenta = await this.cuentaCajaModel.findById(cajaId).exec();
    if (!cuenta) throw new NotFoundException('Cuenta de caja no encontrada');
    cuenta.saldoActual += monto;
    return cuenta.save();
  }

  // ──────────────────────────────────────────────
  //  Movimientos
  // ──────────────────────────────────────────────

  async createMovimiento(
    createDto: CreateMovimientoCajaDto,
  ): Promise<MovimientoCaja> {
    const existente = await this.cajaModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe un movimiento con ese código');

    if (createDto.cajaId) {
      if (!isValidObjectId(createDto.cajaId))
        throw new NotFoundException('Cuenta de caja no encontrada');
      const cuenta = await this.cuentaCajaModel
        .findById(createDto.cajaId)
        .exec();
      if (!cuenta) throw new NotFoundException('Cuenta de caja no encontrada');

      const delta =
        createDto.tipo === TipoMovimientoCaja.EGRESO
          ? -createDto.monto
          : createDto.monto;
      cuenta.saldoActual += delta;
      await cuenta.save();
    }

    const created = new this.cajaModel(createDto);
    return created.save();
  }

  async findAll(cajaId?: string): Promise<MovimientoCaja[]> {
    return this.cajaModel
      .find(cajaId ? { cajaId: new Types.ObjectId(cajaId) } : {})
      .sort({ fecha: -1 })
      .exec();
  }

  async findOne(id: string): Promise<MovimientoCaja> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Movimiento de caja no encontrado');
    const doc = await this.cajaModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Movimiento de caja no encontrado');
    return doc;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Movimiento de caja no encontrado');
    const removed = await this.cajaModel.findByIdAndDelete(id).exec();
    if (!removed)
      throw new NotFoundException('Movimiento de caja no encontrado');
    return { deleted: true };
  }

  // ──────────────────────────────────────────────
  //  Saldos & Reportes
  // ──────────────────────────────────────────────

  async getSaldoActual(cajaId?: string): Promise<{ saldo: number }> {
    const cajaFilter = cajaId ? { cajaId: new Types.ObjectId(cajaId) } : {};
    const ingresos = await this.cajaModel
      .aggregate<{ _id: null; total: number }>([
        {
          $match: {
            tipo: {
              $in: [TipoMovimientoCaja.APERTURA, TipoMovimientoCaja.INGRESO],
            },
            ...cajaFilter,
          },
        },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ])
      .exec();
    const egresos = await this.cajaModel
      .aggregate<{ _id: null; total: number }>([
        {
          $match: {
            tipo: TipoMovimientoCaja.EGRESO,
            ...cajaFilter,
          },
        },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ])
      .exec();
    const totalIngresos = ingresos.length > 0 ? ingresos[0].total : 0;
    const totalEgresos = egresos.length > 0 ? egresos[0].total : 0;
    return { saldo: totalIngresos - totalEgresos };
  }

  async getMovimientosDelDia(
    fecha?: string,
    cajaId?: string,
  ): Promise<MovimientoCaja[]> {
    const dia = fecha ? new Date(fecha) : new Date();
    const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
    const fin = new Date(inicio.getTime() + 86400000);
    return this.cajaModel
      .find({
        fecha: { $gte: inicio, $lt: fin },
        ...(cajaId ? { cajaId: new Types.ObjectId(cajaId) } : {}),
      })
      .sort({ fecha: -1 })
      .exec();
  }

  async getResumenPorConcepto(
    desde?: string,
    hasta?: string,
    cajaId?: string,
  ): Promise<{ _id: string; total: number; cantidad: number }[]> {
    const filter: Record<string, unknown> = {};
    if (desde && hasta) {
      filter.fecha = { $gte: new Date(desde), $lte: new Date(hasta) };
    }
    if (cajaId) {
      filter.cajaId = new Types.ObjectId(cajaId);
    }
    return this.cajaModel
      .aggregate<{ _id: string; total: number; cantidad: number }>([
        { $match: filter },
        {
          $group: {
            _id: '$concepto',
            total: { $sum: '$monto' },
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ])
      .exec();
  }

  // ──────────────────────────────────────────────
  //  Arqueos
  // ──────────────────────────────────────────────

  async realizarArqueo(arqueoDto: CreateArqueoCajaDto): Promise<ArqueoCaja> {
    const { saldo } = await this.getSaldoActual(arqueoDto.cajaId);
    const diferencia = Number((arqueoDto.efectivoContado - saldo).toFixed(2));
    const estado =
      diferencia === 0 ? EstadoArqueo.CUADRADO : EstadoArqueo.DIFERENCIA;
    const arqueo = new this.arqueoModel({
      fecha: new Date(),
      cajaId: arqueoDto.cajaId,
      saldoEsperado: saldo,
      efectivoContado: arqueoDto.efectivoContado,
      diferencia,
      estado,
      observaciones: arqueoDto.observaciones,
      realizadoPor: arqueoDto.realizadoPor,
    });
    return arqueo.save();
  }

  async getArqueos(): Promise<ArqueoCaja[]> {
    return this.arqueoModel.find().sort({ fecha: -1 }).exec();
  }
}
