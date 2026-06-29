import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePosicionMonetariaDto } from './dto/create-posicion.dto';
import { UpdatePosicionMonetariaDto } from './dto/update-posicion.dto';
import {
  PosicionMonetaria,
  PosicionMonetariaDocument,
} from './schema/posicion-monetaria.schema';
import { PosicionItem } from './types/posicion-monetaria.types';
import { TasaCambioService } from '../../nomencladores/tasa-cambio/tasa-cambio.service';
import { Banco, BancoDocument } from '../banco/schema/banco.schema';
import {
  CuentaCaja,
  CuentaCajaDocument,
} from '../caja/schema/cuenta-caja.schema';

@Injectable()
export class PosicionMonetariaService {
  constructor(
    @InjectModel(PosicionMonetaria.name)
    private posicionModel: Model<PosicionMonetariaDocument>,
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>,
    @InjectModel(CuentaCaja.name)
    private cuentaCajaModel: Model<CuentaCajaDocument>,
    private readonly tasaCambioService: TasaCambioService,
  ) {}

  private async getMonedaBase(): Promise<string | undefined> {
    try {
      const monedaCup = await this.bancoModel.db
        .model<{ _id: { toString(): string }; tipo_moneda: string }>('Moneda')
        .findOne({
          tipo_moneda: { $regex: /^cup$/i },
        })
        .exec();
      return monedaCup?._id?.toString();
    } catch {
      return undefined;
    }
  }

  async generar(
    createDto: CreatePosicionMonetariaDto,
  ): Promise<PosicionMonetaria> {
    const existente = await this.posicionModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe una posición monetaria con ese código',
      );

    const fecha = new Date(createDto.fecha);

    // Aggregate saldos by moneda from Banco
    interface SaldoAgg {
      _id: { toString(): string };
      total: number;
    }
    const saldosBanco = await this.bancoModel
      .aggregate<SaldoAgg>([
        { $match: { activo: true } },
        { $group: { _id: '$moneda', total: { $sum: '$saldoActual' } } },
      ])
      .exec();

    // Aggregate saldos by moneda from CuentaCaja
    const saldosCaja = await this.cuentaCajaModel
      .aggregate<SaldoAgg>([
        { $match: { activa: true } },
        { $group: { _id: '$moneda', total: { $sum: '$saldoActual' } } },
      ])
      .exec();

    // Combine by moneda
    const monedaMap = new Map<string, { bancos: number; cajas: number }>();

    for (const entry of saldosBanco) {
      const key = entry._id.toString();
      monedaMap.set(key, { bancos: entry.total, cajas: 0 });
    }

    for (const entry of saldosCaja) {
      const key = entry._id.toString();
      if (monedaMap.has(key)) {
        monedaMap.get(key)!.cajas = entry.total;
      } else {
        monedaMap.set(key, { bancos: 0, cajas: entry.total });
      }
    }

    // Find CUP moneda as base
    const monedaBaseId = await this.getMonedaBase();

    // Build posiciones with tasa conversion to base
    const posiciones: PosicionItem[] = [];

    for (const [monedaIdStr, saldos] of monedaMap.entries()) {
      const saldoTotal = saldos.bancos + saldos.cajas;

      let valorEnMonedaBase = saldoTotal;
      let tasaUsada = 1;

      // If moneda is not CUP, fetch tasa to convert to base
      if (monedaBaseId && monedaIdStr !== monedaBaseId) {
        try {
          const tasaDoc = await this.tasaCambioService.getVigente(
            monedaIdStr,
            monedaBaseId,
          );
          if (tasaDoc) {
            tasaUsada = tasaDoc.tasa;
            valorEnMonedaBase = Number((saldoTotal * tasaDoc.tasa).toFixed(2));
          }
        } catch {
          // No rate available, keep as is
        }
      }

      posiciones.push({
        moneda: monedaIdStr,
        saldoBancos: saldos.bancos,
        saldoCajas: saldos.cajas,
        saldoTotal,
        valorEnMonedaBase,
        tasaUsada,
      });
    }

    const totalMonedaBase = Number(
      posiciones.reduce((sum, p) => sum + p.valorEnMonedaBase, 0).toFixed(2),
    );

    const created = new this.posicionModel({
      codigo: createDto.codigo,
      fecha,
      posiciones,
      totalMonedaBase,
      observaciones: createDto.observaciones,
    });

    return created.save();
  }

  async findAll(): Promise<PosicionMonetaria[]> {
    return this.posicionModel.find().sort({ fecha: -1 }).exec();
  }

  async findOne(id: string): Promise<PosicionMonetaria> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Posición monetaria no encontrada');
    const doc = await this.posicionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Posición monetaria no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdatePosicionMonetariaDto,
  ): Promise<PosicionMonetaria> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Posición monetaria no encontrada');
    const updated = await this.posicionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException('Posición monetaria no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Posición monetaria no encontrada');
    const removed = await this.posicionModel.findByIdAndDelete(id).exec();
    if (!removed)
      throw new NotFoundException('Posición monetaria no encontrada');
    return { deleted: true };
  }

  async getComparativa(
    fecha1: string,
    fecha2: string,
  ): Promise<{
    fecha1: { fecha: Date; totalMonedaBase: number } | null;
    fecha2: { fecha: Date; totalMonedaBase: number } | null;
    diferencia: number | null;
  }> {
    const f1 = new Date(fecha1);
    const f2 = new Date(fecha2);

    const pos1 = await this.posicionModel
      .findOne({ fecha: { $lte: f1 } })
      .sort({ fecha: -1 })
      .exec();
    const pos2 = await this.posicionModel
      .findOne({ fecha: { $lte: f2 } })
      .sort({ fecha: -1 })
      .exec();

    return {
      fecha1: pos1
        ? { fecha: pos1.fecha, totalMonedaBase: pos1.totalMonedaBase }
        : null,
      fecha2: pos2
        ? { fecha: pos2.fecha, totalMonedaBase: pos2.totalMonedaBase }
        : null,
      diferencia:
        pos1 && pos2
          ? Number((pos2.totalMonedaBase - pos1.totalMonedaBase).toFixed(2))
          : null,
    };
  }

  async getHistorico(
    desde?: string,
    hasta?: string,
  ): Promise<PosicionMonetaria[]> {
    const query: Record<string, unknown> = {};
    if (desde) query.fecha = { $gte: new Date(desde) } as unknown;
    if (hasta)
      query.fecha = {
        ...(query.fecha as object),
        $lte: new Date(hasta),
      } as unknown;
    return this.posicionModel.find(query).sort({ fecha: 1 }).exec();
  }
}
