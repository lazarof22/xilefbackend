import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Transacciones de Tesorería')
@Controller('transaccion')
export class TransaccionController {
  constructor(private readonly transaccionService: TransaccionService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar transacción (Res. 101/2011, Res. 111/2023 BCC)' })
  create(@Body() createDto: CreateTransaccionDto) { return this.transaccionService.create(createDto); }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las transacciones' })
  findAll() { return this.transaccionService.findAll(); }

  @Get('periodo')
  @ApiOperation({ summary: 'Transacciones por período' })
  @ApiQuery({ name: 'desde', required: true }) @ApiQuery({ name: 'hasta', required: true })
  getPorPeriodo(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.transaccionService.getPorPeriodo(desde, hasta);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de ingresos/egresos' })
  @ApiQuery({ name: 'desde', required: false }) @ApiQuery({ name: 'hasta', required: false })
  getResumen(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.transaccionService.getResumen(desde, hasta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener transacción por ID' })
  findOne(@Param('id') id: string) { return this.transaccionService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar transacción' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTransaccionDto) {
    return this.transaccionService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar transacción' })
  remove(@Param('id') id: string) { return this.transaccionService.remove(id); }
}
