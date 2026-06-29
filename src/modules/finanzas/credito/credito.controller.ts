import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreditoService } from './credito.service';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { GenerarAmortizacionDto } from './dto/generar-amortizacion.dto';
import { AbonarCuotaDto } from './dto/abonar-cuota.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Créditos Bancarios')
@Controller('credito')
export class CreditoController {
  constructor(private readonly creditoService: CreditoService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar crédito bancario (Res. 90/2024 BCC)' })
  @ApiResponse({ status: 201, description: 'Crédito solicitado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un crédito con ese código',
  })
  create(@Body() createDto: CreateCreditoDto) {
    return this.creditoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar créditos' })
  @ApiResponse({ status: 200, description: 'Lista de créditos' })
  findAll() {
    return this.creditoService.findAll();
  }

  @Get('vencidos')
  @ApiOperation({ summary: 'Créditos vencidos' })
  @ApiResponse({ status: 200, description: 'Créditos vencidos' })
  getVencidos() {
    return this.creditoService.getVencidos();
  }

  @Get('clasificacion-riesgo')
  @ApiOperation({ summary: 'Clasificación riesgo (Inst. 34/2006 BCC)' })
  @ApiResponse({
    status: 200,
    description: 'Clasificación de riesgo crediticio',
  })
  getClasificacion() {
    return this.creditoService.getClasificacionRiesgo();
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de créditos' })
  @ApiResponse({ status: 200, description: 'Resumen de créditos' })
  getResumen() {
    return this.creditoService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener crédito' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Crédito encontrado' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  findOne(@Param('id') id: string) {
    return this.creditoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar crédito' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Crédito actualizado' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCreditoDto) {
    return this.creditoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar crédito' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Crédito eliminado' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  remove(@Param('id') id: string) {
    return this.creditoService.remove(id);
  }

  // ─── Amortización ───────────────────────────────────────────────────────────

  @Post(':id/amortizacion/generar')
  @ApiOperation({ summary: 'Generar plan de amortización' })
  @ApiParam({ name: 'id', description: 'ID del crédito' })
  @ApiResponse({ status: 201, description: 'Plan de amortización generado' })
  @ApiResponse({ status: 400, description: 'Error al generar amortización' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  generarAmortizacion(
    @Param('id') id: string,
    @Body() dto: GenerarAmortizacionDto,
  ) {
    return this.creditoService.generarPlanAmortizacion(id, dto);
  }

  @Get(':id/amortizacion')
  @ApiOperation({ summary: 'Obtener plan de amortización' })
  @ApiParam({ name: 'id', description: 'ID del crédito' })
  @ApiResponse({ status: 200, description: 'Plan de amortización obtenido' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  getAmortizacion(@Param('id') id: string) {
    return this.creditoService.getPlanAmortizacion(id);
  }

  @Post(':id/amortizacion/regenerar')
  @ApiOperation({
    summary: 'Regenerar plan de amortización (elimina cuotas existentes)',
  })
  @ApiParam({ name: 'id', description: 'ID del crédito' })
  @ApiResponse({ status: 200, description: 'Plan de amortización regenerado' })
  @ApiResponse({ status: 400, description: 'Error al regenerar amortización' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  regenerarAmortizacion(
    @Param('id') id: string,
    @Body() dto: GenerarAmortizacionDto,
  ) {
    return this.creditoService.regenerarPlan(id, dto);
  }

  // ─── Abono ──────────────────────────────────────────────────────────────────

  @Post('cuotas/:cuotaId/abonar')
  @ApiOperation({ summary: 'Abonar a una cuota' })
  @ApiParam({ name: 'cuotaId', description: 'ID de la cuota' })
  @ApiResponse({ status: 200, description: 'Abono registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al registrar abono' })
  @ApiResponse({ status: 404, description: 'Cuota no encontrada' })
  abonarCuota(@Param('cuotaId') cuotaId: string, @Body() dto: AbonarCuotaDto) {
    return this.creditoService.abonarCuota(cuotaId, dto);
  }

  // ─── Transiciones de Estado ─────────────────────────────────────────────────

  @Post(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar crédito (solo desde solicitado)' })
  @ApiParam({ name: 'id', description: 'ID del crédito' })
  @ApiResponse({ status: 200, description: 'Crédito aprobado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede aprobar en estado actual',
  })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  aprobar(@Param('id') id: string) {
    return this.creditoService.aprobarCredito(id);
  }

  @Post(':id/desembolsar')
  @ApiOperation({
    summary: 'Desembolsar crédito y generar plan de amortización',
  })
  @ApiParam({ name: 'id', description: 'ID del crédito' })
  @ApiResponse({ status: 200, description: 'Crédito desembolsado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede desembolsar en estado actual',
  })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  desembolsar(@Param('id') id: string) {
    return this.creditoService.desembolsarCredito(id);
  }

  @Post(':id/castigar')
  @ApiOperation({ summary: 'Castigar crédito (solo en_pago o vencido)' })
  @ApiParam({ name: 'id', description: 'ID del crédito' })
  @ApiResponse({ status: 200, description: 'Crédito castigado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede castigar en estado actual',
  })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  castigar(@Param('id') id: string) {
    return this.creditoService.castigarCredito(id);
  }
}
