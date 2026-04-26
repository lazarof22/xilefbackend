import { Injectable } from '@nestjs/common';
import { CreateCargoEmpleadoDto } from './dto/create-cargo_empleado.dto';
import { UpdateCargoEmpleadoDto } from './dto/update-cargo_empleado.dto';

@Injectable()
export class CargoEmpleadoService {
  create(createCargoEmpleadoDto: CreateCargoEmpleadoDto) {
    return 'This action adds a new cargoEmpleado';
  }

  findAll() {
    return `This action returns all cargoEmpleado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cargoEmpleado`;
  }

  update(id: number, updateCargoEmpleadoDto: UpdateCargoEmpleadoDto) {
    return `This action updates a #${id} cargoEmpleado`;
  }

  remove(id: number) {
    return `This action removes a #${id} cargoEmpleado`;
  }
}
