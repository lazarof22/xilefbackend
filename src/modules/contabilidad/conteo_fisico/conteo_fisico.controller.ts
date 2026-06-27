import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConteoFisicoService } from './conteo_fisico.service';
import { CreateConteoFisicoDto } from './dto/create-conteo_fisico.dto';
import { UpdateConteoFisicoDto } from './dto/update-conteo_fisico.dto';
import { CreateConteoDetalleDto } from './dto/create-conteo_detalle.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Conteo Físico de Activos Fijos')
@Controller('conteo-fisico')
export class ConteoFisicoController {
  constructor(private readonly conteoFisicoService: ConteoFisicoService) {}

  @Post()
  @ApiOperation({ summary: 'Programar un nuevo conteo físico' })
  @ApiResponse({ status: 201, description: 'Conteo programado exitosamente' })
  create(@Body() createDto: CreateConteoFisicoDto) {
    return this.conteoFisicoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los conteos programados' })
  findAll() {
    return this.conteoFisicoService.findAll();
  }

  @Get('discrepancias')
  @ApiOperation({ summary: 'Resumen de discrepancias de todos los conteos' })
  getResumenDiscrepancias() {
    return this.conteoFisicoService.getResumenDiscrepancias();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un conteo por ID' })
  findOne(@Param('id') id: string) {
    return this.conteoFisicoService.findOne(id);
  }

  @Get(':id/detalles')
  @ApiOperation({ summary: 'Obtener los detalles de un conteo' })
  getDetalles(@Param('id') id: string) {
    return this.conteoFisicoService.getDetalles(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un conteo' })
  update(@Param('id') id: string, @Body() updateDto: UpdateConteoFisicoDto) {
    return this.conteoFisicoService.update(id, updateDto);
  }

  @Post(':id/iniciar')
  @ApiOperation({ summary: 'Iniciar un conteo programado' })
  iniciarConteo(@Param('id') id: string) {
    return this.conteoFisicoService.iniciarConteo(id);
  }

  @Post(':id/completar')
  @ApiOperation({ summary: 'Completar un conteo y calcular resultados' })
  completarConteo(@Param('id') id: string) {
    return this.conteoFisicoService.completarConteo(id);
  }

  @Post('detalles')
  @ApiOperation({ summary: 'Agregar detalle a un conteo' })
  agregarDetalle(@Body() createDetalleDto: CreateConteoDetalleDto) {
    return this.conteoFisicoService.agregarDetalle(createDetalleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un conteo y sus detalles' })
  remove(@Param('id') id: string) {
    return this.conteoFisicoService.remove(id);
  }
}
