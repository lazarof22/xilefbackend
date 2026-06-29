import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TransfermovilService } from './transfermovil.service';
import { TransfermovilWebhookDto } from './dto/transfermovil-webhook.dto';
import { GenerarQrDinamicoDto } from './dto/generar-qr-dinamico.dto';
import { GenerarQrEstaticoDto } from './dto/generar-qr-estatico.dto';
import { EstadoTransfermovil } from './types/transfermovil.types';

@ApiTags('Transfermovil - Pasarela de Pago')
@Controller('transfermovil')
export class TransfermovilController {
  constructor(private readonly transfermovilService: TransfermovilService) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook para pagos de Transfermovil' })
  @ApiResponse({ status: 200, description: 'Webhook procesado' })
  async procesarWebhook(@Body() dto: TransfermovilWebhookDto) {
    return this.transfermovilService.procesarWebhook(dto);
  }

  @Post('qr/estatico')
  @ApiOperation({ summary: 'Generar un QR estatico' })
  @ApiResponse({ status: 201, description: 'QR estatico generado' })
  async generarQrEstatico(@Body() dto: GenerarQrEstaticoDto) {
    return this.transfermovilService.generarQrEstatico(dto);
  }

  @Post('qr/dinamico')
  @ApiOperation({ summary: 'Generar código QR dinámico' })
  @ApiResponse({ status: 201, description: 'QR dinámico generado' })
  generarQrDinamico(@Body() dto: GenerarQrDinamicoDto) {
    return this.transfermovilService.generarQrDinamico(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pagos de Transfermovil' })
  @ApiResponse({ status: 200, description: 'Lista de pagos' })
  async findAll() {
    return this.transfermovilService.findAll();
  }

  @Get('qr-estaticos')
  @ApiOperation({ summary: 'Obtener todos los QR estaticos' })
  @ApiResponse({ status: 200, description: 'Lista de QR estaticos' })
  async getQrEstaticos() {
    return this.transfermovilService.getQrEstaticos();
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener pagos por estado' })
  @ApiParam({
    name: 'estado',
    description: 'Estado del pago (PENDIENTE, COMPLETADO, FALLIDO)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos filtrada por estado',
  })
  async getPorEstado(@Param('estado') estado: EstadoTransfermovil) {
    return this.transfermovilService.getPorEstado(estado);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Obtener resumen de pagos de Transfermovil' })
  @ApiResponse({ status: 200, description: 'Resumen de pagos' })
  async getResumen() {
    return this.transfermovilService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 200, description: 'Pago encontrado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.transfermovilService.findOne(id);
  }
}
