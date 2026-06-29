import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CuadreCajaService } from './cuadre_caja.service';
import { CreateCuadreCajaDto } from './dto/create-cuadre_caja.dto';
import { UpdateCuadreCajaDto } from './dto/update-cuadre_caja.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Cuadre Caja')
@Controller('cuadre-caja')
export class CuadreCajaController {
    constructor(private readonly cuadreCajaService: CuadreCajaService) { }

    @ApiOperation({ summary: 'Registrar un nuevo cuadre de caja' })
    @ApiResponse({ status: 201, description: 'Cuadre de caja registrado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post()
    create(@Body() createCuadreCajaDto: CreateCuadreCajaDto) {
        return this.cuadreCajaService.create(createCuadreCajaDto);
    }

    @ApiOperation({ summary: 'Obtener todos los cuadres de caja' })
    @ApiResponse({ status: 201, description: 'Cuadres obtenidos con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get()
    findAll() {
        return this.cuadreCajaService.findAll();
    }

    @ApiOperation({ summary: 'Obtener resumen diario de ventas para precargar el cuadre' })
    @ApiResponse({ status: 200, description: 'Resumen obtenido con exito' })
    @ApiQuery({ name: 'fecha', required: false, description: 'Fecha en formato YYYY-MM-DD (por defecto hoy)' })
    @Get('resumen-diario')
    getResumenDiario(@Query('fecha') fecha?: string) {
        return this.cuadreCajaService.getResumenDiario(fecha);
    }

    @ApiOperation({ summary: 'Obtener un cuadre de caja' })
    @ApiResponse({ status: 201, description: 'Cuadre obtenido con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cuadreCajaService.findOne(id);
    }

    @ApiOperation({ summary: 'Modificar un cuadre de caja' })
    @ApiResponse({ status: 201, description: 'Cuadre modificado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCuadreCajaDto: UpdateCuadreCajaDto) {
        return this.cuadreCajaService.update(id, updateCuadreCajaDto);
    }

    @ApiOperation({ summary: 'Eliminar un cuadre de caja' })
    @ApiResponse({ status: 201, description: 'Cuadre eliminado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cuadreCajaService.remove(id);
    }
}
