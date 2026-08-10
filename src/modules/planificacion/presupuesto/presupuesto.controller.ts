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
import { PresupuestoService } from './presupuesto.service';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { TipoPresupuesto } from './types/presupuesto.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
@ApiTags('Presupuesto')
@Controller('presupuesto')
export class PresupuestoController {
  constructor(private readonly presupuestoService: PresupuestoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear presupuesto' })
  @ApiResponse({ status: 201, description: 'Presupuesto creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un presupuesto con ese código',
  })
  create(@Body() createDto: CreatePresupuestoDto) {
    return this.presupuestoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los presupuestos' })
  @ApiResponse({ status: 200, description: 'Lista de presupuestos' })
  findAll() {
    return this.presupuestoService.findAll();
  }

  @Get('periodo')
  @ApiOperation({ summary: 'Obtener presupuestos por período' })
  @ApiQuery({
    name: 'periodo',
    required: true,
    description: 'Período (ej: "2026")',
  })
  @ApiResponse({ status: 200, description: 'Presupuestos del período' })
  findByPeriodo(@Query('periodo') periodo: string) {
    return this.presupuestoService.findByPeriodo(periodo);
  }

  @Get('centro-costo')
  @ApiOperation({ summary: 'Obtener presupuestos por centro de costo' })
  @ApiQuery({
    name: 'centroCostoId',
    required: true,
    description: 'ID del centro de costo',
  })
  @ApiResponse({ status: 200, description: 'Presupuestos del centro de costo' })
  findByCentroCosto(@Query('centroCostoId') centroCostoId: string) {
    return this.presupuestoService.findByCentroCosto(centroCostoId);
  }

  @Get('tipo')
  @ApiOperation({ summary: 'Obtener presupuestos por tipo' })
  @ApiQuery({
    name: 'tipo',
    required: true,
    enum: TipoPresupuesto,
    description: 'Tipo de presupuesto',
  })
  @ApiResponse({ status: 200, description: 'Presupuestos del tipo' })
  findByTipo(@Query('tipo') tipo: TipoPresupuesto) {
    return this.presupuestoService.findByTipo(tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener presupuesto por ID' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto' })
  @ApiResponse({ status: 200, description: 'Presupuesto encontrado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.presupuestoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto' })
  @ApiResponse({ status: 200, description: 'Presupuesto actualizado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePresupuestoDto) {
    return this.presupuestoService.update(id, updateDto);
  }

  @Post(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto' })
  @ApiResponse({ status: 200, description: 'Presupuesto aprobado' })
  @ApiResponse({ status: 400, description: 'No se puede aprobar' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  aprobar(@Param('id') id: string) {
    return this.presupuestoService.aprobar(id);
  }

  @Post(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto' })
  @ApiResponse({ status: 200, description: 'Presupuesto cerrado' })
  @ApiResponse({ status: 400, description: 'No se puede cerrar' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  cerrar(@Param('id') id: string) {
    return this.presupuestoService.cerrar(id);
  }

  @Post(':id/ejecutar')
  @ApiOperation({ summary: 'Registrar ejecución del presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto' })
  @ApiQuery({ name: 'monto', required: true, description: 'Monto a ejecutar' })
  @ApiQuery({
    name: 'mes',
    required: true,
    description: 'Mes de ejecución (1-12)',
  })
  @ApiResponse({ status: 200, description: 'Ejecución registrada' })
  @ApiResponse({ status: 400, description: 'Error al registrar ejecución' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  registrarEjecucion(
    @Param('id') id: string,
    @Query('monto') monto: string,
    @Query('mes') mes: string,
  ) {
    return this.presupuestoService.registrarEjecucion(
      id,
      Number(monto),
      Number(mes),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto' })
  @ApiResponse({ status: 200, description: 'Presupuesto eliminado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  remove(@Param('id') id: string) {
    return this.presupuestoService.remove(id);
  }
}
