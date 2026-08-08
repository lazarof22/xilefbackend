import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportePlusService } from './reporte_plus.service';
import { CreateReportePlusDto } from './dto/create-reporte_plus.dto';
import { UpdateReportePlusDto } from './dto/update-reporte_plus.dto';
import { ApiAcceptedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reporte Plus')
@Controller('reporte-plus')
export class ReportePlusController {
  constructor(private readonly reportePlusService: ReportePlusService) { }


  @ApiOperation({ summary: 'Obtener todos los reportes plus' })
  @ApiResponse({ status: 201, description: 'Reportes obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.reportePlusService.findAll();
  }


  @ApiOperation({ summary: 'Eliminar todos los reportes plus del día y agregarlos al kardex' })
  @ApiResponse({ status: 201, description: 'Reportes eliminados con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('consolidar/del-dia')
  consolidarDelDia() {
    return this.reportePlusService.consolidarDelDia();
  }
}
