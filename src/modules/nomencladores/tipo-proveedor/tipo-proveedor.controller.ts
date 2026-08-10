import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipoProveedorService } from './tipo-proveedor.service';
import { CreateTipoProveedorDto } from './dto/create-tipo-proveedor.dto';
import { UpdateTipoProveedorDto } from './dto/update-tipo-proveedor.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('TipoProveedor')
@Controller('tipo-proveedor')
export class TipoProveedorController {
  constructor(private readonly tipoProveedorService: TipoProveedorService) {}

  @ApiOperation({ summary: 'Registrar un nuevo tipo de proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de proveedor registrado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createTipoProveedorDto: CreateTipoProveedorDto) {
    return this.tipoProveedorService.create(createTipoProveedorDto);
  }

  @ApiOperation({ summary: 'Obtener todos los tipos de proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Tipos de proveedor obtenidos con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.tipoProveedorService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un tipo de proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de proveedor obtenido con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoProveedorService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un tipo de proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de proveedor modificado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoProveedorDto: UpdateTipoProveedorDto,
  ) {
    return this.tipoProveedorService.update(id, updateTipoProveedorDto);
  }

  @ApiOperation({ summary: 'Eliminar un tipo de proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de proveedor eliminado con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoProveedorService.remove(id);
  }
}
