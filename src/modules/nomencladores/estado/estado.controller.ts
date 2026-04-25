import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('estado')
export class EstadoController {
  constructor(private readonly estadoService: EstadoService) { }

  @ApiOperation({ summary: 'Registrar un nuevo Estado' })
  @ApiResponse({ status: 201, description: 'Estado registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createEstadoDto: CreateEstadoDto) {
    return this.estadoService.create(createEstadoDto);
  }

  @ApiOperation({ summary: 'Obtener todos los estado' })
  @ApiResponse({ status: 201, description: 'Estados obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.estadoService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un estado' })
  @ApiResponse({ status: 201, description: 'Estado obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un estado' })
  @ApiResponse({ status: 201, description: 'Estado modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstadoDto: UpdateEstadoDto) {
    return this.estadoService.update(id, updateEstadoDto);
  }

  @ApiOperation({ summary: 'Eliminar un estado' })
  @ApiResponse({ status: 201, description: 'Estado eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadoService.remove(id);
  }
}
