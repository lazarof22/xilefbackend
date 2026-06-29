import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateRedistribucionDto } from './dto/create-redistribucion.dto';
import { UpdateRedistribucionDto } from './dto/update-redistribucion.dto';
import {
  Redistribucion,
  RedistribucionDocument,
} from './schema/redistribucion.schema';
import { EstadoRedistribucion } from './types/redistribucion.types';

@Injectable()
export class RedistribucionRecursosService {
  constructor(
    @InjectModel(Redistribucion.name)
    private redistribucionModel: Model<RedistribucionDocument>,
  ) {}

  async create(createDto: CreateRedistribucionDto): Promise<Redistribucion> {
    const existente = await this.redistribucionModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe una redistribución con ese código',
      );

    // Validate ΣORIGEN === ΣDESTINO === montoTotal
    const totalOrigen = createDto.items
      .filter((i) => i.accion === 'ORIGEN')
      .reduce((sum, i) => sum + i.monto, 0);
    const totalDestino = createDto.items
      .filter((i) => i.accion === 'DESTINO')
      .reduce((sum, i) => sum + i.monto, 0);

    if (totalOrigen !== createDto.montoTotal) {
      throw new BadRequestException(
        `La suma de ORIGEN (${totalOrigen}) debe ser igual al montoTotal (${createDto.montoTotal})`,
      );
    }
    if (totalDestino !== createDto.montoTotal) {
      throw new BadRequestException(
        `La suma de DESTINO (${totalDestino}) debe ser igual al montoTotal (${createDto.montoTotal})`,
      );
    }
    if (totalOrigen !== totalDestino) {
      throw new BadRequestException(
        `La suma de ORIGEN (${totalOrigen}) debe coincidir con la suma de DESTINO (${totalDestino})`,
      );
    }

    const created = new this.redistribucionModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Redistribucion[]> {
    return this.redistribucionModel.find().sort({ fecha: -1 }).exec();
  }

