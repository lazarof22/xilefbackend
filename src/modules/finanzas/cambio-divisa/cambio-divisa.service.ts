import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateCambioDivisaDto } from './dto/create-cambio-divisa.dto';
import { UpdateCambioDivisaDto } from './dto/update-cambio-divisa.dto';
import {
  CambioDivisa,
  CambioDivisaDocument,
} from './schema/cambio-divisa.schema';
import { EstadoCambio } from './types/cambio-divisa.types';
import { TasaCambioService } from '../../nomencladores/tasa-cambio/tasa-cambio.service';
import { BancoService } from '../banco/banco.service';
import {
  CuentaCaja,
  CuentaCajaDocument,
} from '../caja/schema/cuenta-caja.schema';

@Injectable()
export class CambioDivisaService {
  constructor(
    @InjectModel(CambioDivisa.name)
    private cambioDivisaModel: Model<CambioDivisaDocument>,
    @InjectModel(CuentaCaja.name)
    private cuentaCajaModel: Model<CuentaCajaDocument>,
    private readonly tasaCambioService: TasaCambioService,
    private readonly bancoService: BancoService,
  ) {}

  async create(createDto: CreateCambioDivisaDto): Promise<CambioDivisa> {
    const existente = await this.cambioDivisaModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe una operación de cambio con ese código',
      );

    // Validate at least one source and one destination
    if (!createDto.cuentaOrigen && !createDto.cajaOrigen) {
      throw new BadRequestException(
        'Debe especificar al menos una cuenta bancaria o caja de origen',
      );
    }
    if (!createDto.cuentaDestino && !createDto.cajaDestino) {
      throw new BadRequestException(
        'Debe especificar al menos una cuenta bancaria o caja de destino',
      );
    }

    // Fetch tasa vigente
    const tasaDoc = await this.tasaCambioService.getVigente(
      createDto.monedaOrigen,
      createDto.monedaDestino,
    );
    if (!tasaDoc) {
      throw new BadRequestException(
        'No se encontró una tasa de cambio vigente para el par de monedas especificado',
      );
    }

    const montoDestino = Number(
      (createDto.montoOrigen * tasaDoc.tasa).toFixed(2),
    );

    // Create the CambioDivisa record
    const created = new this.cambioDivisaModel({
      codigo: createDto.codigo,
      monedaOrigen: new Types.ObjectId(createDto.monedaOrigen),
      monedaDestino: new Types.ObjectId(createDto.monedaDestino),
      montoOrigen: createDto.montoOrigen,
      montoDestino,
      tasaAplicada: tasaDoc.tasa,
      tipoTasa: tasaDoc.tipo,
      fecha: new Date(),
      cuentaOrigen: createDto.cuentaOrigen
        ? new Types.ObjectId(createDto.cuentaOrigen)
        : undefined,
      cuentaDestino: createDto.cuentaDestino
        ? new Types.ObjectId(createDto.cuentaDestino)
        : undefined,
      cajaOrigen: createDto.cajaOrigen
        ? new Types.ObjectId(createDto.cajaOrigen)
        : undefined,
      cajaDestino: createDto.cajaDestino
        ? new Types.ObjectId(createDto.cajaDestino)
        : undefined,
      estado: EstadoCambio.EJECUTADA,
      descripcion: createDto.descripcion,
    });

    // Adjust balances: debit from source, credit to destination
    if (createDto.cuentaOrigen) {
      await this.bancoService.actualizarSaldo(
        createDto.cuentaOrigen,
        -createDto.montoOrigen,
      );
    }
    if (createDto.cajaOrigen) {
      await this.actualizarSaldoCaja(
        createDto.cajaOrigen,
        -createDto.montoOrigen,
      );
    }
    if (createDto.cuentaDestino) {
      await this.bancoService.actualizarSaldo(
        createDto.cuentaDestino,
        montoDestino,
      );
    }
    if (createDto.cajaDestino) {
      await this.actualizarSaldoCaja(createDto.cajaDestino, montoDestino);
    }

