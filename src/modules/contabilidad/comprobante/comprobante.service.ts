import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import {
  CreateComprobanteDto,
  LineaComprobanteDto,
} from './dto/create-comprobante.dto';
import { UpdateComprobanteDto } from './dto/update-comprobante.dto';
import {
  Comprobante,
  ComprobanteDocument,
  LineaComprobante,
} from './schema/comprobante.schema';

@Injectable()
export class ComprobanteService {
  constructor(
    @InjectModel(Comprobante.name)
    private comprobanteModel: Model<ComprobanteDocument>,
  ) {}

  private calcularTotales(lineas: LineaComprobanteDto[]): {
    totalDebito: number;
    totalCredito: number;
  } {
    const totalDebito = Number(
      lineas.reduce((acc, l) => acc + (Number(l.debe) || 0), 0).toFixed(2),
    );
    const totalCredito = Number(
      lineas.reduce((acc, l) => acc + (Number(l.haber) || 0), 0).toFixed(2),
    );
    return { totalDebito, totalCredito };
  }

  private validarEquilibrio(lineas: LineaComprobanteDto[]): void {
    if (!lineas || lineas.length === 0) {
      throw new BadRequestException(
        'El comprobante debe tener al menos una línea',
      );
    }
    if (lineas.some((l) => !l.cuentaId)) {
      throw new BadRequestException(
        'Todas las líneas deben tener una cuenta asignada',
      );
    }
    const { totalDebito, totalCredito } = this.calcularTotales(lineas);
    if (Math.abs(totalDebito - totalCredito) >= 0.01) {
      throw new BadRequestException(
        `El comprobante no está equilibrado. Diferencia: ${Math.abs(totalDebito - totalCredito).toFixed(2)}`,
      );
    }
  }

  private mapearLineas(lineas: LineaComprobanteDto[]): LineaComprobante[] {
    return lineas.map((l) => ({
      ...l,
      cuentaId: new Types.ObjectId(l.cuentaId),
      elementoGastoId: l.elementoGastoId
        ? new Types.ObjectId(l.elementoGastoId)
        : undefined,
      centroCostoId: l.centroCostoId
        ? new Types.ObjectId(l.centroCostoId)
        : undefined,
    }));
  }

  async create(createDto: CreateComprobanteDto): Promise<Comprobante> {
    const existente = await this.comprobanteModel
      .findOne({ numero: createDto.numero })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe un comprobante con ese número');

    this.validarEquilibrio(createDto.lineas);
    const { totalDebito, totalCredito } = this.calcularTotales(
      createDto.lineas,
    );

    const created = new this.comprobanteModel({
      ...createDto,
      lineas: this.mapearLineas(createDto.lineas),
      totalDebito: createDto.totalDebito ?? totalDebito,
      totalCredito: createDto.totalCredito ?? totalCredito,
      equilibrado: true,
    });
    return created.save();
  }

  async findAll(): Promise<Comprobante[]> {
    return this.comprobanteModel
      .find()
      .sort({ fecha: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Comprobante> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Comprobante no encontrado');
    const doc = await this.comprobanteModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Comprobante no encontrado');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateComprobanteDto,
  ): Promise<Comprobante> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Comprobante no encontrado');

    const datos: Record<string, unknown> = { ...updateDto };
    if (updateDto.lineas) {
      this.validarEquilibrio(updateDto.lineas);
      const { totalDebito, totalCredito } = this.calcularTotales(
        updateDto.lineas,
      );
      datos.lineas = this.mapearLineas(updateDto.lineas);
      datos.totalDebito = updateDto.totalDebito ?? totalDebito;
      datos.totalCredito = updateDto.totalCredito ?? totalCredito;
      datos.equilibrado = true;
    }

    const updated = await this.comprobanteModel
      .findByIdAndUpdate(id, datos, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Comprobante no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Comprobante no encontrado');
    const removed = await this.comprobanteModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Comprobante no encontrado');
    return { deleted: true };
  }
}
