import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CuentaCobrarService } from './cuenta-cobrar.service';
import { CreateCuentaCobrarDto } from './dto/create-cuenta-cobrar.dto';
import { UpdateCuentaCobrarDto } from './dto/update-cuenta-cobrar.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cuentas por Cobrar')
@Controller('cuenta-cobrar')
export class CuentaCobrarController {
  constructor(private readonly cxcService: CuentaCobrarService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar cuenta por cobrar' })
  @ApiResponse({ status: 201, description: 'Cuenta por cobrar registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Ya existe una CxC con ese código' })
  create(@Body() createDto: CreateCuentaCobrarDto) {
    return this.cxcService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas por cobrar' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas por cobrar' })
  findAll() {
    return this.cxcService.findAll();
  }

  @Get('vencidas')
  @ApiOperation({ summary: 'Cuentas vencidas (Inst. 34/2006 BCC)' })
  @ApiResponse({ status: 200, description: 'Cuentas vencidas obtenidas' })
  getVencidas() {
    return this.cxcService.getVencidas();
  }

  @Get('envejecimiento')
  @ApiOperation({ summary: 'Análisis de envejecimiento (aging)' })
  @ApiResponse({ status: 200, description: 'Análisis de envejecimiento' })
  getEnvejecimiento() {
    return this.cxcService.getEnvejecimiento();
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de cuentas por cobrar' })
  @ApiResponse({ status: 200, description: 'Resumen de cuentas por cobrar' })
  getResumen() {
    return this.cxcService.getResumen();
  }

  @Get('envejecimiento/cliente/:clienteId')
  @ApiOperation({ summary: 'Envejecimiento por cliente' })
  @ApiParam({ name: 'clienteId', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Aging del cliente' })
  getEnvejecimientoPorCliente(@Param('clienteId') clienteId: string) {
    return this.cxcService.getEnvejecimientoPorCliente(clienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cuenta por cobrar por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por cobrar' })
  @ApiResponse({ status: 200, description: 'Cuenta por cobrar encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta por cobrar no encontrada' })
  findOne(@Param('id') id: string) {
    return this.cxcService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cuenta por cobrar' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por cobrar' })
  @ApiResponse({ status: 200, description: 'Cuenta por cobrar actualizada' })
  @ApiResponse({ status: 404, description: 'Cuenta por cobrar no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCuentaCobrarDto) {
    return this.cxcService.update(id, updateDto);
  }

  @Post(':id/abonar')
  @ApiOperation({ summary: 'Registrar abono/pago a cuenta por cobrar' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por cobrar' })
  @ApiResponse({ status: 200, description: 'Abono registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al registrar abono' })
  @ApiResponse({ status: 404, description: 'Cuenta por cobrar no encontrada' })
  abonar(@Param('id') id: string, @Body() abono: { monto: number; fechaPago?: string; referencia?: string }) {
    return this.cxcService.abonar(id, abono);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cuenta por cobrar' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por cobrar' })
  @ApiResponse({ status: 200, description: 'Cuenta por cobrar eliminada' })
  @ApiResponse({ status: 404, description: 'Cuenta por cobrar no encontrada' })
  remove(@Param('id') id: string) {
    return this.cxcService.remove(id);
  }
}
