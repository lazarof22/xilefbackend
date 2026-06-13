import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaisService } from './pais.service';
import { CreatePaiDto } from './dto/create-pai.dto';
import { UpdatePaiDto } from './dto/update-pai.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Pais')
@Controller('pais')
export class PaisController {
  constructor(private readonly paisService: PaisService) { }

  @ApiOperation({ summary: 'Registrar un nuevo pais' })
  @ApiResponse({ status: 201, description: 'Pais registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createPaiDto: CreatePaiDto) {
    return this.paisService.create(createPaiDto);
  }

  @ApiOperation({ summary: 'Obtener todos los paises' })
  @ApiResponse({ status: 201, description: 'Paises obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.paisService.findAll();
  }

  @ApiOperation({ summary: 'Obtener todos los paises' })
  @ApiResponse({ status: 201, description: 'Paises obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paisService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un pais' })
  @ApiResponse({ status: 201, description: 'Pais modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaiDto: UpdatePaiDto) {
    return this.paisService.update(id, updatePaiDto);
  }

  @ApiOperation({ summary: 'Eliminar un pais' })
  @ApiResponse({ status: 201, description: 'Pais eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paisService.remove(id);
  }
}
