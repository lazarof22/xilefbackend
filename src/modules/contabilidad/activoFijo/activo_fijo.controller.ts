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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
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
  @ApiResponse({ status: 200, description: 'Lista de activos vigentes' })
  findActivos(): Promise<ActivoFijoExport[]> {
    return this.activoFijoService.findActivos() as Promise<ActivoFijoExport[]>;
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de activos fijos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getEstadisticas(): Promise<Estadisticas> {
    return this.activoFijoService.getEstadisticas();
  }

  @Get('depreciacion/schedule')
  @ApiOperation({
    summary: 'Obtener calendario de depreciación de todos los activos',
  })
  @ApiResponse({ status: 200, description: 'Calendario de depreciación' })
  getDepreciacionSchedule(): Promise<DepreciacionScheduleItem[]> {
    return this.activoFijoService.getDepreciacionSchedule();
  }

  @Get('area/:areaId')
  @ApiOperation({ summary: 'Obtener activos por área' })
  @ApiParam({ name: 'areaId', description: 'ID del área' })
  @ApiResponse({ status: 200, description: 'Activos filtrados por área' })
  @ApiResponse({ status: 404, description: 'Área no válida' })
  findByArea(@Param('areaId') areaId: string): Promise<ActivoFijoExport[]> {
    return this.activoFijoService.findByArea(areaId) as Promise<ActivoFijoExport[]>;
  }

  @Get('estado/:estadoId')
  @ApiOperation({ summary: 'Obtener activos por estado' })
  @ApiParam({ name: 'estadoId', description: 'ID del estado' })
  @ApiResponse({ status: 200, description: 'Activos filtrados por estado' })
  @ApiResponse({ status: 404, description: 'Estado no válido' })
  findByEstado(@Param('estadoId') estadoId: string): Promise<ActivoFijoExport[]> {
    return this.activoFijoService.findByEstado(estadoId) as Promise<ActivoFijoExport[]>;
  }

  @Post(':id/baja')
  @ApiOperation({ summary: 'Registrar baja de un activo fijo' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Baja registrada exitosamente' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  registrarBaja(
    @Param('id') id: string,
    @Body() bajaDto: BajaActivoDto,
  ): Promise<ActivoFijoExport> {
    return this.activoFijoService.registrarBaja(id, bajaDto) as Promise<ActivoFijoExport>;
  }

  @Post(':id/revaluacion')
  @ApiOperation({ summary: 'Registrar revaluación de un activo fijo (Res. 83/2012 mod. Res. 128/2025)' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Revaluación registrada exitosamente' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  registrarRevaluacion(
    @Param('id') id: string,
    @Body() revaluacionDto: RevaluacionActivoDto,
  ): Promise<ActivoFijoExport> {
    return this.activoFijoService.registrarRevaluacion(id, revaluacionDto) as Promise<ActivoFijoExport>;
  }

  @Get('reportes/estado')
  @ApiOperation({ summary: 'Reporte de activos agrupados por estado' })
  @ApiResponse({ status: 200, description: 'Reporte por estado obtenido' })
  getActivosPorEstado(): Promise<ActivosPorEstadoItem[]> {
    return this.activoFijoService.getActivosPorEstado();
  }

  @Get('reportes/resumen-economico')
  @ApiOperation({ summary: 'Resumen económico de activos fijos (para el económico)' })
  @ApiResponse({ status: 200, description: 'Resumen económico obtenido' })
  getResumenEconomico(): Promise<ResumenEconomico> {
    return this.activoFijoService.getResumenEconomico();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un activo fijo por ID' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Activo fijo encontrado' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  findOne(@Param('id') id: string): Promise<ActivoFijoExport> {
    return this.activoFijoService.findOne(id) as Promise<ActivoFijoExport>;
  }

  @Get(':id/depreciacion/anual')
  @ApiOperation({ summary: 'Calcular depreciación anual de un activo' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Depreciación anual calculada' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
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
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Depreciación mensual y acumulada calculada' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
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
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Depreciación recalculada' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  recalcularDepreciacion(@Param('id') id: string): Promise<ActivoFijoExport> {
    return this.activoFijoService.recalcularDepreciacion(id) as Promise<ActivoFijoExport>;
  }

  @Post('recalcular-depreciacion-masiva')
  @ApiOperation({
    summary: 'Recalcular depreciación de todos los activos activos',
  })
  @ApiResponse({ status: 200, description: 'Depreciación recalculada masivamente' })
  recalcularDepreciacionMasiva(): Promise<RecalcularMasivoResponse> {
    return this.activoFijoService.recalcularDepreciacionMasiva();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un activo fijo' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Activo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateActivoFijoDto: UpdateActivoFijoDto,
  ): Promise<ActivoFijoExport> {
    return this.activoFijoService.update(id, updateActivoFijoDto) as Promise<ActivoFijoExport>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un activo fijo' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Activo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  remove(@Param('id') id: string): Promise<DeleteResponse> {
    return this.activoFijoService.remove(id);
  }
}
