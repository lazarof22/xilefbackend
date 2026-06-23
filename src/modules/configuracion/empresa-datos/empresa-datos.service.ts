import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmpresaDatos,
  EmpresaDatosDocument,
} from './schemas/empresa-datos.schema';
import { UpdateEmpresaDatosDto } from './dto/update-empresa-datos.dto';
import { NomencladorHelper } from '../nomenclador-helper/nomenclador-helper.service';

@Injectable()
export class EmpresaDatosService {
  constructor(
    @InjectModel(EmpresaDatos.name)
    private readonly empresaModel: Model<EmpresaDatosDocument>,
    private readonly nomencladorHelper: NomencladorHelper,
  ) {}

  async obtener(): Promise<EmpresaDatosDocument | null> {
    return this.empresaModel.findOne().lean().exec() as unknown as EmpresaDatosDocument | null;
  }

  async guardar(dto: UpdateEmpresaDatosDto): Promise<EmpresaDatosDocument> {
    const data: Record<string, any> = { ...dto };
    if (dto.pais && !this.nomencladorHelper.isObjectId(dto.pais)) {
      data.pais = await this.nomencladorHelper.findOrCreatePais(dto.pais);
    }
    const existente = await this.empresaModel.findOne();
    if (existente) {
      Object.assign(existente, data);
      return existente.save();
    }
    const created = await this.empresaModel.create(data);
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
