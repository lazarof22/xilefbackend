import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { TransfermovilPago } from './schema/transfermovil.schema';
import { QrEstatico } from './schema/qr-estatico.schema';
import { TransfermovilWebhookDto } from './dto/transfermovil-webhook.dto';
import { GenerarQrDinamicoDto } from './dto/generar-qr-dinamico.dto';
import { GenerarQrEstaticoDto } from './dto/generar-qr-estatico.dto';
import {
  TransfermovilWebhookResponse,
  TransfermovilEvento,
  EstadoTransfermovil,
} from './types/transfermovil.types';
import { Transaccion } from '../transaccion/schema/transaccion.schema';
import { CuentaCobrar } from '../cuenta-cobrar/schema/cuenta-cobrar.schema';
import {
  TipoTransaccion,
  MetodoPago,
} from '../transaccion/types/transaccion.types';
import { EstadoCxC } from '../cuenta-cobrar/types/cuenta-cobrar.types';

@Injectable()
export class TransfermovilService {
  private readonly logger = new Logger(TransfermovilService.name);

  constructor(
    @InjectModel(TransfermovilPago.name)
    private transfermovilModel: Model<TransfermovilPago>,
    @InjectModel(QrEstatico.name) private qrEstaticoModel: Model<QrEstatico>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<Transaccion>,
    @InjectModel(CuentaCobrar.name) private cxcModel: Model<CuentaCobrar>,
  ) {}

  async procesarWebhook(
    dto: TransfermovilWebhookDto,
  ): Promise<TransfermovilWebhookResponse> {
    this.logger.log(`Webhook recibido: ${dto.evento} - ${dto.id_operacion}`);

    // Idempotency check by idOperacion
    const existente = await this.transfermovilModel
      .findOne({ idOperacion: dto.id_operacion })
      .exec();
    if (existente) {
      return {
        recibido: true,
        mensaje: 'Operacion ya procesada anteriormente',
      };
    }

    if (dto.evento !== TransfermovilEvento.PAGO_CONFIRMADO) {
      // Store the event for audit but skip transaction creation
      await this.transfermovilModel.create({
        codigo: `TM-${dto.id_operacion}`,
        idOperacion: dto.id_operacion,
        fecha: new Date(dto.fecha),
        monto: dto.monto,
        moneda: dto.moneda,
        estado:
          dto.evento === TransfermovilEvento.PAGO_RECHAZADO
            ? EstadoTransfermovil.RECHAZADO
            : EstadoTransfermovil.REEMBOLSO,
        telefono: dto.telefono,
        identificadorCliente: dto.identificador_cliente,
        referencia: dto.referencia,
        metadata: dto.metadata,
      });

      return {
        recibido: true,
        mensaje: `Evento ${dto.evento} recibido, no se procesa`,
      };
    }

    const monedaDoc = await this.transaccionModel.db
      .model('Moneda')
      .findOne({ tipo_moneda: dto.moneda })
      .exec();

    const monedaId: any = monedaDoc?._id ?? dto.moneda;
    const transaccion = await this.transaccionModel.create({
      codigo: `TM-${dto.id_operacion}`,
      tipo: TipoTransaccion.INGRESO,
      monto: dto.monto,
      moneda: monedaId,
      fecha: new Date(dto.fecha),
      metodoPago: MetodoPago.TRANSFERENCIA,
      referencia: dto.id_operacion,
      descripcion: `Pago recibido via Transfermovil: ${dto.referencia ?? dto.id_operacion}`,
    });

    this.logger.log(`Transaccion creada: ${transaccion._id.toString()}`);

    // Auto-link CxC by dto.referencia
    let abonoAplicado: string | undefined;

    if (dto.referencia) {
      const cxc = await this.cxcModel
        .findOne({ codigo: dto.referencia })
        .exec();
      if (cxc) {
        cxc.saldoPendiente = Number(
          (cxc.saldoPendiente - dto.monto).toFixed(2),
        );
        if (cxc.saldoPendiente <= 0) {
          cxc.saldoPendiente = 0;
          cxc.estado = EstadoCxC.PAGADA;
        } else {
          cxc.estado = EstadoCxC.PARCIAL;
        }
        await cxc.save();
        abonoAplicado = cxc._id.toString();
        this.logger.log(`Abono aplicado a CxC: ${cxc._id.toString()}`);
      }
    }

    // Persist the payment record
    await this.transfermovilModel.create({
      codigo: `TM-${dto.id_operacion}`,
      idOperacion: dto.id_operacion,
      fecha: new Date(dto.fecha),
      monto: dto.monto,
      moneda: monedaId,
      estado: EstadoTransfermovil.CONFIRMADO,
      telefono: dto.telefono,
      identificadorCliente: dto.identificador_cliente,
      referencia: dto.referencia,
      transaccionCreada: transaccion._id as any,
      cuentaCobrarVinculada: abonoAplicado,
      descripcion: `Pago confirmado Transfermovil - ${dto.id_operacion}`,
      metadata: dto.metadata,
    });

    return {
      recibido: true,
      mensaje: 'Pago procesado exitosamente',
      transaccionCreada: transaccion._id.toString(),
      abonoAplicado,
    };
  }

