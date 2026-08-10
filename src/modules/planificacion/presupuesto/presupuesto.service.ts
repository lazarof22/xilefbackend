import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { Presupuesto, PresupuestoDocument } from './schema/presupuesto.schema';
import { EstadoPresupuesto, TipoPresupuesto } from './types/presupuesto.types';

@Injectable()
export class PresupuestoService {
  constructor(
    @InjectModel(Presupuesto.name)
    private presupuestoModel: Model<PresupuestoDocument>,
  ) {}

  async create(createDto: CreatePresupuestoDto): Promise<Presupuesto> {
    const existente = await this.presupuestoModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe un presupuesto con ese código');

    if (createDto.planMensual && createDto.planMensual.length !== 12)
      throw new BadRequestException(
        'El plan mensual debe tener exactamente 12 elementos',
      );

    const created = new this.presupuestoModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Presupuesto[]> {
    return this.presupuestoModel
      .find()
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ periodo: -1, codigo: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Presupuesto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Presupuesto no encontrado');
    const doc = await this.presupuestoModel
      .findById(id)
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .exec();
    if (!doc) throw new NotFoundException('Presupuesto no encontrado');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdatePresupuestoDto,
  ): Promise<Presupuesto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Presupuesto no encontrado');

    if (updateDto.planMensual && updateDto.planMensual.length !== 12)
      throw new BadRequestException(
        'El plan mensual debe tener exactamente 12 elementos',
      );

    const updated = await this.presupuestoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Presupuesto no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Presupuesto no encontrado');
    const removed = await this.presupuestoModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Presupuesto no encontrado');
    return { deleted: true };
  }

  async findByPeriodo(periodo: string): Promise<Presupuesto[]> {
    return this.presupuestoModel
      .find({ periodo })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ codigo: 1 })
      .exec();
  }

  async findByCentroCosto(centroCostoId: string): Promise<Presupuesto[]> {
    return this.presupuestoModel
      .find({ centroCosto: centroCostoId })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ periodo: -1 })
      .exec();
  }

  async findByTipo(tipo: TipoPresupuesto): Promise<Presupuesto[]> {
    return this.presupuestoModel
      .find({ tipo })
      .populate('centroCosto')
      .populate('tipoGasto')
      .populate('moneda')
      .sort({ periodo: -1 })
      .exec();
  }

  async aprobar(id: string): Promise<Presupuesto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Presupuesto no encontrado');
    const presupuesto = await this.presupuestoModel.findById(id).exec();
    if (!presupuesto) throw new NotFoundException('Presupuesto no encontrado');
    if (presupuesto.estado === EstadoPresupuesto.CERRADO)
      throw new BadRequestException(
        'No se puede aprobar un presupuesto cerrado',
      );
    if (presupuesto.estado === EstadoPresupuesto.APROBADO)
      throw new BadRequestException('El presupuesto ya está aprobado');
    presupuesto.estado = EstadoPresupuesto.APROBADO;
    return presupuesto.save();
  }

  async cerrar(id: string): Promise<Presupuesto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Presupuesto no encontrado');
    const presupuesto = await this.presupuestoModel.findById(id).exec();
    if (!presupuesto) throw new NotFoundException('Presupuesto no encontrado');
    if (presupuesto.estado === EstadoPresupuesto.CERRADO)
      throw new BadRequestException('El presupuesto ya está cerrado');
    presupuesto.estado = EstadoPresupuesto.CERRADO;
    return presupuesto.save();
  }

  async registrarEjecucion(
    id: string,
    monto: number,
    mes: number,
  ): Promise<Presupuesto> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Presupuesto no encontrado');
    if (mes < 1 || mes > 12)
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    if (monto <= 0)
      throw new BadRequestException('El monto debe ser mayor a 0');

    const presupuesto = await this.presupuestoModel.findById(id).exec();
    if (!presupuesto) throw new NotFoundException('Presupuesto no encontrado');
    if (
      presupuesto.estado !== EstadoPresupuesto.APROBADO &&
      presupuesto.estado !== EstadoPresupuesto.EN_EJECUCION
    )
      throw new BadRequestException(
        'El presupuesto debe estar aprobado o en ejecución',
      );

    if (
      !presupuesto.ejecutadoMensual ||
      presupuesto.ejecutadoMensual.length === 0
    )
      presupuesto.ejecutadoMensual = Array<number>(12).fill(0);

    if (presupuesto.ejecutadoMensual.length < 12) {
      const expanded: number[] = Array<number>(12).fill(0);
      for (let i = 0; i < presupuesto.ejecutadoMensual.length; i++) {
        expanded[i] = presupuesto.ejecutadoMensual[i];
      }
      presupuesto.ejecutadoMensual = expanded;
    }

    presupuesto.ejecutadoMensual[mes - 1] = Number(
      (presupuesto.ejecutadoMensual[mes - 1] + monto).toFixed(2),
    );
    presupuesto.ejecutado = Number((presupuesto.ejecutado + monto).toFixed(2));

    if (presupuesto.estado === EstadoPresupuesto.APROBADO)
      presupuesto.estado = EstadoPresupuesto.EN_EJECUCION;

    return presupuesto.save();
  }
}
