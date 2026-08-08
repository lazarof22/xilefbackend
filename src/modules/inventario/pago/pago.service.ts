import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePagoCreditoDto,
  CreatePagoEfectivoDto,
  CreatePagoTransferenciaDto,
  DesgloseBilletesDto,
} from './dto/create-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pago } from './schema/pago.schema';
import { PagoCredito } from './schema/pago_credito.schema';
import { PagoTransferencia } from './schema/pago_transferencia.schema';
import { Cliente } from 'src/modules/clientes y provedores/cliente/schemas/cliente.schema';
import { PagoEfectivo, TipoCliente } from './schema/pago_efectivo.schema';
import { Venta } from '../venta/schema/venta.schema';

@Injectable()
export class PagoService {
  constructor(
    @InjectModel(Pago.name) private pagoModel: Model<Pago>,
    @InjectModel(PagoEfectivo.name)
    private pagoEfectivoModel: Model<PagoEfectivo>,
    @InjectModel(PagoCredito.name) private pagoCreditoModel: Model<PagoCredito>,
    @InjectModel(PagoTransferencia.name)
    private pagoTransferenciaModel: Model<PagoTransferencia>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @InjectModel(Venta.name) private ventaModel: Model<Venta>,
  ) {}

  //Pago en transferencia.
  async createPagoT(
    createPagoTransferenciaDto: CreatePagoTransferenciaDto,
  ): Promise<PagoTransferencia> {
    const {
      montoPagar,
      monto_pagado,
      numeroCuenta,
      referenciaPago,
      banco,
      notas,
      ciCliente,
      nombreCliente,
      clienteId,
    } = createPagoTransferenciaDto;

    const nuevoPagoTransferencia = new this.pagoTransferenciaModel({
      montoPagar: montoPagar ?? monto_pagado,
      numeroCuenta: numeroCuenta ?? referenciaPago,
      banco,
      notas,
      ciCliente,
      nombreCliente,
      clienteId: clienteId || undefined,
      metodoPago: 'transferencia',
    });

    return nuevoPagoTransferencia.save();
  }

  //Pago en credito
  async createPagoC(
    createPagoCreditoDto: CreatePagoCreditoDto,
  ): Promise<PagoCredito> {
    const { monto_pagar, clienteId } = createPagoCreditoDto;
    if (!clienteId) {
      throw new BadRequestException(
        'El cliente es obligatorio para pagos a crédito',
      );
    }
    const cliente = await this.clienteModel.findById(clienteId);
    if (!cliente) {
      throw new NotFoundException('No se encontró el cliente');
    }

    const nuevoPagoCredito = new this.pagoCreditoModel({
      clienteId: cliente._id,
      monto_pagar,
      metodoPago: 'credito',
    });

    return nuevoPagoCredito.save();
  }

  //Pago en efectivo
  // ✅ Pago en efectivo - ACTUALIZADO (compatible con el contrato del Punto de Venta)
  async createPagoE(
    createPagoEfectivoDto: CreatePagoEfectivoDto,
  ): Promise<PagoEfectivo> {
    const {
      desglose,
      monto_pagado,
      monto_pagar,
      monto_pagar_CUP,
      monto_pagar_alCambio,
      cambio,
      cliente,
      moneda,
      datosClienteDescuento,
    } = createPagoEfectivoDto;

    // ─── Validación especial: Cliente Cuenta Casa ───
    const esCuentaCasa = cliente === TipoCliente.CLIENTECUENTACASA;

    if (esCuentaCasa) {
      if (monto_pagado !== undefined && monto_pagado !== 0) {
        throw new BadRequestException(
          'Para cliente cuenta casa el monto pagado debe ser 0',
        );
      }
    } else {
      // ─── Para los demás clientes, el desglose es obligatorio (se valida abajo) ───
    }

    // ─── Validación especial: Cliente por Descuento ───
    if (cliente === TipoCliente.CLIENTEPORDESCUENTO) {
      if (!datosClienteDescuento) {
        throw new BadRequestException(
          'Los datos del cliente (nombre, CI, teléfono) son obligatorios para clientes por descuento',
        );
      }
      const { nombre, ci, telefono } = datosClienteDescuento;
      if (!nombre || !ci || !telefono) {
        throw new BadRequestException(
          'Nombre, CI y Teléfono son obligatorios para clientes por descuento',
        );
      }
    }

    // ─── Validación del desglose y el cambio (solo si NO es cuenta casa) ───
    let totalDesglose = 0;
    if (!esCuentaCasa) {
      if (!desglose) {
        throw new BadRequestException(
          'El desglose es obligatorio para pagos en efectivo',
        );
      }
      totalDesglose = this.calcularTotalDesglose(desglose);

      const montoPagado = monto_pagado ?? totalDesglose;
      const montoPagar = monto_pagar ?? monto_pagar_CUP ?? 0;

      if (totalDesglose < montoPagado) {
        throw new BadRequestException(
          `El desglose no suma el monto pagado. Se necesita ${montoPagado}, pero el desglose suma ${totalDesglose}`,
        );
      }

      if (montoPagado < montoPagar) {
        throw new BadRequestException(
          `El monto pagado es menor que el monto a pagar. Pagado: ${montoPagado}, a pagar: ${montoPagar}`,
        );
      }

      const cambioEsperado = montoPagado - montoPagar;
      if (cambio !== cambioEsperado) {
        throw new BadRequestException(
          `El cambio es incorrecto. Se esperaba ${cambioEsperado}, pero se proporcionó ${cambio}`,
        );
      }

      // ─── Crear el documento ───
      const nuevoPagoEfectivo = new this.pagoEfectivoModel({
        monto_pagado: montoPagado,
        desglose,
        monto_pagar_CUP: monto_pagar_CUP ?? monto_pagar ?? 0,
        monto_pagar_alCambio: monto_pagar_alCambio ?? 0,
        cambio,
        cliente: cliente ?? TipoCliente.CLIENTEESTANDAR,
        moneda: moneda || undefined,
        esCuentaCasa: false,
        datosClienteDescuento:
          cliente === TipoCliente.CLIENTEPORDESCUENTO
            ? datosClienteDescuento
            : undefined,
        metodoPago: 'efectivo',
      });

      return nuevoPagoEfectivo.save();
    }

    // ─── Caso cuenta casa: monto pagado 0, sin desglose ───
    const nuevoPagoCuentaCasa = new this.pagoEfectivoModel({
      monto_pagado: 0,
      desglose: undefined,
      monto_pagar_CUP: monto_pagar_CUP ?? monto_pagar ?? 0,
      monto_pagar_alCambio: monto_pagar_alCambio ?? 0,
      cambio: 0,
      cliente: TipoCliente.CLIENTECUENTACASA,
      moneda: moneda || undefined,
      esCuentaCasa: true,
      metodoPago: 'efectivo',
    });

    return nuevoPagoCuentaCasa.save();
  }