  async findOne(id: string): Promise<Redistribucion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Redistribución no encontrada');
    const doc = await this.redistribucionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Redistribución no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateRedistribucionDto,
  ): Promise<Redistribucion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Redistribución no encontrada');
    const updated = await this.redistribucionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Redistribución no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Redistribución no encontrada');
    const doc = await this.redistribucionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Redistribución no encontrada');
    if (doc.estado === EstadoRedistribucion.EJECUTADA) {
      throw new BadRequestException(
        'No se puede eliminar una redistribución ya ejecutada',
      );
    }
    const removed = await this.redistribucionModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Redistribución no encontrada');
    return { deleted: true };
  }

  async getPendientes(): Promise<Redistribucion[]> {
    return this.redistribucionModel
      .find({
        estado: {
          $in: [EstadoRedistribucion.PENDIENTE, EstadoRedistribucion.APROBADA],
        },
      })
      .sort({ fecha: -1 })
      .exec();
  }

  async aprobar(id: string, aprobadoPor: string): Promise<Redistribucion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Redistribución no encontrada');
    if (!isValidObjectId(aprobadoPor))
      throw new BadRequestException('ID de aprobador inválido');

    const doc = await this.redistribucionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Redistribución no encontrada');
    if (doc.estado !== EstadoRedistribucion.PENDIENTE) {
      throw new BadRequestException(
        `No se puede aprobar una redistribución en estado "${doc.estado}"`,
      );
    }

    doc.estado = EstadoRedistribucion.APROBADA;
    doc.aprobadoPor = new Types.ObjectId(aprobadoPor);
    return doc.save();
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  async ejecutar(id: string): Promise<Redistribucion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Redistribución no encontrada');
    const doc = await this.redistribucionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Redistribución no encontrada');

    if (doc.estado !== EstadoRedistribucion.APROBADA) {
      throw new BadRequestException(
        `Debe estar aprobada para ejecutarse (estado actual: "${doc.estado}")`,
      );
    }

    const BancoModel: Model<any> = this.redistribucionModel.db.model('Banco');

    const CajaModel: Model<any> =
      this.redistribucionModel.db.model('MovimientoCaja');

    const TransaccionModel: Model<any> =
      this.redistribucionModel.db.model('Transaccion');
    const cuentaIdToString = (id: Types.ObjectId) => id.toString();

    // Process ORIGEN items (decrement)
    for (const item of doc.items) {
      if (item.accion !== 'ORIGEN') continue;

      if (item.tipo === 'banco') {
        const banco: any = await BancoModel.findById(item.cuentaId).exec();
        if (!banco)
          throw new NotFoundException(
            `Cuenta bancaria ${cuentaIdToString(item.cuentaId)} no encontrada`,
          );
        if (banco.saldoActual < item.monto) {
          throw new BadRequestException(
            `Saldo insuficiente en banco: disponible ${banco.saldoActual}, requerido ${item.monto}`,
          );
        }
        banco.saldoActual -= item.monto;
        await banco.save();

        await TransaccionModel.create({
          codigo: `RD-EGR-${doc.codigo}-${cuentaIdToString(item.cuentaId)}`,
          tipo: 'egreso',
          categoria: null,
          monto: item.monto,
          moneda: null,
          fecha: doc.fecha,
          metodoPago: 'transferencia',
          descripcion: `Redistribución ${doc.codigo}: ${doc.descripcion} (ORIGEN)`,
          cuentaBancaria: item.cuentaId,
        });
      } else if (item.tipo === 'caja') {
        const saldoActual = await this.getSaldoCaja();
        if (saldoActual < item.monto) {
          throw new BadRequestException(
            `Saldo insuficiente en caja: disponible ${saldoActual}, requerido ${item.monto}`,
          );
        }
        await CajaModel.create({
          codigo: `RD-CAJ-EGR-${doc.codigo}`,
          tipo: 'egreso',
          concepto: 'otro',
          descripcion: `Redistribución ${doc.codigo}: ${doc.descripcion} (ORIGEN)`,
          monto: item.monto,
          fecha: doc.fecha,
          referencia: doc.codigo,
        });
      }
    }

    // Process DESTINO items (increment)
    for (const item of doc.items) {
      if (item.accion !== 'DESTINO') continue;

      if (item.tipo === 'banco') {
        const banco: any = await BancoModel.findById(item.cuentaId).exec();
        if (!banco)
          throw new NotFoundException(
            `Cuenta bancaria ${cuentaIdToString(item.cuentaId)} no encontrada`,
          );
        banco.saldoActual += item.monto;
        await banco.save();

        await TransaccionModel.create({
          codigo: `RD-ING-${doc.codigo}-${cuentaIdToString(item.cuentaId)}`,
          tipo: 'ingreso',
          categoria: null,
          monto: item.monto,
          moneda: null,
          fecha: doc.fecha,
          metodoPago: 'transferencia',
          descripcion: `Redistribución ${doc.codigo}: ${doc.descripcion} (DESTINO)`,
          cuentaBancaria: item.cuentaId,
        });
      } else if (item.tipo === 'caja') {
        await CajaModel.create({
          codigo: `RD-CAJ-ING-${doc.codigo}`,
          tipo: 'ingreso',
          concepto: 'otro',
          descripcion: `Redistribución ${doc.codigo}: ${doc.descripcion} (DESTINO)`,
          monto: item.monto,
          fecha: doc.fecha,
          referencia: doc.codigo,
        });
      }
    }

    doc.estado = EstadoRedistribucion.EJECUTADA;
    return doc.save();
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  async anular(id: string): Promise<Redistribucion> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Redistribución no encontrada');
    const doc = await this.redistribucionModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Redistribución no encontrada');
    if (doc.estado !== EstadoRedistribucion.EJECUTADA) {
      throw new BadRequestException(
        `Solo se puede anular una redistribución ejecutada (estado actual: "${doc.estado}")`,
      );
    }

    const BancoModel: Model<any> = this.redistribucionModel.db.model('Banco');

    const CajaModel: Model<any> =
      this.redistribucionModel.db.model('MovimientoCaja');
    const cuentaIdToString = (id: Types.ObjectId) => id.toString();

    for (const item of doc.items) {
      if (item.tipo === 'banco') {
        const banco = await BancoModel.findById(item.cuentaId).exec();
        if (!banco)
          throw new NotFoundException(
            `Cuenta bancaria ${cuentaIdToString(item.cuentaId)} no encontrada`,
          );
        // If it was ORIGEN (decremented), now increment back
        // If it was DESTINO (incremented), now decrement back
        banco.saldoActual +=
          item.accion === 'ORIGEN' ? item.monto : -item.monto;
        await banco.save();
      } else if (item.tipo === 'caja') {
        const tipoReverso = item.accion === 'ORIGEN' ? 'ingreso' : 'egreso';
        await CajaModel.create({
          codigo: `RD-ANUL-${doc.codigo}-${cuentaIdToString(item.cuentaId)}`,
          tipo: tipoReverso,
          concepto: 'otro',
          descripcion: `Anulación redistribución ${doc.codigo}: ${doc.descripcion}`,
          monto: item.monto,
          fecha: new Date(),
          referencia: doc.codigo,
        });
      }
    }

    doc.estado = EstadoRedistribucion.ANULADA;
    return doc.save();
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  private async getSaldoCaja(): Promise<number> {
    const CajaModel: Model<any> =
      this.redistribucionModel.db.model('MovimientoCaja');
    const ingresos = await CajaModel.aggregate<{ total: number }>([
      { $match: { tipo: { $in: ['apertura', 'ingreso'] } } },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]).exec();
    const egresos = await CajaModel.aggregate<{ total: number }>([
      { $match: { tipo: 'egreso' } },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]).exec();
    const totalIngresos = ingresos.length > 0 ? ingresos[0].total : 0;
    const totalEgresos = egresos.length > 0 ? egresos[0].total : 0;
    return totalIngresos - totalEgresos;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
}
