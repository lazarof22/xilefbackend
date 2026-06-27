import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GrupoActivoService } from './grupo_activo.service';
import { CreateGrupoActivoDto } from './dto/create-grupo_activo.dto';
import { UpdateGrupoActivoDto } from './dto/update-grupo_activo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Grupos de Activos Fijos')
@Controller('grupo-activo')
export class GrupoActivoController {
  constructor(private readonly grupoActivoService: GrupoActivoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo grupo de activo' })
  @ApiResponse({ status: 201, description: 'Grupo registrado exitosamente' })
  create(@Body() createDto: CreateGrupoActivoDto) {
    return this.grupoActivoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grupos' })
  findAll() {
    return this.grupoActivoService.findAll();
  }

  @Get('activos')
  @ApiOperation({ summary: 'Obtener solo grupos activos' })
  getGruposActivos() {
    return this.grupoActivoService.getGruposActivos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo por ID' })
  findOne(@Param('id') id: string) {
    return this.grupoActivoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo' })
  update(@Param('id') id: string, @Body() updateDto: UpdateGrupoActivoDto) {
    return this.grupoActivoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un grupo' })
  remove(@Param('id') id: string) {
    return this.grupoActivoService.remove(id);
  }
}
