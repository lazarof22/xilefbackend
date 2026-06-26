import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GrupoActivoService } from './grupo_activo.service';
import { CreateGrupoActivoDto } from './dto/create-grupo_activo.dto';
import { UpdateGrupoActivoDto } from './dto/update-grupo_activo.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Grupos de Activos Fijos')
@Controller('grupo-activo')
export class GrupoActivoController {
  constructor(private readonly grupoActivoService: GrupoActivoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo grupo de activo' })
  @ApiResponse({ status: 201, description: 'Grupo registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createDto: CreateGrupoActivoDto) {
    return this.grupoActivoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grupos' })
  @ApiResponse({ status: 200, description: 'Lista de grupos' })
  findAll() {
    return this.grupoActivoService.findAll();
  }

  @Get('activos')
  @ApiOperation({ summary: 'Obtener solo grupos activos' })
  @ApiResponse({ status: 200, description: 'Grupos activos obtenidos' })
  getGruposActivos() {
    return this.grupoActivoService.getGruposActivos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo encontrado' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.grupoActivoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo actualizado' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateGrupoActivoDto) {
    return this.grupoActivoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo eliminado' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  remove(@Param('id') id: string) {
    return this.grupoActivoService.remove(id);
  }
}
