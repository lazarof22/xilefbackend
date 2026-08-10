import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UnidadMedidaService } from './unidad-medida.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('UnidadMedida')
@Controller('unidad-medida')
export class UnidadMedidaController {
  constructor(private readonly unidadMedidaService: UnidadMedidaService) {}

  @ApiOperation({ summary: 'Registrar una nueva unidad de medida' })
  @ApiResponse({
    status: 201,
    description: 'Unidad de medida registrada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto) {
    return this.unidadMedidaService.create(createUnidadMedidaDto);
  }

  @ApiOperation({ summary: 'Obtener todas las unidades de medida' })
  @ApiResponse({
    status: 201,
    description: 'Unidades de medida obtenidas con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.unidadMedidaService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una unidad de medida' })
  @ApiResponse({
    status: 201,
    description: 'Unidad de medida obtenida con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unidadMedidaService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una unidad de medida' })
  @ApiResponse({
    status: 201,
    description: 'Unidad de medida modificada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ) {
    return this.unidadMedidaService.update(id, updateUnidadMedidaDto);
  }

  @ApiOperation({ summary: 'Eliminar una unidad de medida' })
  @ApiResponse({
    status: 201,
    description: 'Unidad de medida eliminada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unidadMedidaService.remove(id);
  }
}
