import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RedistribucionRecursosService } from './redistribucion-recursos.service';
import { CreateRedistribucionDto } from './dto/create-redistribucion.dto';
import { UpdateRedistribucionDto } from './dto/update-redistribucion.dto';
import { AprobarRedistribucionDto } from './dto/aprobar-redistribucion.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Redistribución de Recursos')
@Controller('redistribucion-recursos')
export class RedistribucionRecursosController {
  constructor(
    private readonly redistribucionService: RedistribucionRecursosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear redistribución de recursos' })
  @ApiResponse({
    status: 201,
    description: 'Redistribución creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o suma de montos incorrecta',
  })
  create(@Body() createDto: CreateRedistribucionDto) {
    return this.redistribucionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las redistribuciones' })
  @ApiResponse({ status: 200, description: 'Lista de redistribuciones' })
  findAll() {
    return this.redistribucionService.findAll();
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Redistribuciones pendientes o aprobadas' })
  @ApiResponse({
    status: 200,
    description: 'Redistribuciones pendientes obtenidas',
  })
  getPendientes() {
    return this.redistribucionService.getPendientes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener redistribución por ID' })
  @ApiParam({ name: 'id', description: 'ID de la redistribución' })
  @ApiResponse({ status: 200, description: 'Redistribución encontrada' })
  @ApiResponse({ status: 404, description: 'Redistribución no encontrada' })
  findOne(@Param('id') id: string) {
    return this.redistribucionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar redistribución' })
  @ApiParam({ name: 'id', description: 'ID de la redistribución' })
  @ApiResponse({ status: 200, description: 'Redistribución actualizada' })
  @ApiResponse({ status: 404, description: 'Redistribución no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRedistribucionDto) {
    return this.redistribucionService.update(id, updateDto);
  }

  @Post(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar redistribución' })
  @ApiParam({ name: 'id', description: 'ID de la redistribución' })
  @ApiResponse({ status: 200, description: 'Redistribución aprobada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede aprobar en estado actual',
  })
  aprobar(@Param('id') id: string, @Body() dto: AprobarRedistribucionDto) {
    return this.redistribucionService.aprobar(id, dto.aprobadoPor);
  }

  @Post(':id/ejecutar')
  @ApiOperation({
    summary: 'Ejecutar redistribución (aplica cambios de saldo)',
  })
  @ApiParam({ name: 'id', description: 'ID de la redistribución' })
  @ApiResponse({ status: 200, description: 'Redistribución ejecutada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede ejecutar si no está aprobada',
  })
  ejecutar(@Param('id') id: string) {
    return this.redistribucionService.ejecutar(id);
  }

  @Post(':id/anular')
  @ApiOperation({
    summary: 'Anular redistribución (revierte cambios de saldo)',
  })
  @ApiParam({ name: 'id', description: 'ID de la redistribución' })
  @ApiResponse({ status: 200, description: 'Redistribución anulada' })
  @ApiResponse({
    status: 400,
    description: 'Solo se puede anular una ejecutada',
  })
  anular(@Param('id') id: string) {
    return this.redistribucionService.anular(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar redistribución (solo si no está ejecutada)',
  })
  @ApiParam({ name: 'id', description: 'ID de la redistribución' })
  @ApiResponse({ status: 200, description: 'Redistribución eliminada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar una ejecutada',
  })
  remove(@Param('id') id: string) {
    return this.redistribucionService.remove(id);
  }
}
