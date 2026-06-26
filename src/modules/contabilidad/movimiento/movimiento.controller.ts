import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Movimientos de Activos Fijos')
@Controller('movimiento')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo movimiento' })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientoService.create(createMovimientoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los movimientos' })
  @ApiResponse({ status: 200, description: 'Lista de movimientos' })
  findAll() {
    return this.movimientoService.findAll();
  }

  @Get('tipos')
  @ApiOperation({ summary: 'Obtener tipos de movimiento disponibles' })
  @ApiResponse({ status: 200, description: 'Tipos de movimiento disponibles' })
  getTipos() {
    return this.movimientoService.getTiposMovimiento();
  }

  @Get('activo/:activoId')
  @ApiOperation({ summary: 'Obtener movimientos por activo fijo' })
  @ApiParam({ name: 'activoId', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Movimientos del activo' })
  findByActivo(@Param('activoId') activoId: string) {
    return this.movimientoService.findByActivo(activoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({ status: 200, description: 'Movimiento encontrado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  findOne(@Param('id') id: string) {
    return this.movimientoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un movimiento' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({ status: 200, description: 'Movimiento actualizado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateMovimientoDto: UpdateMovimientoDto,
  ) {
    return this.movimientoService.update(id, updateMovimientoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un movimiento' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({ status: 200, description: 'Movimiento eliminado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  remove(@Param('id') id: string) {
    return this.movimientoService.remove(id);
  }
}
