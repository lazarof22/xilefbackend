import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from './schema/proveedor.schema';
import { EstadoProveedor } from './types/proveedor.types';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectModel(Proveedor.name) private proveedorModel: Model<Proveedor>,
  ) {}

  async create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    const existCodigo = await this.proveedorModel.findOne({
      codigo: createProveedorDto.codigo,
    });
    if (existCodigo) {
      throw new BadRequestException('Ya existe un proveedor con ese código');
    }

    const existNit = await this.proveedorModel.findOne({
      nit: createProveedorDto.nit,
    });
    if (existNit) {
      throw new BadRequestException('Ya existe un proveedor con ese NIT');
    }

    const existREU = await this.proveedorModel.findOne({
      codigoREU: createProveedorDto.codigoREU,
    });
    if (existREU) {
      throw new BadRequestException(
        'Ya existe un proveedor con ese código REU',
      );
    }

    const nuevoProveedor = new this.proveedorModel(createProveedorDto);
    return nuevoProveedor.save();
  }

  async findAll(): Promise<Proveedor[]> {
    return this.proveedorModel
      .find()
      .populate('empresa tipo categoriasProducto monedaPreferida tipoContrato')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Proveedor> {
    const proveedor = await this.proveedorModel
      .findById(id)
      .populate('empresa tipo categoriasProducto monedaPreferida tipoContrato')
      .exec();
    if (!proveedor) {
      throw new NotFoundException('No se encontró el proveedor');
    }
    return proveedor;
  }

  async update(
    id: string,
    updateProveedorDto: UpdateProveedorDto,
  ): Promise<Proveedor> {
    const proveedor = await this.proveedorModel
      .findByIdAndUpdate(id, updateProveedorDto, { new: true })
      .populate('empresa tipo categoriasProducto monedaPreferida tipoContrato')
      .exec();
    if (!proveedor) {
      throw new NotFoundException('No se encontró el proveedor');
    }
    return proveedor;
  }

  async remove(id: string): Promise<void> {
    const proveedor = await this.proveedorModel.findByIdAndDelete(id);
    if (!proveedor) {
      throw new NotFoundException('No se encontró el proveedor');
    }
  }

  async findByCategoria(categoriaId: string): Promise<Proveedor[]> {
    return this.proveedorModel
      .find({ categoriasProducto: categoriaId })
      .populate('empresa tipo categoriasProducto monedaPreferida tipoContrato')
      .exec();
  }

  async findByEstado(estado: EstadoProveedor): Promise<Proveedor[]> {
    return this.proveedorModel
      .find({ estado })
      .populate('empresa tipo categoriasProducto monedaPreferida tipoContrato')
      .exec();
  }

  async calificar(id: string, calificacion: number): Promise<Proveedor> {
    const proveedor = await this.proveedorModel
      .findByIdAndUpdate(id, { calificacion }, { new: true })
      .populate('empresa tipo categoriasProducto monedaPreferida tipoContrato')
      .exec();
    if (!proveedor) {
      throw new NotFoundException('No se encontró el proveedor');
    }
    return proveedor;
  }

  async findByTipo(tipoId: string): Promise<Proveedor[]> {
    return this.proveedorModel
      .find({ tipo: tipoId })
      .populate('empresa tipo categoriasProducto monedaPreferida tipoContrato')
      .exec();
  }
}
