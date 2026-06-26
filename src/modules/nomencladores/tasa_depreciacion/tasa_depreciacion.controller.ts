import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasaDepreciacionService } from './tasa_depreciacion.service';
import { CreateTasaDepreciacionDto } from './dto/create-tasa_depreciacion.dto';
import { UpdateTasaDepreciacionDto } from './dto/update-tasa_depreciacion.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Tasa de Depreciacion')
@Controller('tasa-depreciacion')
export class TasaDepreciacionController {
  constructor(private readonly tasaDepreciacionService: TasaDepreciacionService) { }

  @ApiOperation({ summary: 'Registrar una nueva tasa' })
  @ApiResponse({ status: 201, description: 'Tasa registrada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createTasaDepreciacionDto: CreateTasaDepreciacionDto) {
    return this.tasaDepreciacionService.create(createTasaDepreciacionDto);
  }

  @ApiOperation({ summary: 'Obtener todas las tasas' })
  @ApiResponse({ status: 200, description: 'Tasas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.tasaDepreciacionService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una tasa por ID' })
  @ApiResponse({ status: 200, description: 'Tasa obtenida con exito' })
  @ApiResponse({ status: 404, description: 'Tasa no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la tasa de depreciación' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasaDepreciacionService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una tasa' })
  @ApiResponse({ status: 200, description: 'Tasa modificada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Tasa no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la tasa de depreciación' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTasaDepreciacionDto: UpdateTasaDepreciacionDto) {
    return this.tasaDepreciacionService.update(id, updateTasaDepreciacionDto);
  }

  @ApiOperation({ summary: 'Eliminar una tasa' })
  @ApiResponse({ status: 200, description: 'Tasa eliminada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Tasa no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la tasa de depreciación' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasaDepreciacionService.remove(id);
  }
}
