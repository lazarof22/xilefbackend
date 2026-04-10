import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) { }

  @ApiOperation({ summary: 'Registrar una nueva venta' })
  @ApiResponse({ status: 201, description: 'Venta registrada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventaService.create(createVentaDto);
  }

  @ApiOperation({ summary: 'Obtener todos las ventas' })
  @ApiResponse({ status: 201, description: 'Ventas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.ventaService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una venta' })
  @ApiResponse({ status: 201, description: 'Venta obtenida con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventaService.findOne(id);
  }


  @ApiOperation({ summary: 'Modificar una venta' })
  @ApiResponse({ status: 201, description: 'VVenta modificada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventaService.update(id, updateVentaDto);
  }


  @ApiOperation({ summary: 'Eliminar una venta' })
  @ApiResponse({ status: 201, description: 'Venta eliminada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ventaService.remove(id);
  }
}
