import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContenedorService } from './contenedor.service';
import { CreateContenedorDto } from './dto/create-contenedor.dto';
import { UpdateContenedorDto } from './dto/update-contenedor.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Contenedor')
@Controller('contenedor')
export class ContenedorController {
    constructor(private readonly contenedorService: ContenedorService) { }

    @ApiOperation({ summary: 'Registrar un nuevo contenedor' })
    @ApiResponse({ status: 201, description: 'Contenedor registrado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post()
    create(@Body() createContenedorDto: CreateContenedorDto) {
        return this.contenedorService.create(createContenedorDto);
    }

    @ApiOperation({ summary: 'Obtener todos los contenedores' })
    @ApiResponse({ status: 201, description: 'Contenedores obtenidos con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get()
    findAll() {
        return this.contenedorService.findAll();
    }

    @ApiOperation({ summary: 'Obtener un contenedor' })
    @ApiResponse({ status: 201, description: 'Contenedor obtenido con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contenedorService.findOne(id);
    }

    @ApiOperation({ summary: 'Modificar un contenedor' })
    @ApiResponse({ status: 201, description: 'Contenedor modificado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateContenedorDto: UpdateContenedorDto) {
        return this.contenedorService.update(id, updateContenedorDto);
    }

    @ApiOperation({ summary: 'Eliminar un contenedor' })
    @ApiResponse({ status: 201, description: 'Contenedor eliminado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contenedorService.remove(id);
    }
}