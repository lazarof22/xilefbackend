import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePagoCreditoDto, CreatePagoDto, CreatePagoEfectivoDto, CreatePagoTransferenciaDto } from './dto/create-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pago } from './schema/pago.schema';
import { PagoCredito } from './schema/pago_credito.schema';
import { PagoTransferencia } from './schema/pago_transferencia.schema';
import { Cliente } from 'src/modules/clientes y provedores/cliente/schemas/cliente.schema';
import { PagoEfectivo, TipoCliente } from './schema/pago_efectivo.schema';

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
  // ✅ Pago en efectivo - ACTUALIZADO
  async createPagoE(createPagoEfectivoDto: CreatePagoEfectivoDto): Promise<PagoEfectivo> {
    const { 
      desglose, 
      monto_pagado, 
      monto_pagar_CUP, 
      monto_pagar_alCambio, 
      cambio, 
      cliente, 
      moneda,
      datosClienteDescuento  // ✅ NUEVO
    } = createPagoEfectivoDto;

    // ─── Validaciones básicas ───
    if (!desglose) {
      throw new BadRequestException('El desglose es obligatorio para pagos en efectivo');
    }

    if (!cliente) {
      throw new BadRequestException('El tipo de cliente es obligatorio para pagos en efectivo');
    }

    if (!moneda) {
      throw new BadRequestException('La moneda es obligatoria para pagos en efectivo');
    }

    // ─── Validación especial: Cliente Cuenta Casa ───
    const esCuentaCasa = cliente === TipoCliente.CLIENTECUENTACASA;

    if (esCuentaCasa) {
      // Para cliente cuenta casa, el monto pagado debe ser 0 (regalo del jefe)
      if (monto_pagado !== 0) {
        throw new BadRequestException('Para cliente cuenta casa el monto pagado debe ser 0');
      }
    } else {
      // Para los demás clientes, validar cambio
      if (cambio === undefined || cambio === null) {
        throw new BadRequestException('El cambio es obligatorio para pagos en efectivo');
      }
    }

    // ─── Validación especial: Cliente por Descuento ───
    if (cliente === TipoCliente.CLIENTEPORDESCUENTO) {
      if (!datosClienteDescuento) {
        throw new BadRequestException('Los datos del cliente (nombre, CI, teléfono) son obligatorios para clientes por descuento');
      }
      const { nombre, ci, telefono } = datosClienteDescuento;
      if (!nombre || !ci || !telefono) {
        throw new BadRequestException('Nombre, CI y Teléfono son obligatorios para clientes por descuento');
      }
    }

    // ─── Validación del desglose (solo si NO es cuenta casa) ───
    let totalDesglose = 0;
    if (!esCuentaCasa) {
      totalDesglose = this.calcularTotalDesglose(desglose);

      if (totalDesglose < monto_pagado) {
        throw new BadRequestException(
          `El desglose no suma el monto pagado. Se necesita ${monto_pagado}, pero el desglose suma ${totalDesglose}`
        );
      }

      const cambioEsperado = totalDesglose - monto_pagado;
      if (cambio !== cambioEsperado) {
        throw new BadRequestException(
          `El cambio es incorrecto. Se esperaba ${cambioEsperado}, pero se proporcionó ${cambio}`
        );
      }
    }

    // ─── Crear el documento ───
    const nuevoPagoEfectivo = new this.pagoEfectivoModel({
      monto_pagado: esCuentaCasa ? 0 : totalDesglose,
      desglose: esCuentaCasa ? null : desglose,
      monto_pagar_CUP: esCuentaCasa ? 0 : monto_pagar_CUP,
      monto_pagar_alCambio: esCuentaCasa ? 0 : monto_pagar_alCambio,
      cambio: esCuentaCasa ? 0 : cambio,
      cliente,
      moneda,
      esCuentaCasa,
      datosClienteDescuento: cliente === TipoCliente.CLIENTEPORDESCUENTO ? datosClienteDescuento : undefined,
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
