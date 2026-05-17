import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) { }


  @ApiOperation({ summary: 'Registrar una nueva moneda' })
  @ApiResponse({ status: 201, description: 'Moneda registrada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @ApiOperation({ summary: 'Obtener todas las monedas' })
  @ApiResponse({ status: 201, description: 'Monedas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.areaService.findAll();
  }


  @ApiOperation({ summary: 'Obtener todas las monedas' })
  @ApiResponse({ status: 201, description: 'Monedas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.areaService.findOne(id);
  }


  @ApiOperation({ summary: 'Modificar una moneda' })
  @ApiResponse({ status: 201, description: 'Moneda modificada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(id, updateAreaDto);
  }


  @ApiOperation({ summary: 'Eliminar una moneda' })
  @ApiResponse({ status: 201, description: 'Moneda eliminada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areaService.remove(id);
  }
}
