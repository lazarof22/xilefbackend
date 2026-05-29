import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pago } from './schema/pago.schema';
import { PagoEfectivo, PagoEfectivoDocument } from './schema/pago_efectivo.schema';
import { PagoCredito } from './schema/pago_credito.schema';
import { PagoTransferencia } from './schema/pago_transferencia.schema';

@Injectable()
export class PagoService {

    constructor(
    @InjectModel(Pago.name) private pagoModel: Model<Pago>,
    @InjectModel(PagoEfectivo.name) private pagoEfectivoModel: Model<PagoEfectivo>,
    @InjectModel(PagoCredito.name) private pagoCreditoModel : Model<PagoCredito>,
    @InjectModel(PagoTransferencia.name) private pagoTransferenciaModel: Model<PagoTransferencia>
  ) {}

  async create(createPagoDto: CreatePagoDto): Promise<Pago> {
    const { metodoPago, desglose, monto_pagado, monto_pagar, cambio } = createPagoDto;

    if (metodoPago === 'efectivo') {
      if (!desglose) {
        throw new BadRequestException('El desglose es obligatorio para pagos en efectivo');
      }

      if (!monto_pagar) {
        throw new BadRequestException('El monto a pagar es obligatorio para pagos en efectivo');
      }

      if (cambio === undefined || cambio === null) {
        throw new BadRequestException('El cambio es obligatorio para pagos en efectivo');
      }

      const totalDesglose = this.calcularTotalDesglose(desglose);

      if (totalDesglose < monto_pagar) {
        throw new BadRequestException(`El desglose no suma el monto requerido. Se necesita ${monto_pagar}, pero el desglose suma ${totalDesglose}`);
      }

      const cambioEsperado = totalDesglose - monto_pagar;
      if (cambio !== cambioEsperado) {
        throw new BadRequestException(`El cambio es incorrecto. Se esperaba ${cambioEsperado}, pero se proporcionó ${cambio}`);
      }

      const nuevoPagoEfectivo = new this.pagoEfectivoModel({
        monto_pagado: totalDesglose,
        metodoPago,
        desglose,
        monto_pagar,
        cambio,
      });

      return nuevoPagoEfectivo.save();
    } else if (metodoPago === 'transferencia') {
      const nuevoPagoTransferencia = new this.pagoTransferenciaModel({
        monto_pagado,
        metodoPago,
      });

      return nuevoPagoTransferencia.save();
    } else if (metodoPago === 'credito') {
      const nuevoPagoCredito = new this.pagoCreditoModel({
        monto_pagado,
        metodoPago,
      });

      return nuevoPagoCredito.save();
    } else {
      throw new BadRequestException(`Método de pago no válido: ${metodoPago}`);
    }
  }


    private calcularTotalDesglose(desglose: any): number {
    return (
      (desglose.billete5000 || 0) * 5000 +
      (desglose.billete2000 || 0) * 2000 +
      (desglose.billete1000 || 0) * 1000 +
      (desglose.billete500 || 0) * 500 +
      (desglose.billete200 || 0) * 200 +
      (desglose.billete100 || 0) * 100 +
      (desglose.billete50 || 0) * 50 +
      (desglose.billete20 || 0) * 20 +
      (desglose.billete10 || 0) * 10 +
      (desglose.billete5 || 0) * 5 +
      (desglose.billete3 || 0) * 3 +
      (desglose.billete1 || 0) * 1 
    );
  }

}
