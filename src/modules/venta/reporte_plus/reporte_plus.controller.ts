import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportePlusService } from './reporte_plus.service';
import { CreateReportePlusDto } from './dto/create-reporte_plus.dto';
import { UpdateReportePlusDto } from './dto/update-reporte_plus.dto';

@Controller('reporte-plus')
export class ReportePlusController {
  constructor(private readonly reportePlusService: ReportePlusService) {}

  @Post()
  create(@Body() createReportePlusDto: CreateReportePlusDto) {
    return this.reportePlusService.create(createReportePlusDto);
  }

  @Get()
  findAll() {
    return this.reportePlusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportePlusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportePlusDto: UpdateReportePlusDto) {
    return this.reportePlusService.update(+id, updateReportePlusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportePlusService.remove(+id);
  }
}
