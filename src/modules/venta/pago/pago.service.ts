import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePagoCreditoDto, CreatePagoDto, CreatePagoEfectivoDto, CreatePagoTransferenciaDto } from './dto/create-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pago } from './schema/pago.schema';
import { PagoCredito } from './schema/pago_credito.schema';
import { PagoTransferencia } from './schema/pago_transferencia.schema';
import { Cliente } from 'src/modules/clientes y provedores/cliente/schemas/cliente.schema';
import { PagoEfectivo } from './schema/pago_efectivo.schema';

@Injectable()
export class PagoService {

  constructor(
    @InjectModel(PagoEfectivo.name) private pagoEfectivoModel: Model<PagoEfectivo>,
    @InjectModel(PagoCredito.name) private pagoCreditoModel: Model<PagoCredito>,
    @InjectModel(PagoTransferencia.name) private pagoTransferenciaModel: Model<PagoTransferencia>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
  ) { }

  //Pago en transferencia.
  async createPagoT(createPagoTransferenciaDto: CreatePagoTransferenciaDto): Promise<PagoTransferencia> {
    const { monto_pagado, ciCliente, nombreCliente, referenciaPago } = createPagoTransferenciaDto;
    const nuevoPagoTransferencia = new this.pagoTransferenciaModel({
      monto_pagado,
      ciCliente,
      nombreCliente,
      referenciaPago,
    });

    return nuevoPagoTransferencia.save();
  }

  //Pago en credito
  async createPagoC(createPagoCreditoDto: CreatePagoCreditoDto):  Promise<PagoCredito>{
    const { monto_pagar, clienteId } = createPagoCreditoDto;
    if (!clienteId) {
      throw new BadRequestException('El cliente es obligatorio para pagos a crédito');
    }
    const cliente = await this.clienteModel.findById(clienteId);
    if (!cliente) {
      throw new NotFoundException('No se encontró el cliente');
    }

    const nuevoPagoCredito = new this.pagoCreditoModel({
      clienteId: cliente._id,
      monto_pagar,
    });

    return nuevoPagoCredito.save();
  }

  //Pago en efectivo
  async createPagoE(createPagoEfectivoDto: CreatePagoEfectivoDto): Promise<PagoEfectivo> {
    const { desglose, monto_pagado, monto_pagar, cambio, } = createPagoEfectivoDto;
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
      desglose,
      monto_pagar,
      cambio,
    });

    return nuevoPagoEfectivo.save();

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
