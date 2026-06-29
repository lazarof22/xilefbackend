import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ChequeService } from './cheque.service';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { RegistrarCobroChequeDto } from './dto/registrar-cobro-cheque.dto';
import { RegistrarDevolucionChequeDto } from './dto/registrar-devolucion-cheque.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cheques')
@Controller('cheque')
export class ChequeController {
  constructor(private readonly chequeService: ChequeService) {}
  @Post()
  @ApiOperation({ summary: 'Registrar cheque (Res. 101/2011 BCC)' })
  @ApiResponse({ status: 201, description: 'Cheque registrado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un cheque con ese número',
  })
  create(@Body() createDto: CreateChequeDto) {
    return this.chequeService.create(createDto);
  }
  @Get()
  @ApiOperation({ summary: 'Listar cheques' })
  @ApiResponse({ status: 200, description: 'Lista de cheques' })
  findAll() {
    return this.chequeService.findAll();
  }
  @Get('pendientes')
  @ApiOperation({ summary: 'Cheques pendientes' })
  @ApiResponse({ status: 200, description: 'Cheques pendientes de cobro' })
  getPendientes() {
    return this.chequeService.getPendientes();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtener cheque' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Cheque encontrado' })
  @ApiResponse({ status: 404, description: 'Cheque no encontrado' })
  findOne(@Param('id') id: string) {
    return this.chequeService.findOne(id);
  }
  @Patch(':id/cobrar')
  @ApiOperation({ summary: 'Registrar cobro' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Cobro registrado' })
  @ApiResponse({ status: 404, description: 'Cheque no encontrado' })
  registrarCobro(
    @Param('id') id: string,
    @Body() dto: RegistrarCobroChequeDto,
  ) {
    return this.chequeService.registrarCobro(id, dto.fechaCobro);
  }
  @Patch(':id/devolver')
  @ApiOperation({ summary: 'Registrar devolución' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Devolución registrada' })
  @ApiResponse({ status: 404, description: 'Cheque no encontrado' })
  registrarDevolucion(
    @Param('id') id: string,
    @Body() dto: RegistrarDevolucionChequeDto,
  ) {
    return this.chequeService.registrarDevolucion(id, dto.motivo);
  }
  @Patch(':id/anular')
  @ApiOperation({ summary: 'Anular cheque' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Cheque anulado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede anular un cheque cobrado',
  })
  @ApiResponse({ status: 404, description: 'Cheque no encontrado' })
  anular(@Param('id') id: string) {
    return this.chequeService.anular(id);
  }
}
