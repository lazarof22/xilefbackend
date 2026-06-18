import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoCreditoDto, CreatePagoEfectivoDto, CreatePagoTransferenciaDto } from './dto/create-pago.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Pago')
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) { }

  @ApiOperation({ summary: 'Registrar un nuevo pago en efectivo' })
  @ApiResponse({ status: 201, description: 'Pago en efectivo registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/pagoEfectivo')
  createPagoE(@Body() createPagoEfectivoDto: CreatePagoEfectivoDto) {
    return this.pagoService.createPagoE(createPagoEfectivoDto);
  }

  @ApiOperation({ summary: 'Registrar un nuevo pago en transferencia' })
  @ApiResponse({ status: 201, description: 'Pago en transferencia registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/pagoTransferencia')
  createPagoT(@Body() createPagoTransferenciaDto: CreatePagoTransferenciaDto) {
    return this.pagoService.createPagoT(createPagoTransferenciaDto);
  }

  @ApiOperation({ summary: 'Registrar un nuevo pago en transferencia' })
  @ApiResponse({ status: 201, description: 'Pago en transferencia registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/pagoCredito')
  createPagoC(@Body() createPagoCreditoDto: CreatePagoCreditoDto) {
    return this.pagoService.createPagoC(createPagoCreditoDto);
  }

  
}
