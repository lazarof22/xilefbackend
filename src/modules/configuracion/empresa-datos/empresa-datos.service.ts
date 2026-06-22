import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmpresaDatos,
  EmpresaDatosDocument,
} from './schemas/empresa-datos.schema';
import { UpdateEmpresaDatosDto } from './dto/update-empresa-datos.dto';

@Injectable()
export class EmpresaDatosService {
  constructor(
    @InjectModel(EmpresaDatos.name)
    private readonly empresaModel: Model<EmpresaDatosDocument>,
  ) {}

  async obtener(): Promise<EmpresaDatosDocument | null> {
    return this.empresaModel.findOne().lean().exec() as unknown as EmpresaDatosDocument | null;
  }

  async guardar(dto: UpdateEmpresaDatosDto): Promise<EmpresaDatosDocument> {
    const existente = await this.empresaModel.findOne();
    if (existente) {
      Object.assign(existente, dto);
      return existente.save();
    }
    const created = await this.empresaModel.create(dto);
    return created;
  }

  async guardarLogo(logo: string): Promise<EmpresaDatosDocument> {
    const existente = await this.empresaModel.findOne();
    if (existente) {
      existente.logo = logo;
      return existente.save();
    }
    const created = await this.empresaModel.create({ nombre: 'Sin nombre', logo });
    return created;
  }
}
