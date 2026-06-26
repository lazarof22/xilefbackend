import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ActivoFijoService } from './activo_fijo.service';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';
import { BajaActivoDto } from './dto/baja-activo.dto';
import { RevaluacionActivoDto } from './dto/revaluacion-activo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ActivoFijoExport,
  ActivosPorEstadoItem,
  CreateActivoResult,
  DeleteResponse,
  DepreciacionAnualResponse,
  DepreciacionMensualResponse,
  DepreciacionScheduleItem,
  Estadisticas,
  RecalcularMasivoResponse,
  ResumenEconomico,
} from './types/activo_fijo.types';

@ApiTags('Activos Fijos')
@Controller('activofijo')
export class ActivoFijoController {
  constructor(private readonly activoFijoService: ActivoFijoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo activo fijo' })
  @ApiResponse({
    status: 201,
    description: 'Activo fijo registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createActivoFijoDto: CreateActivoFijoDto): Promise<CreateActivoResult> {
    return this.activoFijoService.create(createActivoFijoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los activos fijos' })
  @ApiResponse({ status: 200, description: 'Lista de activos fijos' })
  findAll(): Promise<ActivoFijoExport[]> {
    return this.activoFijoService.findAll() as Promise<ActivoFijoExport[]>;
  }

  @Get('activos')
  @ApiOperation({ summary: 'Obtener solo activos vigentes' })
  findActivos(): Promise<ActivoFijoExport[]> {
    return this.activoFijoService.findActivos() as Promise<ActivoFijoExport[]>;
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de activos fijos' })
  getEstadisticas(): Promise<Estadisticas> {
    return this.activoFijoService.getEstadisticas();
  }

  @Get('depreciacion/schedule')
  @ApiOperation({
    summary: 'Obtener calendario de depreciación de todos los activos',
  })
  getDepreciacionSchedule(): Promise<DepreciacionScheduleItem[]> {
    return this.activoFijoService.getDepreciacionSchedule();
  }

  @Get('area/:areaId')
  @ApiOperation({ summary: 'Obtener activos por área' })
  findByArea(@Param('areaId') areaId: string): Promise<ActivoFijoExport[]> {
    return this.activoFijoService.findByArea(areaId) as Promise<ActivoFijoExport[]>;
  }

  @Get('estado/:estadoId')
  @ApiOperation({ summary: 'Obtener activos por estado' })
  findByEstado(@Param('estadoId') estadoId: string): Promise<ActivoFijoExport[]> {
    return this.activoFijoService.findByEstado(estadoId) as Promise<ActivoFijoExport[]>;
  }

  @Post(':id/baja')
  @ApiOperation({ summary: 'Registrar baja de un activo fijo' })
  registrarBaja(
    @Param('id') id: string,
    @Body() bajaDto: BajaActivoDto,
  ): Promise<ActivoFijoExport> {
    return this.activoFijoService.registrarBaja(id, bajaDto) as Promise<ActivoFijoExport>;
  }

  @Post(':id/revaluacion')
  @ApiOperation({ summary: 'Registrar revaluación de un activo fijo (Res. 83/2012 mod. Res. 128/2025)' })
  registrarRevaluacion(
    @Param('id') id: string,
    @Body() revaluacionDto: RevaluacionActivoDto,
  ): Promise<ActivoFijoExport> {
    return this.activoFijoService.registrarRevaluacion(id, revaluacionDto) as Promise<ActivoFijoExport>;
  }

  @Get('reportes/estado')
  @ApiOperation({ summary: 'Reporte de activos agrupados por estado' })
  getActivosPorEstado(): Promise<ActivosPorEstadoItem[]> {
    return this.activoFijoService.getActivosPorEstado();
  }

  @Get('reportes/resumen-economico')
  @ApiOperation({ summary: 'Resumen económico de activos fijos (para el económico)' })
  getResumenEconomico(): Promise<ResumenEconomico> {
    return this.activoFijoService.getResumenEconomico();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un activo fijo por ID' })
  findOne(@Param('id') id: string): Promise<ActivoFijoExport> {
    return this.activoFijoService.findOne(id) as Promise<ActivoFijoExport>;
  }

  @Get(':id/depreciacion/anual')
  @ApiOperation({ summary: 'Calcular depreciación anual de un activo' })
  async calcularDepreciacionAnual(@Param('id') id: string): Promise<DepreciacionAnualResponse> {
    const activo = await this.activoFijoService.findOne(id);
    const depreciacionAnual =
      this.activoFijoService.calcularDepreciacionLineaRecta(
        activo.valorAdquisicion,
        activo.valorResidual,
        activo.vidaUtil,
      );
    return {
      activo: activo.codigoActivo,
      descripcion: activo.descripcionActivo,
      costoAdquisicion: activo.valorAdquisicion,
      valorResidual: activo.valorResidual,
      vidaUtilAnios: activo.vidaUtil,
      depreciacionAnual,
    };
  }

  @Get(':id/depreciacion/mensual')
  @ApiOperation({
    summary: 'Calcular depreciación mensual y acumulada de un activo',
  })
  async calcularDepreciacionMensual(@Param('id') id: string): Promise<DepreciacionMensualResponse> {
    const activo = await this.activoFijoService.findOne(id);
    const resultado =
      this.activoFijoService.calcularDepreciacionAcumuladaMensual(
        activo.valorAdquisicion,
        activo.valorResidual,
        activo.vidaUtil,
        activo.fechaCompra,
      );
    return {
      activo: activo.codigoActivo,
      descripcion: activo.descripcionActivo,
      costoAdquisicion: activo.valorAdquisicion,
      valorResidual: activo.valorResidual,
      vidaUtilAnios: activo.vidaUtil,
      fechaCompra: activo.fechaCompra,
      ...resultado,
    };
  }

  @Post(':id/recalcular-depreciacion')
  @ApiOperation({ summary: 'Recalcular depreciación de un activo' })
  recalcularDepreciacion(@Param('id') id: string): Promise<ActivoFijoExport> {
    return this.activoFijoService.recalcularDepreciacion(id) as Promise<ActivoFijoExport>;
  }

  @Post('recalcular-depreciacion-masiva')
  @ApiOperation({
    summary: 'Recalcular depreciación de todos los activos activos',
  })
  recalcularDepreciacionMasiva(): Promise<RecalcularMasivoResponse> {
    return this.activoFijoService.recalcularDepreciacionMasiva();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un activo fijo' })
  update(
    @Param('id') id: string,
    @Body() updateActivoFijoDto: UpdateActivoFijoDto,
  ): Promise<ActivoFijoExport> {
    return this.activoFijoService.update(id, updateActivoFijoDto) as Promise<ActivoFijoExport>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un activo fijo' })
  remove(@Param('id') id: string): Promise<DeleteResponse> {
    return this.activoFijoService.remove(id);
  }
}
