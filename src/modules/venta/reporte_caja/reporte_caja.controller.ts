import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReporteCajaService } from './reporte_caja.service';
import { CreateReporteCajaDto } from './dto/create-reporte_caja.dto';
import { UpdateReporteCajaDto } from './dto/update-reporte_caja.dto';

@Controller('reporte-caja')
export class ReporteCajaController {
  constructor(private readonly reporteCajaService: ReporteCajaService) {}

  @Post()
  create(@Body() createReporteCajaDto: CreateReporteCajaDto) {
    return this.reporteCajaService.create(createReporteCajaDto);
  }

  @Get()
  findAll() {
    return this.reporteCajaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reporteCajaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReporteCajaDto: UpdateReporteCajaDto) {
    return this.reporteCajaService.update(+id, updateReporteCajaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reporteCajaService.remove(+id);
  }
}
