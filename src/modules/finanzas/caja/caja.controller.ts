import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';
import { CreateArqueoCajaDto } from './dto/create-arqueo-caja.dto';
import { CreateCuentaCajaDto } from './dto/create-cuenta-caja.dto';
import { UpdateCuentaCajaDto } from './dto/update-cuenta-caja.dto';
import { ReponerFondoFijoDto } from './dto/reponer-fondo-fijo.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Caja - Efectivo')
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  // ─── Cuentas de Caja ─────────────────────────────────────────

  @Post('cuenta')
  @ApiOperation({ summary: 'Crear cuenta de caja (soporta múltiples cuentas)' })
  @ApiResponse({ status: 201, description: 'Cuenta de caja creada' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o código duplicado',
  })
  createCuentaCaja(@Body() dto: CreateCuentaCajaDto) {
    return this.cajaService.createCuentaCaja(dto);
  }

  @Get('cuentas')
  @ApiOperation({ summary: 'Obtener todas las cuentas de caja' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas de caja' })
  findAllCuentasCaja() {
    return this.cajaService.findAllCuentasCaja();
  }

  @Get('cuentas/saldos')
  @ApiOperation({ summary: 'Obtener saldos de cuentas de caja activas' })
  @ApiResponse({ status: 200, description: 'Saldos de cuentas activas' })
  getSaldosCajas() {
    return this.cajaService.getSaldosCajas();
  }

  @Get('cuentas/:id')
  @ApiOperation({ summary: 'Obtener cuenta de caja por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta de caja' })
  @ApiResponse({ status: 200, description: 'Cuenta de caja encontrada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  findOneCuentaCaja(@Param('id') id: string) {
    return this.cajaService.findOneCuentaCaja(id);
  }

  @Patch('cuentas/:id')
  @ApiOperation({ summary: 'Actualizar cuenta de caja' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta de caja' })
  @ApiResponse({ status: 200, description: 'Cuenta de caja actualizada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  updateCuentaCaja(@Param('id') id: string, @Body() dto: UpdateCuentaCajaDto) {
    return this.cajaService.updateCuentaCaja(id, dto);
  }

  @Delete('cuentas/:id')
  @ApiOperation({ summary: 'Eliminar cuenta de caja' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta de caja' })
  @ApiResponse({ status: 200, description: 'Cuenta de caja eliminada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  removeCuentaCaja(@Param('id') id: string) {
    return this.cajaService.removeCuentaCaja(id);
  }

  @Post('cuentas/:id/reponer')
  @ApiOperation({ summary: 'Reponer fondo fijo de una cuenta de caja' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta de caja' })
  @ApiResponse({ status: 200, description: 'Fondo fijo repuesto' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  reponerFondoFijo(@Param('id') id: string, @Body() dto: ReponerFondoFijoDto) {
    return this.cajaService.reponerFondoFijo(id, dto);
  }

  // ─── Movimientos ─────────────────────────────────────────────

  @Post('movimiento')
  @ApiOperation({
    summary:
      'Registrar movimiento de caja (Res. 324/1994 BNC, Res. 111/2023 BCC)',
  })
  @ApiResponse({ status: 201, description: 'Movimiento registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  createMovimiento(@Body() dto: CreateMovimientoCajaDto) {
    return this.cajaService.createMovimiento(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los movimientos de caja' })
  @ApiQuery({
    name: 'cajaId',
    required: false,
    description: 'Filtrar por cuenta de caja',
  })
  @ApiResponse({ status: 200, description: 'Lista de movimientos' })
  findAll(@Query('cajaId') cajaId?: string) {
    return this.cajaService.findAll(cajaId);
  }

  @Get('saldo')
  @ApiOperation({ summary: 'Saldo actual de caja' })
  @ApiQuery({
    name: 'cajaId',
    required: false,
    description: 'Filtrar por cuenta de caja',
  })
  @ApiResponse({ status: 200, description: 'Saldo actual' })
  getSaldo(@Query('cajaId') cajaId?: string) {
    return this.cajaService.getSaldoActual(cajaId);
  }

  @Get('dia')
  @ApiOperation({ summary: 'Movimientos del día' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'cajaId',
    required: false,
    description: 'Filtrar por cuenta de caja',
  })
  @ApiResponse({ status: 200, description: 'Movimientos del día' })
  getMovimientosDelDia(
    @Query('fecha') fecha?: string,
    @Query('cajaId') cajaId?: string,
  ) {
    return this.cajaService.getMovimientosDelDia(fecha, cajaId);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen por concepto' })
  @ApiResponse({ status: 200, description: 'Resumen por concepto' })
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
  @ApiQuery({
    name: 'cajaId',
    required: false,
    description: 'Filtrar por cuenta de caja',
  })
  getResumen(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('cajaId') cajaId?: string,
  ) {
    return this.cajaService.getResumenPorConcepto(desde, hasta, cajaId);
  }

  @Get('arqueos')
  @ApiOperation({ summary: 'Historial de arqueos' })
  @ApiResponse({ status: 200, description: 'Historial de arqueos' })
  getArqueos() {
    return this.cajaService.getArqueos();
  }

  @Post('arqueo')
  @ApiOperation({ summary: 'Realizar arqueo de caja (Res. 324/1994 BNC)' })
  @ApiResponse({
    status: 200,
    description: 'Arqueo realizado, diferencia calculada',
  })
  realizarArqueo(@Body() arqueoDto: CreateArqueoCajaDto) {
    return this.cajaService.realizarArqueo(arqueoDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
  @ApiResponse({ status: 200, description: 'Movimiento encontrado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id') id: string) {
    return this.cajaService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar movimiento' })
  @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
  @ApiResponse({ status: 200, description: 'Movimiento eliminado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  remove(@Param('id') id: string) {
    return this.cajaService.remove(id);
  }
}
