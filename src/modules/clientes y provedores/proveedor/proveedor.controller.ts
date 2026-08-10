import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EstadoProveedor } from './types/proveedor.types';
@ApiTags('Proveedor')
@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @ApiOperation({ summary: 'Registrar un nuevo proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Proveedores obtenidos con exito' })
  @Get()
  findAll() {
    return this.proveedorService.findAll();
  }

  @ApiOperation({ summary: 'Obtener proveedor por categoria' })
  @ApiResponse({
    status: 200,
    description: 'Proveedores obtenidos con exito',
  })
  @Get('categoria/:categoriaId')
  findByCategoria(@Param('categoriaId') categoriaId: string) {
    return this.proveedorService.findByCategoria(categoriaId);
  }

  @ApiOperation({ summary: 'Obtener proveedores por estado' })
  @ApiResponse({
    status: 200,
    description: 'Proveedores obtenidos con exito',
  })
  @Get('estado/:estado')
  findByEstado(@Param('estado') estado: EstadoProveedor) {
    return this.proveedorService.findByEstado(estado);
  }

  @ApiOperation({ summary: 'Obtener proveedores por tipo' })
  @ApiResponse({
    status: 200,
    description: 'Proveedores obtenidos con exito',
  })
  @Get('tipo/:tipoId')
  findByTipo(@Param('tipoId') tipoId: string) {
    return this.proveedorService.findByTipo(tipoId);
  }

  @ApiOperation({ summary: 'Obtener un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedorService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @ApiOperation({ summary: 'Calificar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor calificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id/calificar')
  calificar(
    @Param('id') id: string,
    @Body('calificacion') calificacion: number,
  ) {
    return this.proveedorService.calificar(id, calificacion);
  }

  @ApiOperation({ summary: 'Eliminar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedorService.remove(id);
  }
}
