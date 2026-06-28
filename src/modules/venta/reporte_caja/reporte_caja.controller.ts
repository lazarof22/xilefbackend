import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReporteCajaService } from './reporte_caja.service';
import { CreateReporteCajaDto } from './dto/create-reporte_caja.dto';
import { UpdateReporteCajaDto } from './dto/update-reporte_caja.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reporte Caja')
@Controller('reporte-caja')
export class ReporteCajaController {
    constructor(private readonly reporteCajaService: ReporteCajaService) { }

    @ApiOperation({ summary: 'Registrar un nuevo reporte de caja' })
    @ApiResponse({ status: 201, description: 'Reporte de caja registrado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post()
    create(@Body() createReporteCajaDto: CreateReporteCajaDto) {
        return this.reporteCajaService.create(createReporteCajaDto);
    }

    @ApiOperation({ summary: 'Obtener todos los reportes de caja' })
    @ApiResponse({ status: 201, description: 'Reportes obtenidos con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get()
    findAll() {
        return this.reporteCajaService.findAll();
    }

    @ApiOperation({ summary: 'Obtener un reporte de caja' })
    @ApiResponse({ status: 201, description: 'Reporte obtenido con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reporteCajaService.findOne(id);
    }

    @ApiOperation({ summary: 'Modificar un reporte de caja' })
    @ApiResponse({ status: 201, description: 'Reporte modificado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateReporteCajaDto: UpdateReporteCajaDto) {
        return this.reporteCajaService.update(id, updateReporteCajaDto);
    }

    @ApiOperation({ summary: 'Eliminar un reporte de caja' })
    @ApiResponse({ status: 201, description: 'Reporte eliminado con exito' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reporteCajaService.remove(id);
    }
}
