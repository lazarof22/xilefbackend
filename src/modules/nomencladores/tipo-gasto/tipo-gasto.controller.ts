import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipoGastoService } from './tipo-gasto.service';
import { CreateTipoGastoDto } from './dto/create-tipo-gasto.dto';
import { UpdateTipoGastoDto } from './dto/update-tipo-gasto.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('TipoGasto')
@Controller('tipo-gasto')
export class TipoGastoController {
  constructor(private readonly tipoGastoService: TipoGastoService) {}

  @ApiOperation({ summary: 'Registrar un nuevo tipo de gasto' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de gasto registrado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createTipoGastoDto: CreateTipoGastoDto) {
    return this.tipoGastoService.create(createTipoGastoDto);
  }

  @ApiOperation({ summary: 'Obtener todos los tipos de gasto' })
  @ApiResponse({
    status: 201,
    description: 'Tipos de gasto obtenidos con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.tipoGastoService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un tipo de gasto' })
  @ApiResponse({ status: 201, description: 'Tipo de gasto obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoGastoService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un tipo de gasto' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de gasto modificado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoGastoDto: UpdateTipoGastoDto,
  ) {
    return this.tipoGastoService.update(id, updateTipoGastoDto);
  }

  @ApiOperation({ summary: 'Eliminar un tipo de gasto' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de gasto eliminado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoGastoService.remove(id);
  }
}
