import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivoFijoService } from './activo_fijo.service';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Activo Fijo')
@Controller('activofijo')
export class ActivoFijoController {
  constructor(private readonly activoFijoService: ActivoFijoService) {}

  @Post()
  async create(@Body() createActivoFijoDto: CreateActivoFijoDto) {
    return await this.activoFijoService.create(createActivoFijoDto);
  }

  @Get()
  async findAll() {
    return await this.activoFijoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.activoFijoService.findOne(id);
  }

  // ─── DEPRECIACIÓN ANUAL ─────────────────────────────
  @Get(':id/depreciacion/anual')
  async calcularDepreciacionAnual(@Param('id') id: string) {
    const activo = await this.activoFijoService.findOne(id);

    const depreciacionAnual = this.activoFijoService.calcularDepreciacionLineaRecta(
      activo.valor,
      activo.valorResidual,
      activo.vidaUtil,
    );

    return {
      activo: activo.codigoActivo,
      descripcion: activo.descripcionActivo,
      costoAdquisicion: activo.valor,
      valorResidual: activo.valorResidual,
      vidaUtilAnios: activo.vidaUtil,
      depreciacionAnual,
    };
  }

  // ─── DEPRECIACIÓN MENSUAL / ACUMULADA ──────────────
  @Get(':id/depreciacion/mensual')
  async calcularDepreciacionMensual(@Param('id') id: string) {
    const activo = await this.activoFijoService.findOne(id);

    const resultado = this.activoFijoService.calcularDepreciacionAcumuladaMensual(
      activo.valor,
      activo.valorResidual,
      activo.vidaUtil,
      activo.fechaCompra,
    );

    return {
      activo: activo.codigoActivo,
      descripcion: activo.descripcionActivo,
      costoAdquisicion: activo.valor,
      valorResidual: activo.valorResidual,
      vidaUtilAnios: activo.vidaUtil,
      fechaCompra: activo.fechaCompra,
      ...resultado,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActivoFijoDto: UpdateActivoFijoDto,
  ) {
    return await this.activoFijoService.update(id, updateActivoFijoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.activoFijoService.remove(id);
  }
}