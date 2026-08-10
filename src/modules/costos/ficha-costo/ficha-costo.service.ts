import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateFichaCostoDto } from './dto/create-ficha-costo.dto';
import { UpdateFichaCostoDto } from './dto/update-ficha-costo.dto';
import { FichaCosto, FichaCostoDocument } from './schema/ficha-costo.schema';

@Injectable()
export class FichaCostoService {
  constructor(
    @InjectModel(FichaCosto.name)
    private fichaCostoModel: Model<FichaCostoDocument>,
  ) {}

  private calcularCostos(dto: CreateFichaCostoDto | UpdateFichaCostoDto): {
    costoTotal: number;
    costoUnitario: number;
  } {
    const materiaPrima = dto.materiaPrima ?? 0;
    const manoObraDirecta = dto.manoObraDirecta ?? 0;
    const costosIndirectos = dto.costosIndirectos ?? 0;
    const otrosCostos = dto.otrosCostos ?? 0;

    const costoTotal =
      materiaPrima + manoObraDirecta + costosIndirectos + otrosCostos;

    const unidadesProducidas = dto.unidadesProducidas ?? 0;
    const costoUnitario =
      unidadesProducidas > 0 ? costoTotal / unidadesProducidas : 0;

    return { costoTotal, costoUnitario };
  }

  async create(createDto: CreateFichaCostoDto): Promise<FichaCosto> {
    const existente = await this.fichaCostoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente) {
      throw new BadRequestException(
        'Ya existe una ficha de costo con ese código',
      );
    }

    const { costoTotal, costoUnitario } = this.calcularCostos(createDto);
    const created = new this.fichaCostoModel({
      ...createDto,
      costoTotal,
      costoUnitario,
    });
    return created.save();
  }

  async findAll(): Promise<FichaCosto[]> {
    return this.fichaCostoModel
      .find()
      .populate('producto')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ periodo: -1, codigo: 1 })
      .exec();
  }

  async findOne(id: string): Promise<FichaCosto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Ficha de costo no encontrada');
    }
    const doc = await this.fichaCostoModel
      .findById(id)
      .populate('producto')
      .populate('centroCosto')
      .populate('moneda')
      .exec();
    if (!doc) {
      throw new NotFoundException('Ficha de costo no encontrada');
    }
    return doc;
  }

  async findByProducto(productoId: string): Promise<FichaCosto[]> {
    return this.fichaCostoModel
      .find({ producto: productoId })
      .populate('producto')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ periodo: -1 })
      .exec();
  }

  async findByCentroCosto(centroCostoId: string): Promise<FichaCosto[]> {
    return this.fichaCostoModel
      .find({ centroCosto: centroCostoId })
      .populate('producto')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ periodo: -1 })
      .exec();
  }

  async findByPeriodo(periodo: string): Promise<FichaCosto[]> {
    return this.fichaCostoModel
      .find({ periodo })
      .populate('producto')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ codigo: 1 })
      .exec();
  }

  async update(
    id: string,
    updateDto: UpdateFichaCostoDto,
  ): Promise<FichaCosto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Ficha de costo no encontrada');
    }
    if (updateDto.codigo) {
      const existente = await this.fichaCostoModel
        .findOne({ codigo: updateDto.codigo, _id: { $ne: id } })
        .exec();
      if (existente) {
        throw new BadRequestException(
          'Ya existe una ficha de costo con ese código',
        );
      }
    }

    const fichaActual = await this.fichaCostoModel.findById(id).exec();
    if (!fichaActual) {
      throw new NotFoundException('Ficha de costo no encontrada');
    }

    const mergedDto = {
      materiaPrima: fichaActual.materiaPrima,
      manoObraDirecta: fichaActual.manoObraDirecta,
      costosIndirectos: fichaActual.costosIndirectos,
      otrosCostos: fichaActual.otrosCostos,
      unidadesProducidas: fichaActual.unidadesProducidas,
      ...updateDto,
    };

    const { costoTotal, costoUnitario } = this.calcularCostos(mergedDto);
    const updated = await this.fichaCostoModel
      .findByIdAndUpdate(
        id,
        { ...updateDto, costoTotal, costoUnitario },
        { new: true },
      )
      .populate('producto')
      .populate('centroCosto')
      .populate('moneda')
      .exec();
    if (!updated) {
      throw new NotFoundException('Ficha de costo no encontrada');
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Ficha de costo no encontrada');
    }
    const removed = await this.fichaCostoModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException('Ficha de costo no encontrada');
    }
    return { deleted: true };
  }
}
