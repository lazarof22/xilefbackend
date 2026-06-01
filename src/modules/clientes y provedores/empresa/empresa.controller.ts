import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Empresa')
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) { }

  @ApiOperation({ summary: 'Registrar una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa registrada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresaService.create(createEmpresaDto);
  }

  @ApiOperation({ summary: 'Obtener todas las empresas' })
  @ApiResponse({ status: 201, description: 'Empresas obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.empresaService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una empresa' })
  @ApiResponse({ status: 201, description: 'Empresa obtenida con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresaService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una empresa' })
  @ApiResponse({ status: 201, description: 'Empresa modificada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  @ApiOperation({ summary: 'Eliminar una empresa' })
  @ApiResponse({ status: 201, description: 'Empresa eliminada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresaService.remove(id);
  }
}
