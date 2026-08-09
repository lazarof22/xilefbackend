import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AsientoService } from './asiento.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Asientos Contables')
@Controller('asiento')
export class AsientoController {
  constructor(private readonly asientoService: AsientoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo asiento contable' })
  @ApiResponse({ status: 201, description: 'Asiento registrado' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createDto: CreateAsientoDto) {
    return this.asientoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los asientos' })
  @ApiResponse({ status: 200, description: 'Lista de asientos' })
  findAll() {
    return this.asientoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un asiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del asiento' })
  @ApiResponse({ status: 200, description: 'Asiento encontrado' })
  @ApiResponse({ status: 404, description: 'Asiento no encontrado' })
  findOne(@Param('id') id: string) {
    return this.asientoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un asiento' })
  @ApiParam({ name: 'id', description: 'ID del asiento' })
  @ApiResponse({ status: 200, description: 'Asiento actualizado' })
  @ApiResponse({ status: 404, description: 'Asiento no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAsientoDto) {
    return this.asientoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un asiento' })
  @ApiParam({ name: 'id', description: 'ID del asiento' })
  @ApiResponse({ status: 200, description: 'Asiento eliminado' })
  @ApiResponse({ status: 404, description: 'Asiento no encontrado' })
  remove(@Param('id') id: string) {
    return this.asientoService.remove(id);
  }
}
