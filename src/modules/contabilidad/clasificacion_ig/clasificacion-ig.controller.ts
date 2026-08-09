import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClasificacionIGService } from './clasificacion-ig.service';
import { CreateClasificacionIGDto } from './dto/create-clasificacion-ig.dto';
import { UpdateClasificacionIGDto } from './dto/update-clasificacion-ig.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Clasificación Ingresos/Gastos')
@Controller('clasificacion-ig')
export class ClasificacionIGController {
  constructor(
    private readonly clasificacionIGService: ClasificacionIGService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Clasificar una cuenta como Ingreso o Gasto' })
  @ApiResponse({ status: 201, description: 'Clasificación registrada' })
  @ApiResponse({ status: 400, description: 'La cuenta ya está clasificada' })
  create(@Body() createDto: CreateClasificacionIGDto) {
    return this.clasificacionIGService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las clasificaciones' })
  @ApiResponse({ status: 200, description: 'Lista de clasificaciones' })
  findAll() {
    return this.clasificacionIGService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una clasificación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la clasificación' })
  @ApiResponse({ status: 200, description: 'Clasificación encontrada' })
  @ApiResponse({ status: 404, description: 'Clasificación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.clasificacionIGService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una clasificación' })
  @ApiParam({ name: 'id', description: 'ID de la clasificación' })
  @ApiResponse({ status: 200, description: 'Clasificación actualizada' })
  @ApiResponse({ status: 404, description: 'Clasificación no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateClasificacionIGDto) {
    return this.clasificacionIGService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una clasificación' })
  @ApiParam({ name: 'id', description: 'ID de la clasificación' })
  @ApiResponse({ status: 200, description: 'Clasificación eliminada' })
  @ApiResponse({ status: 404, description: 'Clasificación no encontrada' })
  remove(@Param('id') id: string) {
    return this.clasificacionIGService.remove(id);
  }
}
