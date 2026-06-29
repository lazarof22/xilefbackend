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
import { TasaCambioService } from './tasa-cambio.service';
import { CreateTasaCambioDto } from './dto/create-tasa-cambio.dto';
import { UpdateTasaCambioDto } from './dto/update-tasa-cambio.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { TipoTasa } from './types/tasa-cambio.types';

@ApiTags('Tasa de Cambio')
@Controller('tasa-cambio')
export class TasaCambioController {
  constructor(private readonly tasaCambioService: TasaCambioService) {}

  @ApiOperation({ summary: 'Registrar una nueva tasa de cambio' })
  @ApiResponse({
    status: 201,
    description: 'Tasa de cambio registrada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createTasaCambioDto: CreateTasaCambioDto) {
    return this.tasaCambioService.create(createTasaCambioDto);
  }

  @ApiOperation({ summary: 'Obtener todas las tasas de cambio' })
  @ApiResponse({
    status: 201,
    description: 'Tasas de cambio obtenidas con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.tasaCambioService.findAll();
  }

  @ApiOperation({ summary: 'Obtener tasa vigente para un par de monedas' })
  @ApiQuery({ name: 'monedaOrigen', required: true })
  @ApiQuery({ name: 'monedaDestino', required: true })
  @ApiQuery({ name: 'tipo', enum: TipoTasa, required: false })
  @Get('vigente')
  getVigente(
    @Query('monedaOrigen') monedaOrigen: string,
    @Query('monedaDestino') monedaDestino: string,
    @Query('tipo') tipo?: TipoTasa,
  ) {
    return this.tasaCambioService.getVigente(monedaOrigen, monedaDestino, tipo);
  }

  @ApiOperation({
    summary: 'Convertir monto entre monedas usando tasa vigente',
  })
  @ApiQuery({ name: 'monto', required: true })
  @ApiQuery({ name: 'monedaOrigen', required: true })
  @ApiQuery({ name: 'monedaDestino', required: true })
  @ApiQuery({ name: 'tipo', enum: TipoTasa, required: false })
  @Get('convertir')
  convertir(
    @Query('monto') monto: string,
    @Query('monedaOrigen') monedaOrigen: string,
    @Query('monedaDestino') monedaDestino: string,
    @Query('tipo') tipo?: TipoTasa,
  ) {
    return this.tasaCambioService.convertir(
      Number(monto),
      monedaOrigen,
      monedaDestino,
      tipo,
    );
  }

  @ApiOperation({
    summary: 'Obtener historico de tasas para un par de monedas',
  })
  @ApiQuery({ name: 'monedaOrigen', required: true })
  @ApiQuery({ name: 'monedaDestino', required: true })
  @ApiQuery({ name: 'hasta', required: false })
  @ApiQuery({ name: 'tipo', enum: TipoTasa, required: false })
  @Get('historico')
  getHistorico(
    @Query('monedaOrigen') monedaOrigen: string,
    @Query('monedaDestino') monedaDestino: string,
    @Query('hasta') hasta?: string,
    @Query('tipo') tipo?: TipoTasa,
  ) {
    return this.tasaCambioService.getHistorico(
      monedaOrigen,
      monedaDestino,
      hasta,
      tipo,
    );
  }

  @ApiOperation({ summary: 'Obtener una tasa de cambio por ID' })
  @ApiResponse({
    status: 201,
    description: 'Tasa de cambio obtenida con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasaCambioService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una tasa de cambio' })
  @ApiResponse({
    status: 201,
    description: 'Tasa de cambio modificada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTasaCambioDto: UpdateTasaCambioDto,
  ) {
    return this.tasaCambioService.update(id, updateTasaCambioDto);
  }

  @ApiOperation({ summary: 'Eliminar una tasa de cambio' })
  @ApiResponse({
    status: 201,
    description: 'Tasa de cambio eliminada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasaCambioService.remove(id);
  }
}
