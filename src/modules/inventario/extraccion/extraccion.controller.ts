import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ExtraccionService } from './extraccion.service';
import { CreateExtraccionDto } from './dto/create-extraccion.dto';

@ApiTags('Extraccion')
@Controller('extraccion')
export class ExtraccionController {
  constructor(private readonly extraccionService: ExtraccionService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una extracción de caja' })
  @ApiResponse({ status: 201, description: 'Extracción registrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() dto: CreateExtraccionDto) {
    return this.extraccionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Historial de extracciones de caja' })
  @ApiResponse({ status: 200, description: 'Lista de extracciones' })
  findAll() {
    return this.extraccionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una extracción por ID' })
  @ApiParam({ name: 'id', description: 'ID de la extracción' })
  @ApiResponse({ status: 200, description: 'Extracción encontrada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  findOne(@Param('id') id: string) {
    return this.extraccionService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una extracción' })
  @ApiParam({ name: 'id', description: 'ID de la extracción' })
  @ApiResponse({ status: 200, description: 'Extracción eliminada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  remove(@Param('id') id: string) {
    return this.extraccionService.remove(id);
  }
}
