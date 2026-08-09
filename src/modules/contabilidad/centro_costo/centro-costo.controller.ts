import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CentroCostoService } from './centro-costo.service';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';
import { UpdateCentroCostoDto } from './dto/update-centro-costo.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Centros de Costo')
@Controller('centro-costo')
export class CentroCostoController {
  constructor(private readonly centroCostoService: CentroCostoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo centro de costo' })
  @ApiResponse({ status: 201, description: 'Centro de costo registrado' })
  @ApiResponse({ status: 400, description: 'Código duplicado' })
  create(@Body() createDto: CreateCentroCostoDto) {
    return this.centroCostoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los centros de costo' })
  @ApiResponse({ status: 200, description: 'Lista de centros de costo' })
  findAll() {
    return this.centroCostoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un centro de costo por ID' })
  @ApiParam({ name: 'id', description: 'ID del centro de costo' })
  @ApiResponse({ status: 200, description: 'Centro de costo encontrado' })
  @ApiResponse({ status: 404, description: 'Centro de costo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.centroCostoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un centro de costo' })
  @ApiParam({ name: 'id', description: 'ID del centro de costo' })
  @ApiResponse({ status: 200, description: 'Centro de costo actualizado' })
  @ApiResponse({ status: 404, description: 'Centro de costo no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCentroCostoDto) {
    return this.centroCostoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un centro de costo' })
  @ApiParam({ name: 'id', description: 'ID del centro de costo' })
  @ApiResponse({ status: 200, description: 'Centro de costo eliminado' })
  @ApiResponse({ status: 404, description: 'Centro de costo no encontrado' })
  remove(@Param('id') id: string) {
    return this.centroCostoService.remove(id);
  }
}
