import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Transacciones de Tesorería')
@Controller('transaccion')
export class TransaccionController {
  constructor(private readonly transaccionService: TransaccionService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar transacción (Res. 101/2011, Res. 111/2023 BCC)' })
  @ApiResponse({ status: 201, description: 'Transacción registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Ya existe una transacción con ese código' })
  create(@Body() createDto: CreateTransaccionDto) { return this.transaccionService.create(createDto); }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las transacciones' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones' })
  findAll() { return this.transaccionService.findAll(); }

  @Get('periodo')
  @ApiOperation({ summary: 'Transacciones por período' })
  @ApiResponse({ status: 200, description: 'Transacciones del período' })
  @ApiQuery({ name: 'desde', required: true }) @ApiQuery({ name: 'hasta', required: true })
  getPorPeriodo(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.transaccionService.getPorPeriodo(desde, hasta);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de ingresos/egresos' })
  @ApiResponse({ status: 200, description: 'Resumen de ingresos y egresos' })
  @ApiQuery({ name: 'desde', required: false }) @ApiQuery({ name: 'hasta', required: false })
  getResumen(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.transaccionService.getResumen(desde, hasta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener transacción por ID' })
  @ApiParam({ name: 'id', description: 'ID de la transacción' })
  @ApiResponse({ status: 200, description: 'Transacción encontrada' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  findOne(@Param('id') id: string) { return this.transaccionService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar transacción' })
  @ApiParam({ name: 'id', description: 'ID de la transacción' })
  @ApiResponse({ status: 200, description: 'Transacción actualizada' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTransaccionDto) {
    return this.transaccionService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar transacción' })
  @ApiParam({ name: 'id', description: 'ID de la transacción' })
  @ApiResponse({ status: 200, description: 'Transacción eliminada' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  remove(@Param('id') id: string) { return this.transaccionService.remove(id); }
}
