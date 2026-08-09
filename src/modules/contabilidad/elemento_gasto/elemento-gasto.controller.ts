import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ElementoGastoService } from './elemento-gasto.service';
import { CreateElementoGastoDto } from './dto/create-elemento-gasto.dto';
import { UpdateElementoGastoDto } from './dto/update-elemento-gasto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Elementos de Gasto')
@Controller('elemento-gasto')
export class ElementoGastoController {
  constructor(private readonly elementoGastoService: ElementoGastoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo elemento de gasto' })
  @ApiResponse({ status: 201, description: 'Elemento de gasto registrado' })
  @ApiResponse({ status: 400, description: 'Código duplicado' })
  create(@Body() createDto: CreateElementoGastoDto) {
    return this.elementoGastoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los elementos de gasto' })
  @ApiResponse({ status: 200, description: 'Lista de elementos de gasto' })
  findAll() {
    return this.elementoGastoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un elemento de gasto por ID' })
  @ApiParam({ name: 'id', description: 'ID del elemento de gasto' })
  @ApiResponse({ status: 200, description: 'Elemento de gasto encontrado' })
  @ApiResponse({ status: 404, description: 'Elemento de gasto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.elementoGastoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un elemento de gasto' })
  @ApiParam({ name: 'id', description: 'ID del elemento de gasto' })
  @ApiResponse({ status: 200, description: 'Elemento de gasto actualizado' })
  @ApiResponse({ status: 404, description: 'Elemento de gasto no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateElementoGastoDto) {
    return this.elementoGastoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un elemento de gasto' })
  @ApiParam({ name: 'id', description: 'ID del elemento de gasto' })
  @ApiResponse({ status: 200, description: 'Elemento de gasto eliminado' })
  @ApiResponse({ status: 404, description: 'Elemento de gasto no encontrado' })
  remove(@Param('id') id: string) {
    return this.elementoGastoService.remove(id);
  }
}
