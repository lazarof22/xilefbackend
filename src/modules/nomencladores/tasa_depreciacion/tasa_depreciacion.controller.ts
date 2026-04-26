import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasaDepreciacionService } from './tasa_depreciacion.service';
import { CreateTasaDepreciacionDto } from './dto/create-tasa_depreciacion.dto';
import { UpdateTasaDepreciacionDto } from './dto/update-tasa_depreciacion.dto';

@Controller('tasa-depreciacion')
export class TasaDepreciacionController {
  constructor(private readonly tasaDepreciacionService: TasaDepreciacionService) {}

  @Post()
  create(@Body() createTasaDepreciacionDto: CreateTasaDepreciacionDto) {
    return this.tasaDepreciacionService.create(createTasaDepreciacionDto);
  }

  @Get()
  findAll() {
    return this.tasaDepreciacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasaDepreciacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTasaDepreciacionDto: UpdateTasaDepreciacionDto) {
    return this.tasaDepreciacionService.update(+id, updateTasaDepreciacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasaDepreciacionService.remove(+id);
  }
}
