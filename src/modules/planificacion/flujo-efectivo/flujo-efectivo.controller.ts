import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FlujoEfectivoService } from './flujo-efectivo.service';
import { CreateProyeccionDto } from './dto/create-proyeccion.dto';
import { UpdateProyeccionDto } from './dto/update-proyeccion.dto';
import { CerrarProyeccionDto } from './dto/cerrar-proyeccion.dto';
import { GenerarProyeccionDto } from './dto/generar-proyeccion.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Flujo de Efectivo')
@Controller('flujo-efectivo')
export class FlujoEfectivoController {
  constructor(private readonly flujoEfectivoService: FlujoEfectivoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear proyección de flujo de efectivo' })
  @ApiResponse({ status: 201, description: 'Proyección creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe una proyección con ese código',
  })
  create(@Body() createDto: CreateProyeccionDto) {
    return this.flujoEfectivoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las proyecciones de flujo' })
  @ApiResponse({ status: 200, description: 'Lista de proyecciones' })
  findAll() {
    return this.flujoEfectivoService.findAll();
  }

  @Get('historico')
  @ApiOperation({
    summary: 'Obtener histórico de proyecciones por rango de fechas',
  })
  @ApiQuery({
    name: 'desde',
    required: false,
    description: 'Fecha inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    required: false,
    description: 'Fecha final (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Histórico de proyecciones' })
  getHistorico(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.flujoEfectivoService.getHistorico(desde || '', hasta || '');
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen general de flujo de efectivo' })
  @ApiResponse({ status: 200, description: 'Resumen de flujo de efectivo' })
  getResumen() {
    return this.flujoEfectivoService.getResumen();
  }

  @Get('periodo')
  @ApiOperation({ summary: 'Obtener proyecciones por período' })
  @ApiQuery({
    name: 'periodo',
    required: true,
    description: 'Período (ej: "2026-01")',
  })
  @ApiResponse({ status: 200, description: 'Proyecciones del período' })
  findByPeriodo(@Query('periodo') periodo: string) {
    return this.flujoEfectivoService.findByPeriodo(periodo);
  }

  @Get('proyectar-diario')
  @ApiOperation({ summary: 'Proyectar flujo diario con saldo acumulado' })
  @ApiQuery({ name: 'periodo', required: true, description: 'Período' })
  @ApiResponse({
    status: 200,
    description: 'Proyección diaria con saldo acumulado',
  })
  proyectarFlujoDiario(@Query('periodo') periodo: string) {
    return this.flujoEfectivoService.proyectarFlujoDiario(periodo);
  }

  @Get('alerta')
  @ApiOperation({
    summary: 'Generar alerta si saldo proyectado cae debajo del umbral',
  })
  @ApiQuery({ name: 'periodo', required: true, description: 'Período' })
  @ApiQuery({
    name: 'umbralMinimo',
    required: true,
    description: 'Umbral mínimo de saldo',
  })
  @ApiResponse({ status: 200, description: 'Alerta de flujo' })
  generarAlerta(
    @Query('periodo') periodo: string,
    @Query('umbralMinimo') umbralMinimo: string,
  ) {
    return this.flujoEfectivoService.generarAlerta(
      periodo,
      Number(umbralMinimo),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proyección por ID' })
  @ApiParam({ name: 'id', description: 'ID de la proyección' })
  @ApiResponse({ status: 200, description: 'Proyección encontrada' })
  @ApiResponse({ status: 404, description: 'Proyección no encontrada' })
  findOne(@Param('id') id: string) {
    return this.flujoEfectivoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proyección de flujo' })
  @ApiParam({ name: 'id', description: 'ID de la proyección' })
  @ApiResponse({ status: 200, description: 'Proyección actualizada' })
  @ApiResponse({ status: 404, description: 'Proyección no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProyeccionDto) {
    return this.flujoEfectivoService.update(id, updateDto);
  }

  @Post('generar')
  @ApiOperation({
    summary: 'Generar proyecciones automáticas para un rango de fechas',
  })
  @ApiResponse({
    status: 201,
    description: 'Proyecciones generadas exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada' })
  generar(@Body() dto: GenerarProyeccionDto) {
    return this.flujoEfectivoService.generar(dto);
  }

  @Post(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar proyección con valores reales' })
  @ApiParam({ name: 'id', description: 'ID de la proyección' })
  @ApiResponse({ status: 200, description: 'Proyección cerrada exitosamente' })
  @ApiResponse({ status: 400, description: 'La proyección ya está cerrada' })
  @ApiResponse({ status: 404, description: 'Proyección no encontrada' })
  cerrar(@Param('id') id: string, @Body() cerrarDto: CerrarProyeccionDto) {
    return this.flujoEfectivoService.cerrar(id, cerrarDto);
  }

  @Get(':id/comparar')
  @ApiOperation({ summary: 'Comparar valores proyectados vs reales' })
  @ApiParam({ name: 'id', description: 'ID de la proyección' })
  @ApiResponse({ status: 200, description: 'Comparativa proyectado vs real' })
  @ApiResponse({ status: 404, description: 'Proyección no encontrada' })
  comparar(@Param('id') id: string) {
    return this.flujoEfectivoService.comparar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proyección de flujo' })
  @ApiParam({ name: 'id', description: 'ID de la proyección' })
  @ApiResponse({ status: 200, description: 'Proyección eliminada' })
  @ApiResponse({ status: 404, description: 'Proyección no encontrada' })
  remove(@Param('id') id: string) {
    return this.flujoEfectivoService.remove(id);
  }
}
