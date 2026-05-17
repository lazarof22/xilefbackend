import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CargoEmpleadoService } from './cargo_empleado.service';
import { CreateCargoEmpleadoDto } from './dto/create-cargo_empleado.dto';
import { UpdateCargoEmpleadoDto } from './dto/update-cargo_empleado.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Cargo de Empleado')
@Controller('cargo-empleado')
export class CargoEmpleadoController {
  constructor(private readonly cargoEmpleadoService: CargoEmpleadoService) { }


  @ApiOperation({ summary: 'Registrar un nuevo cargo' })
  @ApiResponse({ status: 201, description: 'Cargo registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createCargoEmpleadoDto: CreateCargoEmpleadoDto) {
    return this.cargoEmpleadoService.create(createCargoEmpleadoDto);
  }


  @ApiOperation({ summary: 'Obtener todos los cargos' })
  @ApiResponse({ status: 201, description: 'Cargos obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.cargoEmpleadoService.findAll();
  }


  @ApiOperation({ summary: 'Obtener un cargo' })
  @ApiResponse({ status: 201, description: 'Cargo obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargoEmpleadoService.findOne(id);
  }


  @ApiOperation({ summary: 'Modificar un cargo' })
  @ApiResponse({ status: 201, description: 'Cargo modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCargoEmpleadoDto: UpdateCargoEmpleadoDto) {
    return this.cargoEmpleadoService.update(id, updateCargoEmpleadoDto);
  }


  @ApiOperation({ summary: 'Eliminar un cargo' })
  @ApiResponse({ status: 201, description: 'Cargo eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cargoEmpleadoService.remove(id);
  }
}
