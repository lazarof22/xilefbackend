import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';
import { UpdateConciliacionDto } from './dto/update-conciliacion.dto';
import {
  Conciliacion,
  ConciliacionDocument,
} from './schema/conciliacion.schema';
import {
  ExtractoMovimiento,
  ExtractoMovimientoDocument,
} from './schema/extracto-movimiento.schema';
import {
  EstadoConciliacion,
  EstadoExtracto,
  TipoExtracto,
} from './types/conciliacion.types';

@Injectable()
export class ConciliacionService {
  constructor(
    @InjectModel(Conciliacion.name)
    private conciliacionModel: Model<ConciliacionDocument>,
    @InjectModel(ExtractoMovimiento.name)
    private extractoModel: Model<ExtractoMovimientoDocument>,
  ) {}

  async create(createDto: CreateConciliacionDto): Promise<Conciliacion> {
    const existente = await this.conciliacionModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe una conciliación con ese código',
      );

    const [mes, anio] = createDto.periodo.split('-');
    const fechaInicio = new Date(parseInt(anio), parseInt(mes) - 1, 1);
    const fechaFin = new Date(parseInt(anio), parseInt(mes), 0);

    const created = new this.conciliacionModel({
      ...createDto,
      diferencia: createDto.saldoBanco - createDto.saldoLibros,
      fechaInicio,
      fechaFin,
    });
    return created.save();
  }

  async findAll(): Promise<Conciliacion[]> {
    return this.conciliacionModel
      .find()
      .populate('cuentaBancaria')
      .sort({ fechaFin: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Conciliacion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Conciliación no encontrada');
    const doc = await this.conciliacionModel
      .findById(id)
      .populate('cuentaBancaria')
      .exec();
    if (!doc) throw new NotFoundException('Conciliación no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateConciliacionDto,
  ): Promise<Conciliacion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Conciliación no encontrada');
    const data: any = { ...updateDto };
    if (
      updateDto.saldoBanco !== undefined &&
      updateDto.saldoLibros !== undefined
    ) {
      data.diferencia = updateDto.saldoBanco - updateDto.saldoLibros;
    } else if (updateDto.saldoBanco !== undefined) {
      const actual = await this.conciliacionModel.findById(id).exec();
      data.diferencia = updateDto.saldoBanco - (actual?.saldoLibros ?? 0);
    } else if (updateDto.saldoLibros !== undefined) {
      const actual = await this.conciliacionModel.findById(id).exec();
      data.diferencia = (actual?.saldoBanco ?? 0) - updateDto.saldoLibros;
    }
    const updated = await this.conciliacionModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Conciliación no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Conciliación no encontrada');
    const removed = await this.conciliacionModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Conciliación no encontrada');
    return { deleted: true };
  }

  async procesar(id: string): Promise<Conciliacion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Conciliación no encontrada');
    const conciliacion = await this.conciliacionModel.findById(id).exec();
    if (!conciliacion)
      throw new NotFoundException('Conciliación no encontrada');

    conciliacion.diferencia =
      conciliacion.saldoBanco - conciliacion.saldoLibros;
    conciliacion.estado =
      conciliacion.diferencia === 0
        ? EstadoConciliacion.CONCILIADA
        : EstadoConciliacion.DIFERENCIA;

    return conciliacion.save();
  }

  async getPendientes(): Promise<Conciliacion[]> {
    return this.conciliacionModel
      .find({
        estado: {
          $in: [EstadoConciliacion.PENDIENTE, EstadoConciliacion.EN_PROCESO],
        },
      })
      .populate('cuentaBancaria')
      .sort({ fechaFin: -1 })
      .exec();
  }

  // ── Extracto methods ────────────────────────────────────────────────

  async importarExtracto(
    conciliacionId: string,
    partidas: {
      fecha: Date;
      descripcion?: string;
      monto: number;
      tipo: TipoExtracto;
      numeroReferencia?: string;
    }[],
  ): Promise<{ count: number }> {
    if (!isValidObjectId(conciliacionId))
      throw new NotFoundException('Conciliación no encontrada');
    const conciliacion = await this.conciliacionModel
      .findById(conciliacionId)
      .exec();
    if (!conciliacion)
      throw new NotFoundException('Conciliación no encontrada');

    const extractos: ExtractoMovimientoDocument[] = [];
    for (const partida of partidas) {
      const ultimo = await this.extractoModel
        .findOne()
        .sort({ codigo: -1 })
        .exec();
      const nextNum = ultimo
        ? parseInt(ultimo.codigo.replace('EXT-', ''), 10) + 1
        : 1;
      const codigo = `EXT-${String(nextNum).padStart(6, '0')}`;

      const extracto = new this.extractoModel({
        codigo,
        cuentaBancaria: conciliacion.cuentaBancaria,
        conciliacion: conciliacion._id,
        fecha: partida.fecha,
        descripcion: partida.descripcion,
        monto: partida.monto,
        tipo: partida.tipo,
        numeroReferencia: partida.numeroReferencia,
      });
      extractos.push(extracto);
    }

    const saved = await this.extractoModel.insertMany(extractos);
    const extractoIds = saved.map((e) => e._id);

    await this.conciliacionModel
      .findByIdAndUpdate(conciliacionId, {
        $push: { extractos: { $each: extractoIds } },
      })
      .exec();

    return { count: saved.length };
  }

  async getExtractosPendientes(
    conciliacionId: string,
  ): Promise<ExtractoMovimiento[]> {
    if (!isValidObjectId(conciliacionId))
      throw new NotFoundException('Conciliación no encontrada');
    return this.extractoModel
      .find({
        conciliacion: conciliacionId,
        estado: EstadoExtracto.PENDIENTE,
      })
      .populate('transaccionVinculada')
      .sort({ fecha: -1 })
      .exec();
  }

  async conciliarMovimiento(
    extractoId: string,
    transaccionId: string,
  ): Promise<ExtractoMovimiento> {
    if (!isValidObjectId(extractoId))
      throw new NotFoundException('Extracto no encontrado');
    if (!isValidObjectId(transaccionId))
      throw new NotFoundException('Transacción no encontrada');

    const extracto = await this.extractoModel.findById(extractoId).exec();
    if (!extracto) throw new NotFoundException('Extracto no encontrado');
    if (extracto.estado === EstadoExtracto.CONCILIADO) {
      throw new BadRequestException('El extracto ya está conciliado');
    }

    extracto.transaccionVinculada = new Types.ObjectId(transaccionId);
    extracto.estado = EstadoExtracto.CONCILIADO;
    return extracto.save();
  }

  async autoConciliar(
    conciliacionId: string,
  ): Promise<{ conciliados: number }> {
    if (!isValidObjectId(conciliacionId))
      throw new NotFoundException('Conciliación no encontrada');
    const conciliacion = await this.conciliacionModel
      .findById(conciliacionId)
      .exec();
    if (!conciliacion)
      throw new NotFoundException('Conciliación no encontrada');

    const extractos = await this.extractoModel
      .find({
        conciliacion: conciliacionId,
        estado: EstadoExtracto.PENDIENTE,
      })
      .exec();

    const { cuentaBancaria } = conciliacion;
    const TransaccionModel: Model<any> =
      this.extractoModel.db.model('Transaccion');

    let conciliados = 0;
    for (const extracto of extractos) {
      const tresDiasAntes = new Date(extracto.fecha.getTime() - 3 * 86400000);
      const tresDiasDespues = new Date(extracto.fecha.getTime() + 3 * 86400000);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const transaccion = await TransaccionModel.findOne({
        cuentaBancaria: cuentaBancaria,
        monto: extracto.monto,
        fecha: { $gte: tresDiasAntes, $lte: tresDiasDespues },
      }).exec();

      if (transaccion) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        extracto.transaccionVinculada = transaccion._id as Types.ObjectId;
        extracto.estado = EstadoExtracto.CONCILIADO;
        await extracto.save();
        conciliados++;
      }
    }

    return { conciliados };
  }

  async getResumenConciliacion(conciliacionId: string): Promise<{
    totalExtractos: number;
    pendientes: number;
    conciliados: number;
    ignorados: number;
    montoTotalDebito: number;
    montoTotalCredito: number;
  }> {
    if (!isValidObjectId(conciliacionId))
      throw new NotFoundException('Conciliación no encontrada');

    type ResumenRow = {
      totalExtractos: number;
      pendientes: number;
      conciliados: number;
      ignorados: number;
      montoTotalDebito: number;
      montoTotalCredito: number;
    };

    const rows = await this.extractoModel
      .aggregate<ResumenRow>([
        { $match: { conciliacion: new Types.ObjectId(conciliacionId) } },
        {
          $group: {
            _id: null,
            totalExtractos: { $sum: 1 },
            pendientes: {
              $sum: {
                $cond: [{ $eq: ['$estado', EstadoExtracto.PENDIENTE] }, 1, 0],
              },
            },
            conciliados: {
              $sum: {
                $cond: [{ $eq: ['$estado', EstadoExtracto.CONCILIADO] }, 1, 0],
              },
            },
            ignorados: {
              $sum: {
                $cond: [{ $eq: ['$estado', EstadoExtracto.IGNORADO] }, 1, 0],
              },
            },
            montoTotalDebito: {
              $sum: {
                $cond: [{ $eq: ['$tipo', TipoExtracto.DEBITO] }, '$monto', 0],
              },
            },
            montoTotalCredito: {
              $sum: {
                $cond: [{ $eq: ['$tipo', TipoExtracto.CREDITO] }, '$monto', 0],
              },
            },
          },
        },
      ])
      .exec();

    const resumen = rows[0];
    return (
      resumen ?? {
        totalExtractos: 0,
        pendientes: 0,
        conciliados: 0,
        ignorados: 0,
        montoTotalDebito: 0,
        montoTotalCredito: 0,
      }
    );
  }
}
