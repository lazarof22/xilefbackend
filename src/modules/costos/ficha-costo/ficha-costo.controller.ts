import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FichaCostoService } from './ficha-costo.service';
import { CreateFichaCostoDto } from './dto/create-ficha-costo.dto';
import { UpdateFichaCostoDto } from './dto/update-ficha-costo.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
@ApiTags('Ficha de Costo')
@Controller('ficha-costo')
export class FichaCostoController {
  constructor(private readonly fichaCostoService: FichaCostoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva ficha de costo' })
  @ApiResponse({
    status: 201,
    description: 'Ficha de costo registrada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createFichaCostoDto: CreateFichaCostoDto) {
    return this.fichaCostoService.create(createFichaCostoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las fichas de costo' })
  @ApiResponse({ status: 200, description: 'Lista de fichas de costo' })
  findAll() {
    return this.fichaCostoService.findAll();
  }

  @Get('producto/:productoId')
  @ApiOperation({ summary: 'Obtener fichas de costo por producto' })
  @ApiParam({ name: 'productoId', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas de costo del producto',
  })
  findByProducto(@Param('productoId') productoId: string) {
    return this.fichaCostoService.findByProducto(productoId);
  }

  @Get('centro-costo/:centroCostoId')
  @ApiOperation({ summary: 'Obtener fichas de costo por centro de costo' })
  @ApiParam({ name: 'centroCostoId', description: 'ID del centro de costo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas de costo por centro de costo',
  })
  findByCentroCosto(@Param('centroCostoId') centroCostoId: string) {
    return this.fichaCostoService.findByCentroCosto(centroCostoId);
  }

  @Get('periodo/:periodo')
  @ApiOperation({ summary: 'Obtener fichas de costo por período' })
  @ApiParam({ name: 'periodo', description: 'Período (ej: 2026-08)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas de costo del período',
  })
  findByPeriodo(@Param('periodo') periodo: string) {
    return this.fichaCostoService.findByPeriodo(periodo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ficha de costo por ID' })
  @ApiParam({ name: 'id', description: 'ID de la ficha de costo' })
  @ApiResponse({ status: 200, description: 'Ficha de costo encontrada' })
  @ApiResponse({ status: 404, description: 'Ficha de costo no encontrada' })
  findOne(@Param('id') id: string) {
    return this.fichaCostoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ficha de costo' })
  @ApiParam({ name: 'id', description: 'ID de la ficha de costo' })
  @ApiResponse({ status: 200, description: 'Ficha de costo actualizada' })
  @ApiResponse({ status: 404, description: 'Ficha de costo no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateFichaCostoDto: UpdateFichaCostoDto,
  ) {
    return this.fichaCostoService.update(id, updateFichaCostoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ficha de costo' })
  @ApiParam({ name: 'id', description: 'ID de la ficha de costo' })
  @ApiResponse({ status: 200, description: 'Ficha de costo eliminada' })
  @ApiResponse({ status: 404, description: 'Ficha de costo no encontrada' })
  remove(@Param('id') id: string) {
    return this.fichaCostoService.remove(id);
  }
}
