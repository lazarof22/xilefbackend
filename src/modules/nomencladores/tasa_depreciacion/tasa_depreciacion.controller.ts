import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasaDepreciacionService } from './tasa_depreciacion.service';
import { CreateTasaDepreciacionDto } from './dto/create-tasa_depreciacion.dto';
import { UpdateTasaDepreciacionDto } from './dto/update-tasa_depreciacion.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: 201, description: 'Tasas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.tasaDepreciacionService.findAll();
  }

  @ApiOperation({ summary: 'Obtener todas las tasas' })
  @ApiResponse({ status: 201, description: 'Tasas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasaDepreciacionService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una tasa' })
  @ApiResponse({ status: 201, description: 'Tasa modificada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTasaDepreciacionDto: UpdateTasaDepreciacionDto) {
    return this.tasaDepreciacionService.update(id, updateTasaDepreciacionDto);
  }

  @ApiOperation({ summary: 'Eliminar una tasa' })
  @ApiResponse({ status: 201, description: 'Tasa eliminada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasaDepreciacionService.remove(id);
  }
}
