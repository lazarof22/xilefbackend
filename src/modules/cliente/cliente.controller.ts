import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationClienteDto } from './dto/pagination-cliente.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';


@ApiTags('Cliente')
@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) { }


  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({ status: 201, description: 'Clientes obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationClienteDto) {
    return this.clienteService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Obtener un cliente' })
  @ApiResponse({ status: 201, description: 'Cliente obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un cliente' })
  @ApiResponse({ status: 201, description: 'Cliente modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(id, UpdateClienteDto);
  }

  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 201, description: 'Cliente eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteService.remove(id);
  }
}
