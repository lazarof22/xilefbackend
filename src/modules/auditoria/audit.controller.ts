/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

interface AuditQueryParams {
  entidad?: string;
  usuarioId?: string;
  accion?: string;
  modulo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  limit?: string;
}

@ApiTags('Auditoria')
@Controller('auditoria')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar registros de auditoría con filtros' })
  @ApiQuery({ name: 'entidad', required: false })
  @ApiQuery({ name: 'usuarioId', required: false })
  @ApiQuery({ name: 'accion', required: false })
  @ApiQuery({ name: 'modulo', required: false })
  @ApiQuery({ name: 'fechaDesde', required: false })
  @ApiQuery({ name: 'fechaHasta', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: AuditQueryParams) {
    return this.auditService.findAll({
      entidad: query.entidad,
      usuarioId: query.usuarioId,
      accion: query.accion as any,
      modulo: query.modulo as any,
      fechaDesde: query.fechaDesde ? new Date(query.fechaDesde) : undefined,
      fechaHasta: query.fechaHasta ? new Date(query.fechaHasta) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });
  }

  @Get('entidad/:entidad')
  @ApiOperation({ summary: 'Auditoría por entidad' })
  findByEntidad(
    @Param('entidad') entidad: string,
    @Query('entidadId') entidadId?: string,
  ) {
    return this.auditService.findByEntidad(entidad, entidadId);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de auditoría por módulo' })
  @ApiQuery({ name: 'fechaDesde', required: false })
  @ApiQuery({ name: 'fechaHasta', required: false })
  resumen(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.auditService.resumenPorModulo(
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de un registro de auditoría' })
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
