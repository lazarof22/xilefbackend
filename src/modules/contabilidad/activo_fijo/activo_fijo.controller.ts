import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivoFijoService } from './activo_fijo.service';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';

@Controller('activo-fijo')
export class ActivoFijoController {
  constructor(private readonly activoFijoService: ActivoFijoService) {}

  @Post()
  create(@Body() createActivoFijoDto: CreateActivoFijoDto) {
    return this.activoFijoService.create(createActivoFijoDto);
  }

  @Get()
  findAll() {
    return this.activoFijoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activoFijoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivoFijoDto: UpdateActivoFijoDto) {
    return this.activoFijoService.update(+id, updateActivoFijoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activoFijoService.remove(+id);
  }
}
