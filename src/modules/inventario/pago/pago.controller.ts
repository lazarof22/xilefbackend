import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PagoService } from './pago.service';
import {
  CreatePagoCreditoDto,
  CreatePagoEfectivoDto,
  CreatePagoTransferenciaDto,
} from './dto/create-pago.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Pago')
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @ApiOperation({ summary: 'Registrar un nuevo pago en efectivo' })
  @ApiResponse({
    status: 201,
    description: 'Pago en efectivo registrado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/pagoEfectivo')
  createPagoE(@Body() createPagoEfectivoDto: CreatePagoEfectivoDto) {
    return this.pagoService.createPagoE(createPagoEfectivoDto);
  }

  @ApiOperation({ summary: 'Registrar un nuevo pago en transferencia' })
  @ApiResponse({
    status: 201,
    description: 'Pago en transferencia registrado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/pagoTransferencia')
  createPagoT(@Body() createPagoTransferenciaDto: CreatePagoTransferenciaDto) {
    return this.pagoService.createPagoT(createPagoTransferenciaDto);
  }

  @ApiOperation({ summary: 'Registrar un nuevo pago en credito' })
  @ApiResponse({
    status: 201,
    description: 'Pago en credito registrado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/pagoCredito')
  createPagoC(@Body() createPagoCreditoDto: CreatePagoCreditoDto) {
    return this.pagoService.createPagoC(createPagoCreditoDto);
  }

  @ApiOperation({ summary: 'Listar todos los pagos' })
  @ApiResponse({ status: 200, description: 'Pagos listados con exito' })
  @Get()
  findAll() {
    return this.pagoService.findAll();
  }

  @ApiOperation({ summary: 'Resumen de clientes por efectivo o estándar' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha en formato YYYY-MM-DD (por defecto hoy)',
  })
  @Get('resumen/efectivo-estandar')
  resumenEfectivoEstandar(@Query('fecha') fecha?: string) {
    return this.pagoService.resumenEfectivoEstandar(fecha);
  }

  @ApiOperation({ summary: 'Resumen de clientes por descuento' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha en formato YYYY-MM-DD (por defecto hoy)',
  })
  @Get('resumen/descuento')
  resumenPorDescuento(@Query('fecha') fecha?: string) {
    return this.pagoService.resumenPorDescuento(fecha);
  }

  @ApiOperation({ summary: 'Resumen de clientes por transferencia' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha en formato YYYY-MM-DD (por defecto hoy)',
  })
  @Get('resumen/transferencia')
  resumenPorTransferencia(@Query('fecha') fecha?: string) {
    return this.pagoService.resumenPorTransferencia(fecha);
  }

  @ApiOperation({ summary: 'Resumen de clientes cuenta casa' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha en formato YYYY-MM-DD (por defecto hoy)',
  })
  @Get('resumen/cuenta-casa')
  resumenCuentaCasa(@Query('fecha') fecha?: string) {
    return this.pagoService.resumenCuentaCasa(fecha);
  }

  @ApiOperation({ summary: 'Resumen de clientes por credito' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha en formato YYYY-MM-DD (por defecto hoy)',
  })
  @Get('resumen/credito')
  resumenPorCredito(@Query('fecha') fecha?: string) {
    return this.pagoService.resumenPorCredito(fecha);
  }

  @ApiOperation({ summary: 'Obtener un pago por id' })
  @ApiResponse({ status: 200, description: 'Pago encontrado con exito' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagoService.findOne(id);
  }
}
