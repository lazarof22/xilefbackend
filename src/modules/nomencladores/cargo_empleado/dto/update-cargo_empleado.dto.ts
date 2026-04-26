import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoEmpleadoDto } from './create-cargo_empleado.dto';

export class UpdateCargoEmpleadoDto extends PartialType(CreateCargoEmpleadoDto) {}
