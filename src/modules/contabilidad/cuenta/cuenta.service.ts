import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { Cuenta, CuentaDocument } from './schema/cuenta.schema';

@Injectable()
export class CuentaService {
  constructor(
    @InjectModel(Cuenta.name) private cuentaModel: Model<CuentaDocument>,
  ) {}

  private calcularNivel(codigo: string): number {
    return codigo.split('.').filter(Boolean).length;
  }

  private async validarPadre(padre?: string): Promise<void> {
    if (!padre) return;
    if (!isValidObjectId(padre))
      throw new BadRequestException('Cuenta padre no válida');
    const exist = await this.cuentaModel.findById(padre).exec();
    if (!exist)
      throw new BadRequestException('La cuenta padre indicada no existe');
  }

  async create(createDto: CreateCuentaDto): Promise<Cuenta> {
    const existente = await this.cuentaModel
      .findOne({ codigo: createDto.codigo })
      .exec();
    if (existente)
      throw new BadRequestException('Ya existe una cuenta con ese código');
    await this.validarPadre(createDto.padre);

    const created = new this.cuentaModel({
      ...createDto,
      nivel: createDto.nivel ?? this.calcularNivel(createDto.codigo),
    });
    return created.save();
  }

  async findAll(): Promise<Cuenta[]> {
    return this.cuentaModel.find().sort({ codigo: 1 }).exec();
  }

  async findOne(id: string): Promise<Cuenta> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta no encontrada');
    const doc = await this.cuentaModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Cuenta no encontrada');
    return doc;
  }

  async update(id: string, updateDto: UpdateCuentaDto): Promise<Cuenta> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta no encontrada');
    const actual = await this.cuentaModel.findById(id).exec();
    if (!actual) throw new NotFoundException('Cuenta no encontrada');

    if (updateDto.padre && updateDto.padre !== id)
      await this.validarPadre(updateDto.padre);
    if (updateDto.padre === id)
      throw new BadRequestException(
        'Una cuenta no puede ser padre de sí misma',
      );

    const codigoFinal = updateDto.codigo ?? actual.codigo;
    if (updateDto.codigo) {
      const duplicado = await this.cuentaModel
        .findOne({ codigo: updateDto.codigo, _id: { $ne: id } })
        .exec();
      if (duplicado)
        throw new BadRequestException('Ya existe una cuenta con ese código');
    }

    const datos = { ...updateDto };
    if (updateDto.nivel === undefined && updateDto.codigo)
      datos.nivel = this.calcularNivel(codigoFinal);

    const updated = await this.cuentaModel
      .findByIdAndUpdate(id, datos, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Cuenta no encontrada');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id))
      throw new NotFoundException('Cuenta no encontrada');
    const hijos = await this.cuentaModel.countDocuments({ padre: id }).exec();
    if (hijos > 0)
      throw new BadRequestException(
        'No se puede eliminar una cuenta que tiene cuentas hijas',
      );
    const removed = await this.cuentaModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Cuenta no encontrada');
    return { deleted: true };
  }
}
