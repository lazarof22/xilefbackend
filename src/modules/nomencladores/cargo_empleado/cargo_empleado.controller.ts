import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CargoEmpleadoService } from './cargo_empleado.service';
import { CreateCargoEmpleadoDto } from './dto/create-cargo_empleado.dto';
import { UpdateCargoEmpleadoDto } from './dto/update-cargo_empleado.dto';

@Controller('cargo-empleado')
export class CargoEmpleadoController {
  constructor(private readonly cargoEmpleadoService: CargoEmpleadoService) {}

  @Post()
  create(@Body() createCargoEmpleadoDto: CreateCargoEmpleadoDto) {
    return this.cargoEmpleadoService.create(createCargoEmpleadoDto);
  }

  @Get()
  findAll() {
    return this.cargoEmpleadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargoEmpleadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCargoEmpleadoDto: UpdateCargoEmpleadoDto) {
    return this.cargoEmpleadoService.update(+id, updateCargoEmpleadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cargoEmpleadoService.remove(+id);
  }
}
