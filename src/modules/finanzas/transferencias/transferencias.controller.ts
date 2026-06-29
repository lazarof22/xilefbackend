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
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { UpdateTransferenciaDto } from './dto/update-transferencia.dto';
import { AplicarTransferenciaDto } from './dto/aplicar-transferencia.dto';
import { RechazarTransferenciaDto } from './dto/rechazar-transferencia.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Transferencias')
@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly transferenciasService: TransferenciasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una transferencia' })
  @ApiResponse({
    status: 201,
    description: 'Transferencia creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o saldo insuficiente',
  })
  create(@Body() createDto: CreateTransferenciaDto) {
    return this.transferenciasService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las transferencias' })
  @ApiResponse({ status: 200, description: 'Lista de transferencias' })
  findAll() {
    return this.transferenciasService.findAll();
  }

  @Get('aplicadas')
  @ApiOperation({ summary: 'Obtener transferencias aplicadas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de transferencias aplicadas',
  })
  getAplicadas() {
    return this.transferenciasService.getAplicadas();
  }

  @Get('periodo')
  @ApiOperation({ summary: 'Transferencias por período' })
  @ApiResponse({ status: 200, description: 'Transferencias del período' })
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
  getPorPeriodo(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.transferenciasService.getPorPeriodo(desde, hasta);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de transferencias' })
  @ApiResponse({ status: 200, description: 'Resumen de transferencias' })
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
  getResumen(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.transferenciasService.getResumen(desde, hasta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener transferencia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({ status: 200, description: 'Transferencia encontrada' })
  @ApiResponse({ status: 404, description: 'Transferencia no encontrada' })
  findOne(@Param('id') id: string) {
    return this.transferenciasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar transferencia' })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({ status: 200, description: 'Transferencia actualizada' })
  @ApiResponse({ status: 404, description: 'Transferencia no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTransferenciaDto) {
    return this.transferenciasService.update(id, updateDto);
  }

  @Post(':id/aplicar')
  @ApiOperation({ summary: 'Aplicar transferencia (PENDIENTE → APLICADA)' })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({
    status: 200,
    description: 'Transferencia aplicada, saldos actualizados',
  })
  @ApiResponse({
    status: 400,
    description: 'Estado inválido o saldo insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Transferencia no encontrada' })
  aplicar(@Param('id') id: string, @Body() dto: AplicarTransferenciaDto) {
    return this.transferenciasService.aplicar(id, dto);
  }

  @Post(':id/rechazar')
  @ApiOperation({ summary: 'Rechazar transferencia (PENDIENTE → RECHAZADA)' })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiBody({
    schema: { type: 'object', properties: { motivo: { type: 'string' } } },
  })
  @ApiResponse({ status: 200, description: 'Transferencia rechazada' })
  @ApiResponse({ status: 400, description: 'Estado inválido' })
  @ApiResponse({ status: 404, description: 'Transferencia no encontrada' })
  rechazar(@Param('id') id: string, @Body() dto: RechazarTransferenciaDto) {
    return this.transferenciasService.rechazar(id, dto.motivo);
  }

  @Post(':id/anular')
  @ApiOperation({
    summary: 'Anular transferencia (revierte saldos si estaba APLICADA)',
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({ status: 200, description: 'Transferencia anulada' })
  @ApiResponse({ status: 400, description: 'Estado inválido' })
  @ApiResponse({ status: 404, description: 'Transferencia no encontrada' })
  anular(@Param('id') id: string) {
    return this.transferenciasService.anular(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar transferencia (solo si no está aplicada)',
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({ status: 200, description: 'Transferencia eliminada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar una transferencia aplicada',
  })
  @ApiResponse({ status: 404, description: 'Transferencia no encontrada' })
  remove(@Param('id') id: string) {
    return this.transferenciasService.remove(id);
  }
}
