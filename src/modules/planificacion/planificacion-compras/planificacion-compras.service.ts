import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePlanCompraDto } from './dto/create-plan-compra.dto';
import { UpdatePlanCompraDto } from './dto/update-plan-compra.dto';
import { PlanCompra, PlanCompraDocument } from './schema/plan-compra.schema';
import { EstadoPlanCompra } from './types/plan-compra.types';

@Injectable()
export class PlanificacionComprasService {
  constructor(
    @InjectModel(PlanCompra.name)
    private planCompraModel: Model<PlanCompraDocument>,
  ) {}

  async create(createDto: CreatePlanCompraDto): Promise<PlanCompra> {
    const existente = await this.planCompraModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException(
        'Ya existe un plan de compra con ese código',
      );
    const created = new this.planCompraModel(createDto);
    return created.save();
  }

  async findAll(): Promise<PlanCompra[]> {
    return this.planCompraModel
      .find()
      .populate('producto')
      .populate('proveedorPreferido')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ fechaPlanificada: -1 })
      .exec();
  }

  async findOne(id: string): Promise<PlanCompra> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de compra no encontrado');
    const doc = await this.planCompraModel
      .findById(id)
      .populate('producto')
      .populate('proveedorPreferido')
      .populate('centroCosto')
      .populate('moneda')
      .exec();
    if (!doc) throw new NotFoundException('Plan de compra no encontrado');
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdatePlanCompraDto,
  ): Promise<PlanCompra> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de compra no encontrado');
    const updated = await this.planCompraModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Plan de compra no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de compra no encontrado');
    const removed = await this.planCompraModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Plan de compra no encontrado');
    return { deleted: true };
  }

  async findByProducto(productoId: string): Promise<PlanCompra[]> {
    return this.planCompraModel
      .find({ producto: productoId })
      .populate('producto')
      .populate('proveedorPreferido')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ fechaPlanificada: -1 })
      .exec();
  }

  async findByProveedor(proveedorId: string): Promise<PlanCompra[]> {
    return this.planCompraModel
      .find({ proveedorPreferido: proveedorId })
      .populate('producto')
      .populate('proveedorPreferido')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ fechaPlanificada: -1 })
      .exec();
  }

  async findByEstado(estado: EstadoPlanCompra): Promise<PlanCompra[]> {
    return this.planCompraModel
      .find({ estado })
      .populate('producto')
      .populate('proveedorPreferido')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ fechaPlanificada: -1 })
      .exec();
  }

  async findPendientes(): Promise<PlanCompra[]> {
    return this.planCompraModel
      .find({
        estado: {
          $in: [EstadoPlanCompra.PLANIFICADO, EstadoPlanCompra.EN_PROCESO],
        },
      })
      .populate('producto')
      .populate('proveedorPreferido')
      .populate('centroCosto')
      .populate('moneda')
      .sort({ prioridad: 1, fechaPlanificada: 1 })
      .exec();
  }

  async registrarCompra(id: string, cantidad: number): Promise<PlanCompra> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Plan de compra no encontrado');
    if (cantidad <= 0)
      throw new BadRequestException('La cantidad debe ser mayor a 0');

    const plan = await this.planCompraModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan de compra no encontrado');
    if (plan.estado === EstadoPlanCompra.COMPLETADO)
      throw new BadRequestException('El plan de compra ya está completado');
    if (plan.estado === EstadoPlanCompra.CANCELADO)
      throw new BadRequestException('El plan de compra está cancelado');

    plan.cantidadComprada = Number(
      (plan.cantidadComprada + cantidad).toFixed(2),
    );
    plan.fechaCompra = new Date();

    if (plan.estado === EstadoPlanCompra.PLANIFICADO)
      plan.estado = EstadoPlanCompra.EN_PROCESO;

    if (plan.cantidadComprada >= plan.cantidadPlanificada)
      plan.estado = EstadoPlanCompra.COMPLETADO;

    return plan.save();
  }
}
