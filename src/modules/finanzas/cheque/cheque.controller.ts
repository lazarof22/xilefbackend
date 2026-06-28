import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ChequeService } from './cheque.service';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cheques')
@Controller('cheque')
export class ChequeController {
  constructor(private readonly chequeService: ChequeService) {}
  @Post() @ApiOperation({ summary: 'Registrar cheque (Res. 101/2011 BCC)' }) @ApiResponse({ status: 201 })
  create(@Body() createDto: CreateChequeDto) { return this.chequeService.create(createDto); }
  @Get() @ApiOperation({ summary: 'Listar cheques' })
  findAll() { return this.chequeService.findAll(); }
  @Get('pendientes') @ApiOperation({ summary: 'Cheques pendientes' })
  getPendientes() { return this.chequeService.getPendientes(); }
  @Get(':id') @ApiOperation({ summary: 'Obtener cheque' }) @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) { return this.chequeService.findOne(id); }
  @Patch(':id/cobrar') @ApiOperation({ summary: 'Registrar cobro' }) @ApiParam({ name: 'id' })
  registrarCobro(@Param('id') id: string, @Body() data: { fechaCobro: string }) { return this.chequeService.registrarCobro(id, data.fechaCobro); }
  @Patch(':id/devolver') @ApiOperation({ summary: 'Registrar devolución' }) @ApiParam({ name: 'id' })
  registrarDevolucion(@Param('id') id: string, @Body() data: { motivo: string }) { return this.chequeService.registrarDevolucion(id, data.motivo); }
  @Patch(':id/anular') @ApiOperation({ summary: 'Anular cheque' }) @ApiParam({ name: 'id' })
  anular(@Param('id') id: string) { return this.chequeService.anular(id); }
}
