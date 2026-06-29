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
import { PlanificacionPagosService } from './planificacion-pagos.service';
import { CreatePlanPagoDto } from './dto/create-plan-pago.dto';
import { UpdatePlanPagoDto } from './dto/update-plan-pago.dto';
import { EjecutarPlanPagoDto } from './dto/ejecutar-plan-pago.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Planificación de Pagos')
@Controller('planificacion-pagos')
export class PlanificacionPagosController {
  constructor(
    private readonly planificacionPagosService: PlanificacionPagosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear plan de pago' })
  @ApiResponse({ status: 201, description: 'Plan de pago creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un plan de pago con ese código',
  })
  create(@Body() createDto: CreatePlanPagoDto) {
    return this.planificacionPagosService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los planes de pago' })
  @ApiResponse({ status: 200, description: 'Lista de planes de pago' })
  findAll() {
    return this.planificacionPagosService.findAll();
  }

  @Get('pendientes')
  @ApiOperation({
    summary: 'Obtener planes de pago pendientes (PROGRAMADO o CONFIRMADO)',
  })
  @ApiResponse({ status: 200, description: 'Planes de pago pendientes' })
  getPendientes() {
    return this.planificacionPagosService.getPendientes();
  }

  @Get('proyeccion')
  @ApiOperation({ summary: 'Obtener proyección de pagos por semana' })
  @ApiQuery({
    name: 'hasta',
    description: 'Fecha límite para la proyección (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Proyección de pagos' })
  getProyeccion(@Query('hasta') hasta: string) {
    return this.planificacionPagosService.getProyeccion(hasta);
  }

  @Get('periodo')
  @ApiOperation({ summary: 'Obtener planes de pago por periodo' })
  @ApiQuery({ name: 'desde', description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'hasta', description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Planes de pago del periodo' })
  getPorPeriodo(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.planificacionPagosService.getPorPeriodo(desde, hasta);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Obtener resumen de planes de pago' })
  @ApiResponse({ status: 200, description: 'Resumen de planes de pago' })
  getResumen() {
    return this.planificacionPagosService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plan de pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiResponse({ status: 200, description: 'Plan de pago encontrado' })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  findOne(@Param('id') id: string) {
    return this.planificacionPagosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar plan de pago' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiResponse({ status: 200, description: 'Plan de pago actualizado' })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePlanPagoDto) {
    return this.planificacionPagosService.update(id, updateDto);
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar plan de pago' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiResponse({ status: 200, description: 'Plan de pago confirmado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede confirmar el plan de pago',
  })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  confirmar(@Param('id') id: string) {
    return this.planificacionPagosService.confirmar(id);
  }

  @Post(':id/ejecutar')
  @ApiOperation({ summary: 'Ejecutar plan de pago' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiResponse({ status: 200, description: 'Plan de pago ejecutado' })
  @ApiResponse({
    status: 400,
    description: 'Error al ejecutar el plan de pago',
  })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  ejecutar(@Param('id') id: string, @Body() ejecutarDto: EjecutarPlanPagoDto) {
    return this.planificacionPagosService.ejecutar(id, ejecutarDto);
  }

  @Post(':id/reprogramar')
  @ApiOperation({ summary: 'Reprogramar plan de pago' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiResponse({ status: 200, description: 'Plan de pago reprogramado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede reprogramar el plan de pago',
  })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  reprogramar(@Param('id') id: string, @Body('nuevaFecha') nuevaFecha: string) {
    return this.planificacionPagosService.reprogramar(id, nuevaFecha);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar plan de pago' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiResponse({ status: 200, description: 'Plan de pago cancelado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar el plan de pago',
  })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  cancelar(@Param('id') id: string) {
    return this.planificacionPagosService.cancelar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar plan de pago' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiResponse({ status: 200, description: 'Plan de pago eliminado' })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  remove(@Param('id') id: string) {
    return this.planificacionPagosService.remove(id);
  }
}
