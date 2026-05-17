import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartamentoService } from './departamento.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Departamento')
@Controller('departamento')
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) { }


  @ApiOperation({ summary: 'Registrar un nuevo departamento' })
  @ApiResponse({ status: 201, description: 'Departamento registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createDepartamentoDto: CreateDepartamentoDto) {
    return this.departamentoService.create(createDepartamentoDto);
  }


  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  @ApiResponse({ status: 201, description: 'Departamentos obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.departamentoService.findAll();
  }


  @ApiOperation({ summary: 'Obtener un departamento' })
  @ApiResponse({ status: 201, description: 'Departamento obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departamentoService.findOne(id);
  }


  @ApiOperation({ summary: 'Modificar un departamento' })
  @ApiResponse({ status: 201, description: 'Departamento modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartamentoDto: UpdateDepartamentoDto) {
    return this.departamentoService.update(id, updateDepartamentoDto);
  }


  @ApiOperation({ summary: 'Eliminar un departamento' })
  @ApiResponse({ status: 201, description: 'Departamento eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departamentoService.remove(id);
  }
}
