import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Factura } from './schema/factura.schema';
import {
  Cliente,
  ClienteDocument,
} from '../clientes y provedores/cliente/schemas/cliente.schema';
import { EmpresaDatosService } from '../configuracion/empresa-datos/empresa-datos.service';

@Injectable()
export class FacturaService {
  constructor(
    @InjectModel(Factura.name) private facturaModel: Model<Factura>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    private readonly empresaDatosService: EmpresaDatosService,
  ) {}

  async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const numero = createFacturaDto.numero ?? (await this.siguienteNumero());
    const id = createFacturaDto.id ?? `FAC-${String(numero).padStart(6, '0')}`;
    const fecha =
      createFacturaDto.fecha ?? new Date().toISOString().split('T')[0];

    const limpiar = (v?: string) => {
      const t = (v ?? '').trim();
      return t === '—' ? '' : t;
    };

    const clienteNombre =
      limpiar(createFacturaDto.cliente) || 'Venta al público';
    const nit = limpiar(createFacturaDto.nit);
    const direccion = limpiar(createFacturaDto.direccion);
    const telefono = limpiar(createFacturaDto.telefono);
    const email = limpiar(createFacturaDto.email);

    const subtotal = createFacturaDto.subtotal ?? 0;
    const descuentoTotal = createFacturaDto.descuentoTotal ?? 0;
    const recargoTotal = createFacturaDto.recargoTotal ?? 0;
    const base = subtotal - descuentoTotal + recargoTotal;

    let impuesto = createFacturaDto.impuesto;
    if (impuesto && impuesto.porciento && !impuesto.importe) {
      impuesto = {
        ...impuesto,
        importe: this.redondear((base * impuesto.porciento) / 100),
      };
    }
    const total = this.redondear(base + (impuesto?.importe ?? 0));

    const emisor = createFacturaDto.emisor ?? (await this.obtenerEmisor());

    let clienteId: Types.ObjectId | undefined;
    if (nit || telefono || email) {
      clienteId = (
        await this.buscarOCrearCliente({
          nombre: clienteNombre,
          nit,
          telefono,
          email,
          direccion,
        })
      )?._id;
    }

    const factura = new this.facturaModel({
      id,
      numero,
      fecha,
      cliente: clienteNombre,
      nit,
      direccion,
      telefono,
      email,
      moneda: createFacturaDto.moneda ?? 'CUP',
      concepto: createFacturaDto.concepto,
      clienteId,
      emisor,
      impuesto,
      metodoPago: createFacturaDto.metodoPago,
      items: createFacturaDto.items,
      subtotal,
      descuentoTotal,
      recargoTotal,
      total,
      estado: createFacturaDto.estado ?? 'confirmada',
      tipo: createFacturaDto.tipo ?? 'factura_normal',
      impreso: createFacturaDto.impreso ?? false,
    });
    return factura.save();
  }

  private async siguienteNumero(): Promise<number> {
    const ultima = await this.facturaModel
      .findOne()
      .sort({ numero: -1 })
      .exec();
    return (ultima?.numero ?? 0) + 1;
  }

  private async obtenerEmisor() {
    const empresa = await this.empresaDatosService.obtener();
    if (!empresa) {
      return undefined;
    }
    return {
      nombre: empresa.nombre,
      nit: empresa.ruc_nit,
      direccion: empresa.direccion,
      telefono: empresa.telefono,
      email: empresa.email,
    };
  }

  private redondear(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  private async buscarOCrearCliente(datos: {
    nombre: string;
    nit?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
  }): Promise<ClienteDocument | null> {
    const { nombre, nit, telefono, email, direccion } = datos;

    const condiciones = [
      nit ? { nit } : {},
      telefono ? { telefono_cliente: telefono } : {},
      email ? { email_cliente: email } : {},
    ].filter((q) => Object.keys(q).length > 0);

    if (condiciones.length === 0) {
      return null;
    }

    const existente = await this.clienteModel
      .findOne({ $or: condiciones })
      .exec();
    if (existente) {
      return existente;
    }

    const sufijo = new Types.ObjectId().toHexString().slice(-6);
    const nuevoCliente = new this.clienteModel({
      id_cliente: nit || `CLI-${sufijo}`,
      nombre_cliente: nombre,
      nit,
      telefono_cliente: telefono || `0${sufijo}`,
      email_cliente: email || `cliente-${sufijo}@xilef.local`,
      direccion_cliente: direccion ?? '',
    });

    try {
      return await nuevoCliente.save();
    } catch {
      return null;
    }
  }

  async findAll(): Promise<Factura[]> {
    return this.facturaModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Factura> {
    const factura = await this.facturaModel.findOne({ id }).exec();
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return factura;
  }

  async update(
    id: string,
    updateFacturaDto: UpdateFacturaDto,
  ): Promise<Factura> {
    const factura = await this.facturaModel
      .findOneAndUpdate({ id }, updateFacturaDto, { new: true })
      .exec();
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return factura;
  }

  async anular(id: string): Promise<Factura> {
    const factura = await this.facturaModel
      .findOneAndUpdate({ id }, { estado: 'anulada' }, { new: true })
      .exec();
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return factura;
  }

  async remove(id: string): Promise<Factura> {
    const factura = await this.anular(id);
    return factura;
  }
}
