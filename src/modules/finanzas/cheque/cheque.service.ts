import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { Cheque, ChequeDocument } from './schema/cheque.schema';
import { EstadoCheque } from './types/cheque.types';

@Injectable()
export class ChequeService {
  constructor(@InjectModel(Cheque.name) private chequeModel: Model<ChequeDocument>) {}
  async create(createDto: CreateChequeDto): Promise<Cheque> {
    const existente = await this.chequeModel.findOne({ numeroCheque: createDto.numeroCheque }).exec();
    if (existente) throw new BadRequestException('Ya existe un cheque con ese número');
    const created = new this.chequeModel(createDto);
    return created.save();
  }
  async findAll(): Promise<Cheque[]> {
    return this.chequeModel.find().populate('cuentaBancaria').sort({ fechaEmision: -1 }).exec();
  }
  async findOne(id: string): Promise<Cheque> {
    if (!isValidObjectId(id)) throw new NotFoundException('Cheque no encontrado');
    const doc = await this.chequeModel.findById(id).populate('cuentaBancaria').exec();
    if (!doc) throw new NotFoundException('Cheque no encontrado');
    return doc;
  }
  async registrarCobro(id: string, fechaCobro: string): Promise<Cheque> {
    const cheque = await this.chequeModel.findById(id).exec();
    if (!cheque) throw new NotFoundException('Cheque no encontrado');
    cheque.estado = EstadoCheque.COBRADO;
    cheque.fechaCobro = new Date(fechaCobro);
    return cheque.save();
  }
  async registrarDevolucion(id: string, motivo: string): Promise<Cheque> {
    const cheque = await this.chequeModel.findById(id).exec();
    if (!cheque) throw new NotFoundException('Cheque no encontrado');
    cheque.estado = EstadoCheque.DEVUELTO;
    cheque.fechaDevolucion = new Date();
    cheque.motivoDevolucion = motivo;
    return cheque.save();
  }
  async anular(id: string): Promise<Cheque> {
    const cheque = await this.chequeModel.findById(id).exec();
    if (!cheque) throw new NotFoundException('Cheque no encontrado');
    if (cheque.estado === EstadoCheque.COBRADO) throw new BadRequestException('No se puede anular un cheque cobrado');
    cheque.estado = EstadoCheque.ANULADO;
    return cheque.save();
  }
  async getPendientes(): Promise<Cheque[]> {
    return this.chequeModel.find({ estado: { $in: [EstadoCheque.EMITIDO, EstadoCheque.ENTREGADO] } })
      .populate('cuentaBancaria').sort({ fechaEmision: -1 }).exec();
  }
}
