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
  ApiBody,
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
    required: true,
    description: 'Fecha límite para la proyección (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Proyección de pagos' })
  getProyeccion(@Query('hasta') hasta: string) {
    return this.planificacionPagosService.getProyeccion(hasta);
  }

  @Get('periodo')
  @ApiOperation({ summary: 'Obtener planes de pago por periodo' })
  @ApiQuery({
    name: 'desde',
    required: true,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    required: true,
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nuevaFecha: {
          type: 'string',
          format: 'date',
          description: 'Nueva fecha programada (YYYY-MM-DD)',
        },
      },
      required: ['nuevaFecha'],
    },
  })
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

  @Get('consulta/vencidos')
  @ApiOperation({ summary: 'Obtener planes de pago vencidos' })
  @ApiResponse({ status: 200, description: 'Planes de pago vencidos' })
  findVencidos() {
    return this.planificacionPagosService.findVencidos();
  }

  @Get('consulta/proveedor')
  @ApiOperation({ summary: 'Obtener planes de pago por proveedor' })
  @ApiQuery({
    name: 'proveedorId',
    required: true,
    description: 'ID del proveedor',
  })
  @ApiResponse({ status: 200, description: 'Planes de pago del proveedor' })
  findByProveedor(@Query('proveedorId') proveedorId: string) {
    return this.planificacionPagosService.findByProveedor(proveedorId);
  }

  @Get('consulta/pendientes-nuevo')
  @ApiOperation({
    summary: 'Obtener planes de pago pendientes con populate completo',
  })
  @ApiResponse({ status: 200, description: 'Planes de pago pendientes' })
  findPendientes() {
    return this.planificacionPagosService.findPendientes();
  }

  @Post(':id/priorizar')
  @ApiOperation({ summary: 'Cambiar prioridad de plan de pago' })
  @ApiParam({ name: 'id', description: 'ID del plan de pago' })
  @ApiQuery({
    name: 'prioridad',
    required: true,
    description: 'Nueva prioridad',
  })
  @ApiResponse({ status: 200, description: 'Prioridad actualizada' })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  priorizar(@Param('id') id: string, @Query('prioridad') prioridad: string) {
    return this.planificacionPagosService.priorizar(id, Number(prioridad));
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
