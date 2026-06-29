import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CambioDivisaService } from './cambio-divisa.service';
import { CreateCambioDivisaDto } from './dto/create-cambio-divisa.dto';
import { UpdateCambioDivisaDto } from './dto/update-cambio-divisa.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cambio de Divisa')
@Controller('cambio-divisa')
export class CambioDivisaController {
  constructor(private readonly cambioDivisaService: CambioDivisaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar operación de cambio de divisa' })
  @ApiResponse({
    status: 201,
    description: 'Operación de cambio registrada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada' })
  create(@Body() createDto: CreateCambioDivisaDto) {
    return this.cambioDivisaService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las operaciones de cambio' })
  @ApiResponse({ status: 200, description: 'Lista de operaciones de cambio' })
  findAll() {
    return this.cambioDivisaService.findAll();
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de operaciones de cambio' })
  @ApiResponse({ status: 200, description: 'Resumen de operaciones de cambio' })
  getResumen() {
    return this.cambioDivisaService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener operación de cambio por ID' })
  @ApiParam({ name: 'id', description: 'ID de la operación de cambio' })
  @ApiResponse({ status: 200, description: 'Operación de cambio encontrada' })
  @ApiResponse({
    status: 404,
    description: 'Operación de cambio no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.cambioDivisaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar operación de cambio' })
  @ApiParam({ name: 'id', description: 'ID de la operación de cambio' })
  @ApiResponse({ status: 200, description: 'Operación de cambio actualizada' })
  @ApiResponse({
    status: 404,
    description: 'Operación de cambio no encontrada',
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateCambioDivisaDto) {
    return this.cambioDivisaService.update(id, updateDto);
  }

  @Post(':id/anular')
  @ApiOperation({ summary: 'Anular operación de cambio (revierte saldos)' })
  @ApiParam({ name: 'id', description: 'ID de la operación de cambio' })
  @ApiResponse({ status: 200, description: 'Operación de cambio anulada' })
  @ApiResponse({ status: 400, description: 'La operación ya está anulada' })
  @ApiResponse({
    status: 404,
    description: 'Operación de cambio no encontrada',
  })
  anular(@Param('id') id: string) {
    return this.cambioDivisaService.anular(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar operación de cambio' })
  @ApiParam({ name: 'id', description: 'ID de la operación de cambio' })
  @ApiResponse({ status: 200, description: 'Operación de cambio eliminada' })
  @ApiResponse({
    status: 404,
    description: 'Operación de cambio no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.cambioDivisaService.remove(id);
  }
}
