import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CuentaCobrarService } from './cuenta-cobrar.service';
import { CreateCuentaCobrarDto } from './dto/create-cuenta-cobrar.dto';
import { UpdateCuentaCobrarDto } from './dto/update-cuenta-cobrar.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cuentas por Cobrar')
@Controller('cuenta-cobrar')
export class CuentaCobrarController {
  constructor(private readonly cxcService: CuentaCobrarService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar cuenta por cobrar' })
  create(@Body() createDto: CreateCuentaCobrarDto) {
    return this.cxcService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas por cobrar' })
  findAll() {
    return this.cxcService.findAll();
  }

  @Get('vencidas')
  @ApiOperation({ summary: 'Cuentas vencidas (Inst. 34/2006 BCC)' })
  getVencidas() {
    return this.cxcService.getVencidas();
  }

  @Get('envejecimiento')
  @ApiOperation({ summary: 'Análisis de envejecimiento (aging)' })
  getEnvejecimiento() {
    return this.cxcService.getEnvejecimiento();
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de cuentas por cobrar' })
  getResumen() {
    return this.cxcService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cuenta por cobrar por ID' })
  findOne(@Param('id') id: string) {
    return this.cxcService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cuenta por cobrar' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCuentaCobrarDto) {
    return this.cxcService.update(id, updateDto);
  }

  @Post(':id/abonar')
  @ApiOperation({ summary: 'Registrar abono/pago a cuenta por cobrar' })
  abonar(@Param('id') id: string, @Body() abono: { monto: number; fechaPago?: string; referencia?: string }) {
    return this.cxcService.abonar(id, abono);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cuenta por cobrar' })
  remove(@Param('id') id: string) {
    return this.cxcService.remove(id);
  }
}
