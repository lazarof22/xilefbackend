import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { PaisService } from '../../nomencladores/pais/pais.service';
import { CategoriaService } from '../../nomencladores/categoria/categoria.service';
import { EstadoService } from '../../nomencladores/estado/estado.service';
import { DepartamentoService } from '../../nomencladores/departamento/departamento.service';
import { CargoEmpleadoService } from '../../nomencladores/cargo_empleado/cargo_empleado.service';

@Injectable()
export class NomencladorHelper {
  constructor(
    private readonly paisService: PaisService,
    private readonly categoriaService: CategoriaService,
    private readonly estadoService: EstadoService,
    private readonly departamentoService: DepartamentoService,
    private readonly cargoEmpleadoService: CargoEmpleadoService,
  ) {}

  async findOrCreatePais(nombre: string): Promise<Types.ObjectId> {
    return this.paisService.findOrCreate(nombre);
  }

  async findOrCreateCategoria(nombre: string): Promise<Types.ObjectId> {
    return this.categoriaService.findOrCreate(nombre);
  }

  async findOrCreateEstado(nombre: string): Promise<Types.ObjectId> {
    return this.estadoService.findOrCreate(nombre);
  }

  async findOrCreateDepartamento(nombre: string): Promise<Types.ObjectId> {
    return this.departamentoService.findOrCreate(nombre);
  }

  async findOrCreateCargoEmpleado(nombre: string): Promise<Types.ObjectId> {
    return this.cargoEmpleadoService.findOrCreate(nombre);
  }

  isObjectId(value: any): boolean {
    if (value instanceof Types.ObjectId) return true;
    if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) return true;
    return false;
  }
}
