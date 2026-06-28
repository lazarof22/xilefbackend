import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransferenciaService } from './transferencia.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { UpdateTransferenciaDto } from './dto/update-transferencia.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Transferencia')
@Controller('transferencia')
export class TransferenciaController {
    constructor(private readonly transferenciaService: TransferenciaService) { }

    @ApiOperation({ summary: 'Registrar una nueva transferencia' })
    @ApiResponse({ status: 201, description: 'Transferencia registrada con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post()
    create(@Body() createTransferenciaDto: CreateTransferenciaDto) {
        return this.transferenciaService.create(createTransferenciaDto);
    }

    @ApiOperation({ summary: 'Obtener todas las transferencias' })
    @ApiResponse({ status: 201, description: 'Transferencias obtenidas con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get()
    findAll() {
        return this.transferenciaService.findAll();
    }

    @ApiOperation({ summary: 'Obtener una transferencia' })
    @ApiResponse({ status: 201, description: 'Transferencia obtenida con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transferenciaService.findOne(id);
    }

    @ApiOperation({ summary: 'Modificar una transferencia' })
    @ApiResponse({ status: 201, description: 'Transferencia modificada con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTransferenciaDto: UpdateTransferenciaDto) {
        return this.transferenciaService.update(id, updateTransferenciaDto);
    }

    @ApiOperation({ summary: 'Eliminar una transferencia' })
    @ApiResponse({ status: 201, description: 'Transferencia eliminada con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.transferenciaService.remove(id);
    }
}
