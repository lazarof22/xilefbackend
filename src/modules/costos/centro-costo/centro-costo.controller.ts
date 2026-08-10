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
import { TipoCentroCosto } from './schema/centro-costo.schema';

@ApiTags('Centro de Costo')
@Controller('centro-costo')
export class CentroCostoController {
  constructor(private readonly centroCostoService: CentroCostoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo centro de costo' })
  @ApiResponse({
    status: 201,
    description: 'Centro de costo registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createCentroCostoDto: CreateCentroCostoDto) {
    return this.centroCostoService.create(createCentroCostoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los centros de costo' })
  @ApiResponse({ status: 200, description: 'Lista de centros de costo' })
  findAll() {
    return this.centroCostoService.findAll();
  }

  @Get('subcentros/:id')
  @ApiOperation({ summary: 'Obtener subcentros de un centro de costo padre' })
  @ApiParam({ name: 'id', description: 'ID del centro de costo padre' })
  @ApiResponse({ status: 200, description: 'Lista de subcentros' })
  @ApiResponse({ status: 404, description: 'Centro de costo no encontrado' })
  findSubcentros(@Param('id') id: string) {
    return this.centroCostoService.findSubcentros(id);
  }

  @Get('tipo/:tipo')
  @ApiOperation({ summary: 'Obtener centros de costo por tipo' })
  @ApiParam({
    name: 'tipo',
    description: 'Tipo de centro de costo',
    enum: TipoCentroCosto,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de centros de costo por tipo',
  })
  findByTipo(@Param('tipo') tipo: TipoCentroCosto) {
    return this.centroCostoService.findByTipo(tipo);
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
  update(
    @Param('id') id: string,
    @Body() updateCentroCostoDto: UpdateCentroCostoDto,
  ) {
    return this.centroCostoService.update(id, updateCentroCostoDto);
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
