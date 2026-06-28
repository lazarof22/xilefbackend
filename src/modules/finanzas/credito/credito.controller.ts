import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreditoService } from './credito.service';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Créditos Bancarios')
@Controller('credito')
export class CreditoController {
  constructor(private readonly creditoService: CreditoService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar crédito bancario (Res. 90/2024 BCC)' })
  @ApiResponse({ status: 201 }) create(@Body() createDto: CreateCreditoDto) { return this.creditoService.create(createDto); }

  @Get() @ApiOperation({ summary: 'Listar créditos' })
  findAll() { return this.creditoService.findAll(); }

  @Get('vencidos') @ApiOperation({ summary: 'Créditos vencidos' })
  getVencidos() { return this.creditoService.getVencidos(); }

  @Get('clasificacion-riesgo') @ApiOperation({ summary: 'Clasificación riesgo (Inst. 34/2006 BCC)' })
  getClasificacion() { return this.creditoService.getClasificacionRiesgo(); }

  @Get('resumen') @ApiOperation({ summary: 'Resumen de créditos' })
  getResumen() { return this.creditoService.getResumen(); }

  @Get(':id') @ApiOperation({ summary: 'Obtener crédito' }) @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) { return this.creditoService.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Actualizar crédito' }) @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCreditoDto) { return this.creditoService.update(id, updateDto); }

  @Delete(':id') @ApiOperation({ summary: 'Eliminar crédito' }) @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) { return this.creditoService.remove(id); }
}
