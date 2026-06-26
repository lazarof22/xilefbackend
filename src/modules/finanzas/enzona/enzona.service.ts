import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnzonaWebhookDto } from './dto/enzona-webhook.dto';
import { EnzonaWebhookResponse, EnzonaEvento } from './types/enzona.types';
import { Transaccion } from '../transaccion/schema/transaccion.schema';
import { CuentaCobrar } from '../cuenta-cobrar/schema/cuenta-cobrar.schema';

@Injectable()
export class EnzonaService {
  private readonly logger = new Logger(EnzonaService.name);

  constructor(
    @InjectModel(Transaccion.name) private transaccionModel: Model<Transaccion>,
    @InjectModel(CuentaCobrar.name) private cxcModel: Model<CuentaCobrar>,
  ) {}

  async procesarWebhook(payload: EnzonaWebhookDto): Promise<EnzonaWebhookResponse> {
    this.logger.log(`Webhook recibido: ${payload.evento} - ${payload.id_transaccion}`);

    if (payload.evento !== EnzonaEvento.PAGO_EXITOSO) {
      return { recibido: true, mensaje: `Evento ${payload.evento} recibido, no se procesa` };
    }

    const existente = await this.transaccionModel.findOne({ referencia: payload.id_transaccion }).exec();
    if (existente) {
      return { recibido: true, mensaje: 'Transaccion ya procesada anteriormente' };
    }

    const transaccion = await this.transaccionModel.create({
      codigo: `ENZ-${payload.id_transaccion}`,
      tipo: 'ingreso',
      monto: payload.monto,
      moneda: payload.moneda as any,
      fecha: new Date(payload.fecha),
      metodoPago: 'transferencia',
      referencia: payload.id_transaccion,
      descripcion: `Pago recibido via Enzona: ${payload.referencia}`,
    });

    this.logger.log(`Transaccion creada: ${transaccion._id}`);

    let abonoAplicado: string | undefined;

    if (payload.referencia) {
      const cxc = await this.cxcModel.findOne({ codigo: payload.referencia }).exec();
      if (cxc) {
        cxc.saldoPendiente = Number((cxc.saldoPendiente - payload.monto).toFixed(2));
        if (cxc.saldoPendiente <= 0) {
          cxc.saldoPendiente = 0;
          cxc.estado = 'pagada' as any;
        } else {
          cxc.estado = 'parcial' as any;
        }
        await cxc.save();
        abonoAplicado = cxc._id.toString();
        this.logger.log(`Abono aplicado a CxC: ${cxc._id}`);
      }
    }

    return {
      recibido: true,
      mensaje: 'Pago procesado exitosamente',
      transaccionCreada: transaccion._id.toString(),
      abonoAplicado,
    };
  }
}
