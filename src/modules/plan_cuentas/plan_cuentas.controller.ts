import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanCuentasService } from './plan_cuentas.service';
import { CreatePlanCuentaDto } from './dto/create-plan_cuenta.dto';
import { UpdatePlanCuentaDto } from './dto/update-plan_cuenta.dto';

@Controller('plan-cuentas')
export class PlanCuentasController {
  constructor(private readonly planCuentasService: PlanCuentasService) {}

  @Post()
  create(@Body() createPlanCuentaDto: CreatePlanCuentaDto) {
    return this.planCuentasService.create(createPlanCuentaDto);
  }

  @Get()
  findAll() {
    return this.planCuentasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planCuentasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanCuentaDto: UpdatePlanCuentaDto) {
    return this.planCuentasService.update(+id, updatePlanCuentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planCuentasService.remove(+id);
  }
}