    return created.save();
  }

  async findAll(): Promise<CambioDivisa[]> {
    return this.cambioDivisaModel
      .find()
      .populate('monedaOrigen monedaDestino')
      .populate('cuentaOrigen cuentaDestino')
      .populate('cajaOrigen cajaDestino')
      .sort({ fecha: -1 })
      .exec();
  }

  async findOne(id: string): Promise<CambioDivisa> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación de cambio no encontrada');
    const doc = await this.cambioDivisaModel
      .findById(id)
      .populate('monedaOrigen monedaDestino')
      .populate('cuentaOrigen cuentaDestino')
      .populate('cajaOrigen cajaDestino')
      .exec();
    if (!doc) throw new NotFoundException('Operación de cambio no encontrada');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateCambioDivisaDto,
  ): Promise<CambioDivisa> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación de cambio no encontrada');
    const cambio = await this.cambioDivisaModel.findById(id).exec();
    if (!cambio)
      throw new NotFoundException('Operación de cambio no encontrada');
    if (cambio.estado === EstadoCambio.ANULADA) {
      throw new BadRequestException(
        'No se puede modificar una operación anulada',
      );
    }
    const updated = await this.cambioDivisaModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException('Operación de cambio no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación de cambio no encontrada');
    const cambio = await this.cambioDivisaModel.findById(id).exec();
    if (!cambio)
      throw new NotFoundException('Operación de cambio no encontrada');
    if (cambio.estado === EstadoCambio.ANULADA) {
      throw new BadRequestException(
        'No se puede eliminar una operación anulada',
      );
    }
    // Reverse balances before removing
    await this.revertirSaldos(cambio);
    const removed = await this.cambioDivisaModel.findByIdAndDelete(id).exec();
    if (!removed)
      throw new NotFoundException('Operación de cambio no encontrada');
    return { deleted: true };
  }

  async anular(id: string): Promise<CambioDivisa> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Operación de cambio no encontrada');
    const cambio = await this.cambioDivisaModel.findById(id).exec();
    if (!cambio)
      throw new NotFoundException('Operación de cambio no encontrada');
    if (cambio.estado === EstadoCambio.ANULADA) {
      throw new BadRequestException('La operación ya está anulada');
    }

    // Reverse balances
    await this.revertirSaldos(cambio);

    cambio.estado = EstadoCambio.ANULADA;
    return cambio.save();
  }

  async getResumen(): Promise<Record<string, unknown>> {
    const totalOrigen = await this.cambioDivisaModel
      .aggregate<{ totalMontoOrigen: number; totalMontoDestino: number }>([
        { $match: { estado: EstadoCambio.EJECUTADA } },
        {
          $group: {
            _id: null,
            totalMontoOrigen: { $sum: '$montoOrigen' },
            totalMontoDestino: { $sum: '$montoDestino' },
          },
        },
      ])
      .exec();
    const porMoneda = await this.cambioDivisaModel
      .aggregate([
        { $match: { estado: EstadoCambio.EJECUTADA } },
        {
          $group: {
            _id: '$monedaOrigen',
            total: { $sum: '$montoOrigen' },
            cantidad: { $sum: 1 },
          },
        },
      ])
      .exec();

    return {
      totalOperaciones: await this.cambioDivisaModel
        .countDocuments({ estado: EstadoCambio.EJECUTADA })
        .exec(),
      totalMontoOrigen:
        totalOrigen.length > 0 ? totalOrigen[0].totalMontoOrigen : 0,
      totalMontoDestino:
        totalOrigen.length > 0 ? totalOrigen[0].totalMontoDestino : 0,
      porMoneda,
    };
  }

  private async actualizarSaldoCaja(
    cajaId: string,
    monto: number,
  ): Promise<void> {
    const caja = await this.cuentaCajaModel.findById(cajaId).exec();
    if (!caja) throw new NotFoundException('Caja no encontrada');
    caja.saldoActual += monto;
    await caja.save();
  }

  private async revertirSaldos(cambio: CambioDivisa): Promise<void> {
    if (cambio.cuentaOrigen) {
      await this.bancoService.actualizarSaldo(
        cambio.cuentaOrigen.toString(),
        cambio.montoOrigen,
      );
    }
    if (cambio.cajaOrigen) {
      await this.actualizarSaldoCaja(
        cambio.cajaOrigen.toString(),
        cambio.montoOrigen,
      );
    }
    if (cambio.cuentaDestino) {
      await this.bancoService.actualizarSaldo(
        cambio.cuentaDestino.toString(),
        -cambio.montoDestino,
      );
    }
    if (cambio.cajaDestino) {
      await this.actualizarSaldoCaja(
        cambio.cajaDestino.toString(),
        -cambio.montoDestino,
      );
    }
  }
}
