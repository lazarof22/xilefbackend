import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Usuario, UsuarioDocument } from '../../auth/schemas/empleado.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  async findAll(): Promise<UsuarioDocument[]> {
    return this.usuarioModel.find().select('-contraseña').sort({ createdAt: -1 }).lean().exec() as unknown as UsuarioDocument[];
  }

  async create(dto: CreateUsuarioDto): Promise<UsuarioDocument> {
    const exists = await this.usuarioModel.findOne({ correo_empleado: dto.correo_empleado });
    if (exists) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }
    const ciExists = await this.usuarioModel.findOne({ ci_empleado: dto.ci_empleado });
    if (ciExists) {
      throw new ConflictException('Ya existe un usuario con esa cédula');
    }
    const hashedPassword = await bcrypt.hash(dto.contraseña, 10);
    return this.usuarioModel.create({ ...dto, contraseña: hashedPassword });
  }

  async remove(id: string): Promise<void> {
    const result = await this.usuarioModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
