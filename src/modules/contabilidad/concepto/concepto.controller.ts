import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConceptoService } from './concepto.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Concepto')
@Controller('concepto')
export class ConceptoController {
  constructor(private readonly conceptoService: ConceptoService) { }

  @ApiOperation({ summary: 'Registrar un nuevo concepto' })
  @ApiResponse({ status: 201, description: 'Concepto registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createConceptoDto: CreateConceptoDto) {
    return this.conceptoService.create(createConceptoDto);
  }

  @ApiOperation({ summary: 'Obtener todos los conceptos' })
  @ApiResponse({ status: 200, description: 'Conceptos obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.conceptoService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un concepto' })
  @ApiParam({ name: 'id', description: 'ID del concepto' })
  @ApiResponse({ status: 200, description: 'Concepto obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptoService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un concepto' })
  @ApiParam({ name: 'id', description: 'ID del concepto' })
  @ApiResponse({ status: 201, description: 'Concepto modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConceptoDto: UpdateConceptoDto) {
    return this.conceptoService.update(id, updateConceptoDto);
  }

  @ApiOperation({ summary: 'Eliminar un concepto' })
  @ApiParam({ name: 'id', description: 'ID del concepto' })
  @ApiResponse({ status: 201, description: 'Concepto eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptoService.remove(id);
  }
}