  private calcularTotalDesglose(desglose: DesgloseBilletesDto): number {
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

  private rangoDelDia(fecha?: string): { start: Date; end: Date } {
    const start = fecha ? new Date(fecha) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  async resumenEfectivoEstandar(fecha?: string) {
    const { start, end } = this.rangoDelDia(fecha);
    const pagos = await this.pagoEfectivoModel
      .find({
        createdAt: { $gte: start, $lte: end },
        esCuentaCasa: { $ne: true },
        cliente: { $ne: TipoCliente.CLIENTEPORDESCUENTO },
      })
      .lean()
      .exec();

    return {
      tipoCliente: 'Cliente por efectivo o estandar',
      cantidad: pagos.length,
      monto: pagos.reduce((sum, p) => sum + (p.monto_pagado || 0), 0),
    };
  }

  async resumenPorDescuento(fecha?: string) {
    const { start, end } = this.rangoDelDia(fecha);
    const pagos = await this.pagoEfectivoModel
      .find({
        createdAt: { $gte: start, $lte: end },
        esCuentaCasa: { $ne: true },
        cliente: TipoCliente.CLIENTEPORDESCUENTO,
      })
      .lean()
      .exec();

    const idsPagos = pagos.map((p) => p._id);
    const ventas =
      idsPagos.length > 0
        ? await this.ventaModel
            .find({ pago: { $in: idsPagos } })
            .lean()
            .exec()
        : [];

    return {
      tipoCliente: 'Cliente por descuento',
      cantidad: pagos.length,
      monto: ventas.reduce((sum, v) => sum + (v.descuento_total || 0), 0),
    };
  }

  async resumenPorTransferencia(fecha?: string) {
    const { start, end } = this.rangoDelDia(fecha);
    const pagos = await this.pagoTransferenciaModel
      .find({ createdAt: { $gte: start, $lte: end } })
      .lean()
      .exec();

    return {
      tipoCliente: 'Cliente por transferencia',
      cantidad: pagos.length,
      monto: pagos.reduce((sum, p) => sum + (p.montoPagar || 0), 0),
    };
  }

  async resumenCuentaCasa(fecha?: string) {
    const { start, end } = this.rangoDelDia(fecha);
    const pagos = await this.pagoEfectivoModel
      .find({
        createdAt: { $gte: start, $lte: end },
        esCuentaCasa: true,
      })
      .lean()
      .exec();

    return {
      tipoCliente: 'Cliente cuenta casa',
      cantidad: pagos.length,
      monto: pagos.reduce(
        (sum, p) => sum + (p.monto_pagar_CUP || p.monto_pagar_alCambio || 0),
        0,
      ),
    };
  }

  async resumenPorCredito(fecha?: string) {
    const { start, end } = this.rangoDelDia(fecha);
    const pagos = await this.pagoCreditoModel
      .find({ createdAt: { $gte: start, $lte: end } })
      .lean()
      .exec();

    return {
      tipoCliente: 'Cliente por credito',
      cantidad: pagos.length,
      monto: pagos.reduce((sum, p) => sum + (p.monto_pagar || 0), 0),
    };
  }

  async findAll(): Promise<Pago[]> {
    return this.pagoModel
      .find()
      .populate('clienteId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Pago> {
    const pago = await this.pagoModel.findById(id).populate('clienteId').exec();

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }
}
