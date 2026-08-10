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
import { PlanificacionComprasService } from './planificacion-compras.service';
import { CreatePlanCompraDto } from './dto/create-plan-compra.dto';
import { UpdatePlanCompraDto } from './dto/update-plan-compra.dto';
import { EstadoPlanCompra } from './types/plan-compra.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
@ApiTags('Planificación de Compras')
@Controller('planificacion-compras')
export class PlanificacionComprasController {
  constructor(
    private readonly planificacionComprasService: PlanificacionComprasService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear plan de compra' })
  @ApiResponse({
    status: 201,
    description: 'Plan de compra creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Ya existe un plan con ese código' })
  create(@Body() createDto: CreatePlanCompraDto) {
    return this.planificacionComprasService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los planes de compra' })
  @ApiResponse({ status: 200, description: 'Lista de planes de compra' })
  findAll() {
    return this.planificacionComprasService.findAll();
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Obtener planes de compra pendientes' })
  @ApiResponse({ status: 200, description: 'Planes de compra pendientes' })
  findPendientes() {
    return this.planificacionComprasService.findPendientes();
  }

  @Get('producto')
  @ApiOperation({ summary: 'Obtener planes de compra por producto' })
  @ApiQuery({
    name: 'productoId',
    required: true,
    description: 'ID del producto',
  })
  @ApiResponse({ status: 200, description: 'Planes de compra del producto' })
  findByProducto(@Query('productoId') productoId: string) {
    return this.planificacionComprasService.findByProducto(productoId);
  }

  @Get('proveedor')
  @ApiOperation({ summary: 'Obtener planes de compra por proveedor' })
  @ApiQuery({
    name: 'proveedorId',
    required: true,
    description: 'ID del proveedor',
  })
  @ApiResponse({ status: 200, description: 'Planes de compra del proveedor' })
  findByProveedor(@Query('proveedorId') proveedorId: string) {
    return this.planificacionComprasService.findByProveedor(proveedorId);
  }

  @Get('estado')
  @ApiOperation({ summary: 'Obtener planes de compra por estado' })
  @ApiQuery({
    name: 'estado',
    required: true,
    enum: EstadoPlanCompra,
    description: 'Estado del plan',
  })
  @ApiResponse({ status: 200, description: 'Planes de compra del estado' })
  findByEstado(@Query('estado') estado: EstadoPlanCompra) {
    return this.planificacionComprasService.findByEstado(estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plan de compra por ID' })
  @ApiParam({ name: 'id', description: 'ID del plan de compra' })
  @ApiResponse({ status: 200, description: 'Plan de compra encontrado' })
  @ApiResponse({ status: 404, description: 'Plan de compra no encontrado' })
  findOne(@Param('id') id: string) {
    return this.planificacionComprasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar plan de compra' })
  @ApiParam({ name: 'id', description: 'ID del plan de compra' })
  @ApiResponse({ status: 200, description: 'Plan de compra actualizado' })
  @ApiResponse({ status: 404, description: 'Plan de compra no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePlanCompraDto) {
    return this.planificacionComprasService.update(id, updateDto);
  }

  @Post(':id/comprar')
  @ApiOperation({ summary: 'Registrar compra ejecutada' })
  @ApiParam({ name: 'id', description: 'ID del plan de compra' })
  @ApiQuery({
    name: 'cantidad',
    required: true,
    description: 'Cantidad comprada',
  })
  @ApiResponse({ status: 200, description: 'Compra registrada' })
  @ApiResponse({ status: 400, description: 'Error al registrar compra' })
  @ApiResponse({ status: 404, description: 'Plan de compra no encontrado' })
  registrarCompra(
    @Param('id') id: string,
    @Query('cantidad') cantidad: string,
  ) {
    return this.planificacionComprasService.registrarCompra(
      id,
      Number(cantidad),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar plan de compra' })
  @ApiParam({ name: 'id', description: 'ID del plan de compra' })
  @ApiResponse({ status: 200, description: 'Plan de compra eliminado' })
  @ApiResponse({ status: 404, description: 'Plan de compra no encontrado' })
  remove(@Param('id') id: string) {
    return this.planificacionComprasService.remove(id);
  }
}
