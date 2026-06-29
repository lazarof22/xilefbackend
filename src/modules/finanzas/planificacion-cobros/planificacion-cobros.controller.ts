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
import { PlanificacionCobrosService } from './planificacion-cobros.service';
import { CreatePlanCobroDto } from './dto/create-plan-cobro.dto';
import { UpdatePlanCobroDto } from './dto/update-plan-cobro.dto';
import { CobrarPlanCobroDto } from './dto/cobrar-plan-cobro.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Planificación de Cobros')
@Controller('planificacion-cobros')
export class PlanificacionCobrosController {
  constructor(
    private readonly planificacionService: PlanificacionCobrosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear plan de cobro' })
  @ApiResponse({
    status: 201,
    description: 'Plan de cobro creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Ya existe un plan con ese código' })
  create(@Body() createDto: CreatePlanCobroDto) {
    return this.planificacionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los planes de cobro' })
  @ApiResponse({ status: 200, description: 'Lista de planes de cobro' })
  findAll() {
    return this.planificacionService.findAll();
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Obtener planes de cobro pendientes' })
  @ApiResponse({ status: 200, description: 'Planes de cobro pendientes' })
  getPendientes() {
    return this.planificacionService.getPendientes();
  }

  @Get('proyeccion-ingresos')
  @ApiOperation({ summary: 'Proyección de ingresos por período' })
  @ApiQuery({
    name: 'hasta',
    required: true,
    description: 'Fecha límite de la proyección (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Proyección de ingresos' })
  getProyeccionIngresos(@Query('hasta') hasta: string) {
    return this.planificacionService.getProyeccionIngresos(hasta);
  }

  @Get('periodo')
  @ApiOperation({ summary: 'Planes de cobro por período' })
  @ApiQuery({
    name: 'desde',
    required: true,
    description: 'Fecha inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    required: true,
    description: 'Fecha final (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Planes del período' })
  getPorPeriodo(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.planificacionService.getPorPeriodo(desde, hasta);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de planes de cobro' })
  @ApiResponse({ status: 200, description: 'Resumen de planes de cobro' })
  getResumen() {
    return this.planificacionService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plan de cobro por ID' })
  @ApiParam({ name: 'id', description: 'ID del plan de cobro' })
  @ApiResponse({ status: 200, description: 'Plan de cobro encontrado' })
  @ApiResponse({ status: 404, description: 'Plan de cobro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.planificacionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar plan de cobro' })
  @ApiParam({ name: 'id', description: 'ID del plan de cobro' })
  @ApiResponse({ status: 200, description: 'Plan de cobro actualizado' })
  @ApiResponse({ status: 404, description: 'Plan de cobro no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePlanCobroDto) {
    return this.planificacionService.update(id, updateDto);
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar plan de cobro' })
  @ApiParam({ name: 'id', description: 'ID del plan de cobro' })
  @ApiResponse({ status: 200, description: 'Plan de cobro confirmado' })
  @ApiResponse({ status: 400, description: 'No se puede confirmar el plan' })
  @ApiResponse({ status: 404, description: 'Plan de cobro no encontrado' })
  confirmar(@Param('id') id: string) {
    return this.planificacionService.confirmar(id);
  }

  @Post(':id/cobrar')
  @ApiOperation({ summary: 'Registrar cobro de un plan' })
  @ApiParam({ name: 'id', description: 'ID del plan de cobro' })
  @ApiResponse({ status: 200, description: 'Cobro registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al registrar cobro' })
  @ApiResponse({ status: 404, description: 'Plan de cobro no encontrado' })
  cobrar(@Param('id') id: string, @Body() cobroDto: CobrarPlanCobroDto) {
    return this.planificacionService.cobrar(id, cobroDto);
  }

  @Post(':id/reprogramar')
  @ApiOperation({ summary: 'Reprogramar plan de cobro' })
  @ApiParam({ name: 'id', description: 'ID del plan de cobro' })
  @ApiQuery({ name: 'fecha', description: 'Nueva fecha programada' })
  @ApiResponse({ status: 200, description: 'Plan de cobro reprogramado' })
  @ApiResponse({ status: 400, description: 'No se puede reprogramar' })
  @ApiResponse({ status: 404, description: 'Plan de cobro no encontrado' })
  reprogramar(@Param('id') id: string, @Query('fecha') fecha: string) {
    return this.planificacionService.reprogramar(id, fecha);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar plan de cobro' })
  @ApiParam({ name: 'id', description: 'ID del plan de cobro' })
  @ApiResponse({ status: 200, description: 'Plan de cobro cancelado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar un plan cobrado',
  })
  @ApiResponse({ status: 404, description: 'Plan de cobro no encontrado' })
  cancelar(@Param('id') id: string) {
    return this.planificacionService.cancelar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar plan de cobro' })
  @ApiParam({ name: 'id', description: 'ID del plan de cobro' })
  @ApiResponse({ status: 200, description: 'Plan de cobro eliminado' })
  @ApiResponse({ status: 404, description: 'Plan de cobro no encontrado' })
  remove(@Param('id') id: string) {
    return this.planificacionService.remove(id);
  }
}
