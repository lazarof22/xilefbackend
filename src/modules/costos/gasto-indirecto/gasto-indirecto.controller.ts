import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GastoIndirectoService } from './gasto-indirecto.service';
import { CreateGastoIndirectoDto } from './dto/create-gasto-indirecto.dto';
import { UpdateGastoIndirectoDto } from './dto/update-gasto-indirecto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
@ApiTags('Gasto Indirecto')
@Controller('gasto-indirecto')
export class GastoIndirectoController {
  constructor(private readonly gastoIndirectoService: GastoIndirectoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo gasto indirecto' })
  @ApiResponse({
    status: 201,
    description: 'Gasto indirecto registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createGastoIndirectoDto: CreateGastoIndirectoDto) {
    return this.gastoIndirectoService.create(createGastoIndirectoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los gastos indirectos' })
  @ApiResponse({ status: 200, description: 'Lista de gastos indirectos' })
  findAll() {
    return this.gastoIndirectoService.findAll();
  }

  @Get('centro-costo/:centroCostoId')
  @ApiOperation({ summary: 'Obtener gastos indirectos por centro de costo' })
  @ApiParam({ name: 'centroCostoId', description: 'ID del centro de costo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gastos indirectos por centro de costo',
  })
  findByCentroCosto(@Param('centroCostoId') centroCostoId: string) {
    return this.gastoIndirectoService.findByCentroCosto(centroCostoId);
  }

  @Get('periodo/:periodo')
  @ApiOperation({ summary: 'Obtener gastos indirectos por período' })
  @ApiParam({ name: 'periodo', description: 'Período (ej: 2026-08)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gastos indirectos del período',
  })
  findByPeriodo(@Param('periodo') periodo: string) {
    return this.gastoIndirectoService.findByPeriodo(periodo);
  }

  @Get('no-distribuidos/:periodo')
  @ApiOperation({
    summary: 'Obtener gastos indirectos no distribuidos de un período',
  })
  @ApiParam({ name: 'periodo', description: 'Período (ej: 2026-08)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gastos indirectos no distribuidos',
  })
  findNoDistribuidos(@Param('periodo') periodo: string) {
    return this.gastoIndirectoService.findNoDistribuidos(periodo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un gasto indirecto por ID' })
  @ApiParam({ name: 'id', description: 'ID del gasto indirecto' })
  @ApiResponse({ status: 200, description: 'Gasto indirecto encontrado' })
  @ApiResponse({ status: 404, description: 'Gasto indirecto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.gastoIndirectoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un gasto indirecto' })
  @ApiParam({ name: 'id', description: 'ID del gasto indirecto' })
  @ApiResponse({ status: 200, description: 'Gasto indirecto actualizado' })
  @ApiResponse({ status: 404, description: 'Gasto indirecto no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateGastoIndirectoDto: UpdateGastoIndirectoDto,
  ) {
    return this.gastoIndirectoService.update(id, updateGastoIndirectoDto);
  }

  @Patch('distribuir/:id')
  @ApiOperation({ summary: 'Marcar un gasto indirecto como distribuido' })
  @ApiParam({ name: 'id', description: 'ID del gasto indirecto' })
  @ApiResponse({ status: 200, description: 'Gasto indirecto distribuido' })
  @ApiResponse({ status: 404, description: 'Gasto indirecto no encontrado' })
  distribuir(@Param('id') id: string) {
    return this.gastoIndirectoService.distribuir(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un gasto indirecto' })
  @ApiParam({ name: 'id', description: 'ID del gasto indirecto' })
  @ApiResponse({ status: 200, description: 'Gasto indirecto eliminado' })
  @ApiResponse({ status: 404, description: 'Gasto indirecto no encontrado' })
  remove(@Param('id') id: string) {
    return this.gastoIndirectoService.remove(id);
  }
}
