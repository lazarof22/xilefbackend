import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConciliacionService } from './conciliacion.service';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';
import { UpdateConciliacionDto } from './dto/update-conciliacion.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Conciliación Bancaria')
@Controller('conciliacion')
export class ConciliacionController {
  constructor(private readonly conciliacionService: ConciliacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear conciliación bancaria (Res. 40/2016 BCC)' })
  create(@Body() createDto: CreateConciliacionDto) { return this.conciliacionService.create(createDto); }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las conciliaciones' })
  findAll() { return this.conciliacionService.findAll(); }

  @Get('pendientes')
  @ApiOperation({ summary: 'Conciliaciones pendientes' })
  getPendientes() { return this.conciliacionService.getPendientes(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener conciliación por ID' })
  findOne(@Param('id') id: string) { return this.conciliacionService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar conciliación' })
  update(@Param('id') id: string, @Body() updateDto: UpdateConciliacionDto) {
    return this.conciliacionService.update(id, updateDto);
  }

  @Post(':id/procesar')
  @ApiOperation({ summary: 'Procesar conciliación (calcula diferencias)' })
  procesar(@Param('id') id: string) { return this.conciliacionService.procesar(id); }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar conciliación' })
  remove(@Param('id') id: string) { return this.conciliacionService.remove(id); }
}
