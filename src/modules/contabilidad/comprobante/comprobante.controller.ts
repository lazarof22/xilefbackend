import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComprobanteService } from './comprobante.service';
import { CreateComprobanteDto } from './dto/create-comprobante.dto';
import { UpdateComprobanteDto } from './dto/update-comprobante.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Comprobantes (Diario General)')
@Controller('comprobante')
export class ComprobanteController {
  constructor(private readonly comprobanteService: ComprobanteService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo comprobante (valida equilibrio debe = haber)',
  })
  @ApiResponse({
    status: 201,
    description: 'Comprobante registrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o comprobante no equilibrado',
  })
  create(@Body() createDto: CreateComprobanteDto) {
    return this.comprobanteService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los comprobantes' })
  @ApiResponse({ status: 200, description: 'Lista de comprobantes' })
  findAll() {
    return this.comprobanteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un comprobante por ID' })
  @ApiParam({ name: 'id', description: 'ID del comprobante' })
  @ApiResponse({ status: 200, description: 'Comprobante encontrado' })
  @ApiResponse({ status: 404, description: 'Comprobante no encontrado' })
  findOne(@Param('id') id: string) {
    return this.comprobanteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un comprobante' })
  @ApiParam({ name: 'id', description: 'ID del comprobante' })
  @ApiResponse({ status: 200, description: 'Comprobante actualizado' })
  @ApiResponse({ status: 404, description: 'Comprobante no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateComprobanteDto) {
    return this.comprobanteService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un comprobante' })
  @ApiParam({ name: 'id', description: 'ID del comprobante' })
  @ApiResponse({ status: 200, description: 'Comprobante eliminado' })
  @ApiResponse({ status: 404, description: 'Comprobante no encontrado' })
  remove(@Param('id') id: string) {
    return this.comprobanteService.remove(id);
  }
}
