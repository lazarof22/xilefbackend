import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CuentaPagarService } from './cuenta-pagar.service';
import { CreateCuentaPagarDto } from './dto/create-cuenta-pagar.dto';
import { UpdateCuentaPagarDto } from './dto/update-cuenta-pagar.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cuentas por Pagar')
@Controller('cuenta-pagar')
export class CuentaPagarController {
  constructor(private readonly cxpService: CuentaPagarService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar cuenta por pagar' })
  create(@Body() createDto: CreateCuentaPagarDto) {
    return this.cxpService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas por pagar' })
  findAll() { return this.cxpService.findAll(); }

  @Get('vencidas')
  @ApiOperation({ summary: 'Cuentas por pagar vencidas' })
  getVencidas() { return this.cxpService.getVencidas(); }

  @Get('envejecimiento')
  @ApiOperation({ summary: 'Análisis de envejecimiento' })
  getEnvejecimiento() { return this.cxpService.getEnvejecimiento(); }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de cuentas por pagar' })
  getResumen() { return this.cxpService.getResumen(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cuenta por pagar por ID' })
  findOne(@Param('id') id: string) { return this.cxpService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cuenta por pagar' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCuentaPagarDto) {
    return this.cxpService.update(id, updateDto);
  }

  @Post(':id/abonar')
  @ApiOperation({ summary: 'Registrar pago a cuenta por pagar' })
  abonar(@Param('id') id: string, @Body() abono: { monto: number }) {
    return this.cxpService.abonar(id, abono);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cuenta por pagar' })
  remove(@Param('id') id: string) { return this.cxpService.remove(id); }
}
