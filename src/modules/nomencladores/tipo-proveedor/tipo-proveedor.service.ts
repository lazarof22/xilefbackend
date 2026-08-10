import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTipoProveedorDto } from './dto/create-tipo-proveedor.dto';
import { UpdateTipoProveedorDto } from './dto/update-tipo-proveedor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TipoProveedor } from './schema/tipo-proveedor.schema';
import { Model } from 'mongoose';

@Injectable()
export class TipoProveedorService {
  constructor(
    @InjectModel(TipoProveedor.name)
    private tipoProveedorModel: Model<TipoProveedor>,
  ) {}

  async create(
    createTipoProveedorDto: CreateTipoProveedorDto,
  ): Promise<TipoProveedor> {
    const exist = await this.tipoProveedorModel.findOne({
      nombre: createTipoProveedorDto.nombre,
    });

    if (exist) {
      throw new BadRequestException('Ya existe el tipo de proveedor');
    }
    const nuevo = new this.tipoProveedorModel(createTipoProveedorDto);
    return nuevo.save();
  }

  async findAll(): Promise<TipoProveedor[]> {
    return this.tipoProveedorModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TipoProveedor> {
    const item = await this.tipoProveedorModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('No se encontró el tipo de proveedor');
    }
    return item;
  }

  async update(
    id: string,
    updateTipoProveedorDto: UpdateTipoProveedorDto,
  ): Promise<TipoProveedor> {
    const item = await this.tipoProveedorModel
      .findByIdAndUpdate(id, updateTipoProveedorDto, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('No se encontró el tipo de proveedor');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const item = await this.tipoProveedorModel.findByIdAndDelete(id);

    if (!item) {
      throw new NotFoundException('No se encontró el tipo de proveedor');
    }
  }
}
