import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NaturalezaCuentaService } from './naturaleza-cuenta.service';
import { CreateNaturalezaCuentaDto } from './dto/create-naturaleza-cuenta.dto';
import { UpdateNaturalezaCuentaDto } from './dto/update-naturaleza-cuenta.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('NaturalezaCuenta')
@Controller('naturaleza-cuenta')
export class NaturalezaCuentaController {
  constructor(
    private readonly naturalezaCuentaService: NaturalezaCuentaService,
  ) {}

  @ApiOperation({ summary: 'Registrar una nueva naturaleza de cuenta' })
  @ApiResponse({
    status: 201,
    description: 'Naturaleza de cuenta registrada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createNaturalezaCuentaDto: CreateNaturalezaCuentaDto) {
    return this.naturalezaCuentaService.create(createNaturalezaCuentaDto);
  }

  @ApiOperation({ summary: 'Obtener todas las naturalezas de cuenta' })
  @ApiResponse({
    status: 201,
    description: 'Naturalezas de cuenta obtenidas con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.naturalezaCuentaService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una naturaleza de cuenta' })
  @ApiResponse({
    status: 201,
    description: 'Naturaleza de cuenta obtenida con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.naturalezaCuentaService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una naturaleza de cuenta' })
  @ApiResponse({
    status: 201,
    description: 'Naturaleza de cuenta modificada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNaturalezaCuentaDto: UpdateNaturalezaCuentaDto,
  ) {
    return this.naturalezaCuentaService.update(id, updateNaturalezaCuentaDto);
  }

  @ApiOperation({ summary: 'Eliminar una naturaleza de cuenta' })
  @ApiResponse({
    status: 201,
    description: 'Naturaleza de cuenta eliminada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.naturalezaCuentaService.remove(id);
  }
}
