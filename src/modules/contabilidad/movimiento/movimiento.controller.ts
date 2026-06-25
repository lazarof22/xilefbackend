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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  getTipos() {
    return this.movimientoService.getTiposMovimiento();
  }

  @Get('activo/:activoId')
  @ApiOperation({ summary: 'Obtener movimientos por activo fijo' })
  findByActivo(@Param('activoId') activoId: string) {
    return this.movimientoService.findByActivo(activoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  findOne(@Param('id') id: string) {
    return this.movimientoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un movimiento' })
  update(
    @Param('id') id: string,
    @Body() updateMovimientoDto: UpdateMovimientoDto,
  ) {
    return this.movimientoService.update(id, updateMovimientoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un movimiento' })
  remove(@Param('id') id: string) {
    return this.movimientoService.remove(id);
  }
}
