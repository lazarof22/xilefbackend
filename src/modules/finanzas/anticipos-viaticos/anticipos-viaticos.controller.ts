import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AnticiposViaticosService } from './anticipos-viaticos.service';
import { CreateAnticipoDto } from './dto/create-anticipo.dto';
import { UpdateAnticipoDto } from './dto/update-anticipo.dto';
import { CreateLiquidacionViaticoDto } from './dto/create-liquidacion-viatico.dto';
import { RechazarLiquidacionDto } from './dto/rechazar-liquidacion.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Anticipos y Viáticos')
@Controller('anticipos-viaticos')
export class AnticiposViaticosController {
  constructor(
    private readonly anticiposViaticosService: AnticiposViaticosService,
  ) {}

  @Post('anticipo')
  @ApiOperation({ summary: 'Crear un nuevo anticipo' })
  @ApiResponse({ status: 201, description: 'Anticipo creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un anticipo con ese código',
  })
  createAnticipo(@Body() createDto: CreateAnticipoDto) {
    return this.anticiposViaticosService.createAnticipo(createDto);
  }

  @Get('anticipos')
  @ApiOperation({ summary: 'Obtener todos los anticipos' })
  @ApiResponse({ status: 200, description: 'Lista de anticipos' })
  findAllAnticipos() {
    return this.anticiposViaticosService.findAllAnticipos();
  }

  @Get('anticipos/pendientes')
  @ApiOperation({ summary: 'Obtener anticipos pendientes de liquidar' })
  @ApiResponse({ status: 200, description: 'Lista de anticipos pendientes' })
  getAnticiposPendientes() {
    return this.anticiposViaticosService.getAnticiposPendientes();
  }

  @Get('beneficiario/:empleadoId')
  @ApiOperation({ summary: 'Obtener anticipos por beneficiario' })
  @ApiParam({ name: 'empleadoId', description: 'ID del empleado' })
  @ApiResponse({ status: 200, description: 'Anticipos del empleado' })
  getPorBeneficiario(@Param('empleadoId') empleadoId: string) {
    return this.anticiposViaticosService.getPorBeneficiario(empleadoId);
  }

  @Get('anticipos/:id')
  @ApiOperation({ summary: 'Obtener anticipo por ID' })
  @ApiParam({ name: 'id', description: 'ID del anticipo' })
  @ApiResponse({ status: 200, description: 'Anticipo encontrado' })
  @ApiResponse({ status: 404, description: 'Anticipo no encontrado' })
  findOneAnticipo(@Param('id') id: string) {
    return this.anticiposViaticosService.findOneAnticipo(id);
  }

  @Patch('anticipos/:id')
  @ApiOperation({ summary: 'Actualizar anticipo' })
  @ApiParam({ name: 'id', description: 'ID del anticipo' })
  @ApiResponse({ status: 200, description: 'Anticipo actualizado' })
  @ApiResponse({ status: 404, description: 'Anticipo no encontrado' })
  updateAnticipo(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnticipoDto,
  ) {
    return this.anticiposViaticosService.updateAnticipo(id, updateDto);
  }

  @Delete('anticipos/:id')
  @ApiOperation({ summary: 'Eliminar anticipo' })
  @ApiParam({ name: 'id', description: 'ID del anticipo' })
  @ApiResponse({ status: 200, description: 'Anticipo eliminado' })
  @ApiResponse({ status: 404, description: 'Anticipo no encontrado' })
  removeAnticipo(@Param('id') id: string) {
    return this.anticiposViaticosService.removeAnticipo(id);
  }

  @Post('liquidacion')
  @ApiOperation({
    summary: 'Liquidar un viático (calcular diferencia y generar asientos)',
  })
  @ApiResponse({ status: 201, description: 'Viático liquidado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'El anticipo ya está liquidado o cancelado',
  })
  @ApiResponse({ status: 404, description: 'Anticipo no encontrado' })
  liquidarViatico(@Body() dto: CreateLiquidacionViaticoDto) {
    return this.anticiposViaticosService.liquidarViatico(dto.anticipo, dto);
  }

  @Get('liquidaciones')
  @ApiOperation({ summary: 'Obtener todas las liquidaciones' })
  @ApiResponse({ status: 200, description: 'Lista de liquidaciones' })
  getLiquidaciones() {
    return this.anticiposViaticosService.getLiquidaciones();
  }

  @Post('liquidacion/:id/aprobar')
  @ApiOperation({ summary: 'Aprobar una liquidación de viático' })
  @ApiParam({ name: 'id', description: 'ID de la liquidación' })
  @ApiResponse({ status: 200, description: 'Liquidación aprobada' })
  @ApiResponse({ status: 404, description: 'Liquidación no encontrada' })
  aprobarLiquidacion(@Param('id') id: string) {
    return this.anticiposViaticosService.aprobarLiquidacion(id);
  }

  @Post('liquidacion/:id/rechazar')
  @ApiOperation({ summary: 'Rechazar una liquidación de viático' })
  @ApiParam({ name: 'id', description: 'ID de la liquidación' })
  @ApiResponse({ status: 200, description: 'Liquidación rechazada' })
  @ApiResponse({ status: 404, description: 'Liquidación no encontrada' })
  rechazarLiquidacion(
    @Param('id') id: string,
    @Body() dto: RechazarLiquidacionDto,
  ) {
    return this.anticiposViaticosService.rechazarLiquidacion(id, dto.motivo);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de anticipos y viáticos' })
  @ApiResponse({ status: 200, description: 'Resumen de anticipos y viáticos' })
  getResumen() {
    return this.anticiposViaticosService.getResumen();
  }
}
