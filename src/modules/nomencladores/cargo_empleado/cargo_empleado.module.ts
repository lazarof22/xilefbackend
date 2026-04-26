import { Module } from '@nestjs/common';
import { CargoEmpleadoService } from './cargo_empleado.service';
import { CargoEmpleadoController } from './cargo_empleado.controller';

@Module({
  controllers: [CargoEmpleadoController],
  providers: [CargoEmpleadoService],
})
export class CargoEmpleadoModule {}
