import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OperacionFinancieraService } from './operacion-financiera.service';
import { CreateOperacionFinancieraDto } from './dto/create-operacion-financiera.dto';
import { UpdateOperacionFinancieraDto } from './dto/update-operacion-financiera.dto';
import { PagarOperacionFinancieraDto } from './dto/pagar-operacion-financiera.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TipoOperacionFinanciera } from './types/operacion-financiera.types';

@ApiTags('Operaciones Financieras')
@Controller('operacion-financiera')
export class OperacionFinancieraController {
  constructor(private readonly operacionService: OperacionFinancieraService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar operación financiera' })
  @ApiResponse({
    status: 201,
    description: 'Operación financiera registrada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe una operación con ese código',
  })
  create(@Body() createDto: CreateOperacionFinancieraDto) {
    return this.operacionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las operaciones financieras' })
  @ApiResponse({ status: 200, description: 'Lista de operaciones financieras' })
  findAll() {
    return this.operacionService.findAll();
  }

  @Get('vencidas')
  @ApiOperation({ summary: 'Operaciones vencidas' })
  @ApiResponse({ status: 200, description: 'Operaciones vencidas obtenidas' })
  getVencidas() {
    return this.operacionService.getVencidas();
  }

  @Get('tipo/:tipo')
  @ApiOperation({ summary: 'Operaciones por tipo' })
  @ApiParam({
    name: 'tipo',
    enum: TipoOperacionFinanciera,
    description: 'Tipo de operación',
  })
  @ApiResponse({ status: 200, description: 'Operaciones filtradas por tipo' })
  getPorTipo(@Param('tipo') tipo: TipoOperacionFinanciera) {
    return this.operacionService.getPorTipo(tipo);
  }

  @Get('periodo/:periodo')
  @ApiOperation({ summary: 'Operaciones por período' })
  @ApiParam({ name: 'periodo', description: 'Período (ej. "2026-06")' })
  @ApiResponse({
    status: 200,
    description: 'Operaciones filtradas por período',
  })
  getPorPeriodo(@Param('periodo') periodo: string) {
    return this.operacionService.getPorPeriodo(periodo);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de operaciones financieras' })
  @ApiResponse({ status: 200, description: 'Resumen de operaciones' })
  getResumen() {
    return this.operacionService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener operación financiera por ID' })
  @ApiParam({ name: 'id', description: 'ID de la operación financiera' })
  @ApiResponse({ status: 200, description: 'Operación financiera encontrada' })
  @ApiResponse({
    status: 404,
    description: 'Operación financiera no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.operacionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar operación financiera' })
  @ApiParam({ name: 'id', description: 'ID de la operación financiera' })
  @ApiResponse({ status: 200, description: 'Operación financiera actualizada' })
  @ApiResponse({
    status: 404,
    description: 'Operación financiera no encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOperacionFinancieraDto,
  ) {
    return this.operacionService.update(id, updateDto);
  }

  @Post(':id/pagar')
  @ApiOperation({ summary: 'Registrar pago de operación financiera' })
  @ApiParam({ name: 'id', description: 'ID de la operación financiera' })
  @ApiResponse({ status: 200, description: 'Pago registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al registrar pago' })
  @ApiResponse({
    status: 404,
    description: 'Operación financiera no encontrada',
  })
  pagar(
    @Param('id') id: string,
    @Body() pagarDto: PagarOperacionFinancieraDto,
  ) {
    return this.operacionService.pagar(id, pagarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar operación financiera' })
  @ApiParam({ name: 'id', description: 'ID de la operación financiera' })
  @ApiResponse({ status: 200, description: 'Operación financiera eliminada' })
  @ApiResponse({
    status: 404,
    description: 'Operación financiera no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.operacionService.remove(id);
  }
}
