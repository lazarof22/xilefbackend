import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenService } from './almacen.service';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Almacen')
@Controller('almacen')
export class AlmacenController {
    constructor(private readonly almacenService: AlmacenService) { }

    @ApiOperation({ summary: 'Registrar un nuevo almacén' })
    @ApiResponse({ status: 201, description: 'Almacén registrado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post()
    create(@Body() createAlmacenDto: CreateAlmacenDto) {
        return this.almacenService.create(createAlmacenDto);
    }

    @ApiOperation({ summary: 'Obtener todos los almacenes' })
    @ApiResponse({ status: 201, description: 'Almacenes obtenidos con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get()
    findAll() {
        return this.almacenService.findAll();
    }

    @ApiOperation({ summary: 'Obtener un almacén' })
    @ApiResponse({ status: 201, description: 'Almacén obtenido con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.almacenService.findOne(id);
    }

    @ApiOperation({ summary: 'Modificar un almacén' })
    @ApiResponse({ status: 201, description: 'Almacén modificado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAlmacenDto: UpdateAlmacenDto) {
        return this.almacenService.update(id, updateAlmacenDto);
    }

    @ApiOperation({ summary: 'Eliminar un almacén' })
    @ApiResponse({ status: 201, description: 'Almacén eliminado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.almacenService.remove(id);
    }
}