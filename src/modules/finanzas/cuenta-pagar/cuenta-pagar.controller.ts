import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CuentaPagarService } from './cuenta-pagar.service';
import { CreateCuentaPagarDto } from './dto/create-cuenta-pagar.dto';
import { UpdateCuentaPagarDto } from './dto/update-cuenta-pagar.dto';
import { AbonarCuentaPagarDto } from './dto/abonar-cuenta-pagar.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cuentas por Pagar')
@Controller('cuenta-pagar')
export class CuentaPagarController {
  constructor(private readonly cxpService: CuentaPagarService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar cuenta por pagar' })
  @ApiResponse({
    status: 201,
    description: 'Cuenta por pagar registrada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Ya existe una CxP con ese código' })
  create(@Body() createDto: CreateCuentaPagarDto) {
    return this.cxpService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas por pagar' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas por pagar' })
  findAll() {
    return this.cxpService.findAll();
  }

  @Get('vencidas')
  @ApiOperation({ summary: 'Cuentas por pagar vencidas' })
  @ApiResponse({
    status: 200,
    description: 'Cuentas por pagar vencidas obtenidas',
  })
  getVencidas() {
    return this.cxpService.getVencidas();
  }

  @Get('envejecimiento')
  @ApiOperation({ summary: 'Análisis de envejecimiento' })
  @ApiResponse({ status: 200, description: 'Análisis de envejecimiento' })
  getEnvejecimiento() {
    return this.cxpService.getEnvejecimiento();
  }

  @Get('envejecimiento/proveedor/:proveedorId')
  @ApiOperation({ summary: 'Análisis de envejecimiento por proveedor' })
  @ApiParam({ name: 'proveedorId', description: 'ID del proveedor (Empresa)' })
  @ApiResponse({
    status: 200,
    description: 'Análisis de envejecimiento por proveedor',
  })
  getEnvejecimientoPorProveedor(@Param('proveedorId') proveedorId: string) {
    return this.cxpService.getEnvejecimientoPorProveedor(proveedorId);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de cuentas por pagar' })
  @ApiResponse({ status: 200, description: 'Resumen de cuentas por pagar' })
  getResumen() {
    return this.cxpService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cuenta por pagar por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por pagar' })
  @ApiResponse({ status: 200, description: 'Cuenta por pagar encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta por pagar no encontrada' })
  findOne(@Param('id') id: string) {
    return this.cxpService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cuenta por pagar' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por pagar' })
  @ApiResponse({ status: 200, description: 'Cuenta por pagar actualizada' })
  @ApiResponse({ status: 404, description: 'Cuenta por pagar no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCuentaPagarDto) {
    return this.cxpService.update(id, updateDto);
  }

  @Post(':id/abonar')
  @ApiOperation({ summary: 'Registrar pago a cuenta por pagar' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por pagar' })
  @ApiResponse({ status: 200, description: 'Pago registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al registrar pago' })
  @ApiResponse({ status: 404, description: 'Cuenta por pagar no encontrada' })
  abonar(@Param('id') id: string, @Body() abono: AbonarCuentaPagarDto) {
    return this.cxpService.abonar(id, abono);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cuenta por pagar' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por pagar' })
  @ApiResponse({ status: 200, description: 'Cuenta por pagar eliminada' })
  @ApiResponse({ status: 404, description: 'Cuenta por pagar no encontrada' })
  remove(@Param('id') id: string) {
    return this.cxpService.remove(id);
  }
}
