import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipoContratoService } from './tipo-contrato.service';
import { CreateTipoContratoDto } from './dto/create-tipo-contrato.dto';
import { UpdateTipoContratoDto } from './dto/update-tipo-contrato.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('TipoContrato')
@Controller('tipo-contrato')
export class TipoContratoController {
  constructor(private readonly tipoContratoService: TipoContratoService) {}

  @ApiOperation({ summary: 'Registrar un nuevo tipo de contrato' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de contrato registrado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createTipoContratoDto: CreateTipoContratoDto) {
    return this.tipoContratoService.create(createTipoContratoDto);
  }

  @ApiOperation({ summary: 'Obtener todos los tipos de contrato' })
  @ApiResponse({
    status: 201,
    description: 'Tipos de contrato obtenidos con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.tipoContratoService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un tipo de contrato' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de contrato obtenido con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoContratoService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un tipo de contrato' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de contrato modificado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoContratoDto: UpdateTipoContratoDto,
  ) {
    return this.tipoContratoService.update(id, updateTipoContratoDto);
  }

  @ApiOperation({ summary: 'Eliminar un tipo de contrato' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de contrato eliminado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoContratoService.remove(id);
  }
}