  generarQrDinamico(dto: GenerarQrDinamicoDto) {
    const codigo = `QR-D-${crypto.randomUUID().split('-').join('')}`;
    const vencimiento =
      dto.vencimiento ??
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const payload = JSON.stringify({
      telefono: '00000000',
      monto: dto.monto,
      referencia: dto.referencia ?? codigo,
      vencimiento,
      hash: crypto.randomUUID(),
    });

    return {
      codigo,
      payload,
      vencimiento,
      concepto: dto.concepto,
      referencia: dto.referencia,
    };
  }

  async generarQrEstatico(dto: GenerarQrEstaticoDto) {
    const codigo = `QR-E-${crypto.randomUUID().split('-').join('')}`;
    const payload = JSON.stringify({
      telefono: dto.telefono,
      identificadorComerciante: dto.identificadorComerciante,
      codigo,
    });

    const qr = await this.qrEstaticoModel.create({
      codigo,
      telefono: dto.telefono,
      identificadorComerciante: dto.identificadorComerciante,
      payload,
      fechaGeneracion: new Date(),
    });

    return qr;
  }

  async findAll(): Promise<TransfermovilPago[]> {
    return this.transfermovilModel.find().sort({ fecha: -1 }).exec();
  }

  async findOne(id: string): Promise<TransfermovilPago> {
    const pago = await this.transfermovilModel.findById(id).exec();
    if (!pago) {
      throw new NotFoundException(
        `TransfermovilPago con id ${id} no encontrado`,
      );
    }
    return pago;
  }

  async getPorEstado(
    estado: EstadoTransfermovil,
  ): Promise<TransfermovilPago[]> {
    return this.transfermovilModel.find({ estado }).sort({ fecha: -1 }).exec();
  }

  async getQrEstaticos(): Promise<QrEstatico[]> {
    return this.qrEstaticoModel.find().sort({ fechaGeneracion: -1 }).exec();
  }

  async getResumen() {
    const [total, confirmados, pendientes, rechazados, reembolsos] =
      await Promise.all([
        this.transfermovilModel.countDocuments().exec(),
        this.transfermovilModel
          .countDocuments({ estado: EstadoTransfermovil.CONFIRMADO })
          .exec(),
        this.transfermovilModel
          .countDocuments({ estado: EstadoTransfermovil.PENDIENTE })
          .exec(),
        this.transfermovilModel
          .countDocuments({ estado: EstadoTransfermovil.RECHAZADO })
          .exec(),
        this.transfermovilModel
          .countDocuments({ estado: EstadoTransfermovil.REEMBOLSO })
          .exec(),
      ]);

    const montoTotalConfirmado = await this.transfermovilModel
      .aggregate<{
        total: number;
      }>([
        { $match: { estado: EstadoTransfermovil.CONFIRMADO } },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ])
      .exec();

    return {
      total,
      confirmados,
      pendientes,
      rechazados,
      reembolsos,
      montoTotalConfirmado: montoTotalConfirmado[0]?.total ?? 0,
    };
  }
}
