import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompraService } from './compra.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Compra')
@Controller('compra')
export class CompraController {
  constructor(private readonly compraService: CompraService) { }

  @ApiOperation({ summary: 'Registrar una nueva compra' })
  @ApiResponse({ status: 201, description: 'Compra registrada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async create(@Body() createCompraDto: CreateCompraDto) {
    return await this.compraService.create(createCompraDto);
  }

  @ApiOperation({ summary: 'Obtener todos las compras' })
  @ApiResponse({ status: 201, description: 'Compras obtenidas con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  async findAll() {
    return await this.compraService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una compra' })
  @ApiResponse({ status: 201, description: 'Compra obtenida con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.compraService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una compra' })
  @ApiResponse({ status: 201, description: 'Compra modificada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCompraDto: UpdateCompraDto) {
    return await this.compraService.update(id, updateCompraDto);
  }

  @ApiOperation({ summary: 'Eliminar una compra' })
  @ApiResponse({ status: 201, description: 'Compra eliminada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.compraService.remove(id);
  }
}
