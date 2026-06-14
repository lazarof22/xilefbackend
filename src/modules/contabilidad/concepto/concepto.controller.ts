import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConceptoService } from './concepto.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: 201, description: 'Conceptos obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.conceptoService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un concepto' })
  @ApiResponse({ status: 201, description: 'Concepto obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptoService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un concepto' })
  @ApiResponse({ status: 201, description: 'Concepto modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConceptoDto: UpdateConceptoDto) {
    return this.conceptoService.update(id, updateConceptoDto);
  }

  @ApiOperation({ summary: 'Eliminar un concepto' })
  @ApiResponse({ status: 201, description: 'Concepto eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptoService.remove(id);
  }
}
