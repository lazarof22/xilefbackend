import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ConciliacionService } from './conciliacion.service';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';
import { UpdateConciliacionDto } from './dto/update-conciliacion.dto';
import { ImportarExtractoDto } from './dto/importar-extracto.dto';
import { ConciliarMovimientoDto } from './dto/conciliar-movimiento.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Conciliación Bancaria')
@Controller('conciliacion')
export class ConciliacionController {
  constructor(private readonly conciliacionService: ConciliacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear conciliación bancaria (Res. 40/2016 BCC)' })
  @ApiResponse({ status: 201, description: 'Conciliación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createDto: CreateConciliacionDto) {
    return this.conciliacionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las conciliaciones' })
  @ApiResponse({ status: 200, description: 'Lista de conciliaciones' })
  findAll() {
    return this.conciliacionService.findAll();
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Conciliaciones pendientes' })
  @ApiResponse({
    status: 200,
    description: 'Conciliaciones pendientes obtenidas',
  })
  getPendientes() {
    return this.conciliacionService.getPendientes();
  }

  @Post(':id/extractos/importar')
  @ApiOperation({ summary: 'Importar extracto bancario (partidas)' })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 201, description: 'Extracto importado exitosamente' })
  importarExtracto(@Param('id') id: string, @Body() dto: ImportarExtractoDto) {
    return this.conciliacionService.importarExtracto(id, dto.partidas);
  }

  @Get(':id/extractos/pendientes')
  @ApiOperation({ summary: 'Obtener extractos pendientes de conciliación' })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 200, description: 'Extractos pendientes obtenidos' })
  getExtractosPendientes(@Param('id') id: string) {
    return this.conciliacionService.getExtractosPendientes(id);
  }

  @Post('extractos/:extractoId/conciliar')
  @ApiOperation({
    summary: 'Conciliar un movimiento de extracto con una transacción',
  })
  @ApiParam({ name: 'extractoId', description: 'ID del extracto' })
  @ApiResponse({ status: 200, description: 'Movimiento conciliado' })
  conciliarMovimiento(
    @Param('extractoId') extractoId: string,
    @Body() dto: ConciliarMovimientoDto,
  ) {
    return this.conciliacionService.conciliarMovimiento(
      extractoId,
      dto.transaccionId,
    );
  }

  @Post(':id/auto-conciliar')
  @ApiOperation({
    summary: 'Auto-conciliar extractos (fuzzy match por monto+fecha±3d)',
  })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 200, description: 'Auto-conciliación completada' })
  autoConciliar(@Param('id') id: string) {
    return this.conciliacionService.autoConciliar(id);
  }

  @Get(':id/resumen')
  @ApiOperation({ summary: 'Obtener resumen de la conciliación (totales)' })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 200, description: 'Resumen obtenido' })
  getResumenConciliacion(@Param('id') id: string) {
    return this.conciliacionService.getResumenConciliacion(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener conciliación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 200, description: 'Conciliación encontrada' })
  @ApiResponse({ status: 404, description: 'Conciliación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.conciliacionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar conciliación' })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 200, description: 'Conciliación actualizada' })
  @ApiResponse({ status: 404, description: 'Conciliación no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateConciliacionDto) {
    return this.conciliacionService.update(id, updateDto);
  }

  @Post(':id/procesar')
  @ApiOperation({ summary: 'Procesar conciliación (calcula diferencias)' })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 200, description: 'Conciliación procesada' })
  @ApiResponse({ status: 404, description: 'Conciliación no encontrada' })
  procesar(@Param('id') id: string) {
    return this.conciliacionService.procesar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar conciliación' })
  @ApiParam({ name: 'id', description: 'ID de la conciliación' })
  @ApiResponse({ status: 200, description: 'Conciliación eliminada' })
  @ApiResponse({ status: 404, description: 'Conciliación no encontrada' })
  remove(@Param('id') id: string) {
    return this.conciliacionService.remove(id);
  }
}
