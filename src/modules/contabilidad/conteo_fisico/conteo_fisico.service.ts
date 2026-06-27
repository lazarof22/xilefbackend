import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateConteoFisicoDto } from './dto/create-conteo_fisico.dto';
import { UpdateConteoFisicoDto } from './dto/update-conteo_fisico.dto';
import { CreateConteoDetalleDto } from './dto/create-conteo_detalle.dto';
import { ConteoFisico, ConteoFisicoDocument, EstadoConteo } from './schema/conteo_fisico.schema';
import { ConteoDetalle, ConteoDetalleDocument, ResultadoConteo } from './schema/conteo_detalle.schema';

@Injectable()
export class ConteoFisicoService {
  constructor(
    @InjectModel(ConteoFisico.name) private conteoModel: Model<ConteoFisicoDocument>,
    @InjectModel(ConteoDetalle.name) private detalleModel: Model<ConteoDetalleDocument>,
  ) {}

  async create(createDto: CreateConteoFisicoDto): Promise<ConteoFisico> {
    const existente = await this.conteoModel.findOne({ codigoConteo: createDto.codigoConteo }).exec();
    if (existente) {
      throw new BadRequestException('Ya existe un conteo con ese código');
    }
    const created = new this.conteoModel(createDto);
    return created.save();
  }

  async findAll(): Promise<ConteoFisico[]> {
    return this.conteoModel.find()
      .populate('area')
      .sort({ fechaProgramada: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ConteoFisico> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conteo no encontrado');
    const doc = await this.conteoModel.findById(id)
      .populate('area')
      .exec();
    if (!doc) throw new NotFoundException('Conteo no encontrado');
    return doc;
  }

  async update(id: string, updateDto: UpdateConteoFisicoDto): Promise<ConteoFisico> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conteo no encontrado');
    const updated = await this.conteoModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Conteo no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conteo no encontrado');
    const removed = await this.conteoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Conteo no encontrado');
    await this.detalleModel.deleteMany({ conteoFisico: id }).exec();
    return { deleted: true };
  }

  async iniciarConteo(id: string): Promise<ConteoFisico> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conteo no encontrado');
    const conteo = await this.conteoModel.findById(id).exec();
    if (!conteo) throw new NotFoundException('Conteo no encontrado');
    if (conteo.estado !== EstadoConteo.PROGRAMADO) {
      throw new BadRequestException('El conteo debe estar en estado programado para iniciarse');
    }
    conteo.estado = EstadoConteo.EN_PROCESO;
    return conteo.save();
  }

  async completarConteo(id: string): Promise<ConteoFisico> {
    if (!isValidObjectId(id)) throw new NotFoundException('Conteo no encontrado');
    const conteo = await this.conteoModel.findById(id).exec();
    if (!conteo) throw new NotFoundException('Conteo no encontrado');
    if (conteo.estado !== EstadoConteo.EN_PROCESO) {
      throw new BadRequestException('El conteo debe estar en proceso para completarse');
    }

    const detalles = await this.detalleModel.find({ conteoFisico: id }).exec();
    const totalContados = detalles.length;
    const totalCoincidentes = detalles.filter(d => d.resultado === ResultadoConteo.COINCIDE).length;
    const totalSobrantes = detalles.filter(d => d.resultado === ResultadoConteo.SOBRANTE).length;
    const totalFaltantes = detalles.filter(d => d.resultado === ResultadoConteo.FALTANTE).length;
    const totalDiscrepancias = totalSobrantes + totalFaltantes + detalles.filter(d => d.resultado === ResultadoConteo.DANADO).length;

    conteo.estado = EstadoConteo.COMPLETADO;
    conteo.fechaRealizacion = new Date();
    conteo.totalActivosContados = totalContados;
    conteo.totalCoincidentes = totalCoincidentes;
    conteo.totalDiscrepancias = totalDiscrepancias;
    conteo.totalSobrantes = totalSobrantes;
    conteo.totalFaltantes = totalFaltantes;

    return conteo.save();
  }

  async getDetalles(conteoId: string): Promise<ConteoDetalle[]> {
    if (!isValidObjectId(conteoId)) throw new NotFoundException('Conteo no encontrado');
    return this.detalleModel.find({ conteoFisico: conteoId })
      .populate('activoFijo')
      .exec();
  }

  async agregarDetalle(createDetalleDto: CreateConteoDetalleDto): Promise<ConteoDetalle> {
    const created = new this.detalleModel(createDetalleDto);
    return created.save();
  }

  async getResumenDiscrepancias(): Promise<any> {
    const result = await this.detalleModel.aggregate([
      { $match: { resultado: { $ne: ResultadoConteo.COINCIDE } } },
      { $group: { _id: '$resultado', total: { $sum: 1 } } },
    ]).exec();
    return result;
  }
}
