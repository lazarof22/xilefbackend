import { Module } from '@nestjs/common';
import { CargoEmpleadoService } from './cargo_empleado.service';
import { CargoEmpleadoController } from './cargo_empleado.controller';
import { CargoEmpleado, CargoEmpleadoSchema } from './schema/cargo_empleado.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [CargoEmpleadoController],
  providers: [CargoEmpleadoService],

  imports: [MongooseModule.forFeature([{
    name: CargoEmpleado.name,
    schema: CargoEmpleadoSchema,
  },

  ]),],
  exports: [MongooseModule, CargoEmpleadoService],
})
export class CargoEmpleadoModule { }
