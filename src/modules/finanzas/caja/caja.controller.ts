import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';
import { CreateArqueoCajaDto } from './dto/create-arqueo-caja.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Caja - Efectivo')
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('movimiento')
  @ApiOperation({ summary: 'Registrar movimiento de caja (Res. 324/1994 BNC, Res. 111/2023 BCC)' })
  @ApiResponse({ status: 201, description: 'Movimiento registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  createMovimiento(@Body() createDto: CreateMovimientoCajaDto) { return this.cajaService.createMovimiento(createDto); }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los movimientos de caja' })
  @ApiResponse({ status: 200, description: 'Lista de movimientos' })
  findAll() { return this.cajaService.findAll(); }

  @Get('saldo')
  @ApiOperation({ summary: 'Saldo actual de caja' })
  @ApiResponse({ status: 200, description: 'Saldo actual' })
  getSaldo() { return this.cajaService.getSaldoActual(); }

  @Get('dia')
  @ApiOperation({ summary: 'Movimientos del día' })
  @ApiQuery({ name: 'fecha', required: false })
  @ApiResponse({ status: 200, description: 'Movimientos del día' })
  getMovimientosDelDia(@Query('fecha') fecha?: string) { return this.cajaService.getMovimientosDelDia(fecha); }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen por concepto' })
  @ApiResponse({ status: 200, description: 'Resumen por concepto' })
  @ApiQuery({ name: 'desde', required: false }) @ApiQuery({ name: 'hasta', required: false })
  getResumen(@Query('desde') desde?: string, @Query('hasta') hasta?: string) { return this.cajaService.getResumenPorConcepto(desde, hasta); }

  @Get('arqueos')
  @ApiOperation({ summary: 'Historial de arqueos' })
  @ApiResponse({ status: 200, description: 'Historial de arqueos' })
  getArqueos() { return this.cajaService.getArqueos(); }

  @Post('arqueo')
  @ApiOperation({ summary: 'Realizar arqueo de caja (Res. 324/1994 BNC)' })
  @ApiResponse({ status: 200, description: 'Arqueo realizado, diferencia calculada' })
  realizarArqueo(@Body() arqueoDto: CreateArqueoCajaDto) { return this.cajaService.realizarArqueo(arqueoDto); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Movimiento encontrado' }) @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id') id: string) { return this.cajaService.findOne(id); }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar movimiento' })
  @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Movimiento eliminado' }) @ApiResponse({ status: 404, description: 'No encontrado' })
  remove(@Param('id') id: string) { return this.cajaService.remove(id); }
}
