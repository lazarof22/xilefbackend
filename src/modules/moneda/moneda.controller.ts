import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MonedaService } from './moneda.service';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { PaginationMonedaDto } from './dto/pagination-moneda.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';


@ApiTags('Moneda')
@Controller('moneda')
export class MonedaController {
  constructor(private readonly monedaService: MonedaService) { }

  @ApiOperation({ summary: 'Registrar una nueva moneda' })
  @ApiResponse({ status: 201, description: 'Moneda registrada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createMonedaDto: CreateMonedaDto) {
    return this.monedaService.create(createMonedaDto);
  }


  @ApiOperation({ summary: 'Obtener todas las monedas' })
  @ApiResponse({ status: 201, description: 'Monedas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationMonedaDto) {
    return this.monedaService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Obtener todas las monedas' })
  @ApiResponse({ status: 201, description: 'Monedas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monedaService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una moneda' })
  @ApiResponse({ status: 201, description: 'Moneda modificada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMonedaDto: UpdateMonedaDto) {
    return this.monedaService.update(id, updateMonedaDto);
  }

  @ApiOperation({ summary: 'Eliminar una moneda' })
  @ApiResponse({ status: 201, description: 'Moneda eliminada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monedaService.remove(id);
  }
}
