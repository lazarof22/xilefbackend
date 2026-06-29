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
import { PosicionMonetariaService } from './posicion-monetaria.service';
import { CreatePosicionMonetariaDto } from './dto/create-posicion.dto';
import { UpdatePosicionMonetariaDto } from './dto/update-posicion.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Posición Monetaria')
@Controller('posicion-monetaria')
export class PosicionMonetariaController {
  constructor(
    private readonly posicionMonetariaService: PosicionMonetariaService,
  ) {}

  @Post('generar')
  @ApiOperation({ summary: 'Generar/Calcular posición monetaria actual' })
  @ApiResponse({
    status: 201,
    description: 'Posición monetaria generada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada' })
  generar(@Body() createDto: CreatePosicionMonetariaDto) {
    return this.posicionMonetariaService.generar(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las posiciones monetarias' })
  @ApiResponse({ status: 200, description: 'Lista de posiciones monetarias' })
  findAll() {
    return this.posicionMonetariaService.findAll();
  }

  @Get('comparativa')
  @ApiOperation({ summary: 'Comparar posiciones monetarias entre dos fechas' })
  @ApiQuery({
    name: 'fecha1',
    required: true,
    description: 'Primera fecha (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fecha2',
    required: true,
    description: 'Segunda fecha (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparativa de posiciones monetarias',
  })
  getComparativa(
    @Query('fecha1') fecha1: string,
    @Query('fecha2') fecha2: string,
  ) {
    return this.posicionMonetariaService.getComparativa(fecha1, fecha2);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Histórico de posiciones monetarias' })
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
  @ApiResponse({
    status: 200,
    description: 'Histórico de posiciones monetarias',
  })
  getHistorico(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.posicionMonetariaService.getHistorico(desde, hasta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener posición monetaria por ID' })
  @ApiParam({ name: 'id', description: 'ID de la posición monetaria' })
  @ApiResponse({ status: 200, description: 'Posición monetaria encontrada' })
  @ApiResponse({ status: 404, description: 'Posición monetaria no encontrada' })
  findOne(@Param('id') id: string) {
    return this.posicionMonetariaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar posición monetaria' })
  @ApiParam({ name: 'id', description: 'ID de la posición monetaria' })
  @ApiResponse({ status: 200, description: 'Posición monetaria actualizada' })
  @ApiResponse({ status: 404, description: 'Posición monetaria no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePosicionMonetariaDto,
  ) {
    return this.posicionMonetariaService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar posición monetaria' })
  @ApiParam({ name: 'id', description: 'ID de la posición monetaria' })
  @ApiResponse({ status: 200, description: 'Posición monetaria eliminada' })
  @ApiResponse({ status: 404, description: 'Posición monetaria no encontrada' })
  remove(@Param('id') id: string) {
    return this.posicionMonetariaService.remove(id);
  }
}
