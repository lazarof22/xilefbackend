import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cuentas Bancarias')
@Controller('banco')
export class BancoController {
  constructor(private readonly bancoService: BancoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva cuenta bancaria (Res. 248/2008 BCC)' })
  @ApiResponse({ status: 201, description: 'Cuenta bancaria registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Ya existe una cuenta con ese código' })
  create(@Body() createDto: CreateBancoDto) {
    return this.bancoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas bancarias' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas bancarias' })
  findAll() {
    return this.bancoService.findAll();
  }

  @Get('saldos')
  @ApiOperation({ summary: 'Obtener saldos actuales de cuentas activas' })
  @ApiResponse({ status: 200, description: 'Saldos actuales de cuentas activas' })
  getSaldos() {
    return this.bancoService.getSaldos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta bancaria por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Cuenta bancaria encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta bancaria no encontrada' })
  findOne(@Param('id') id: string) {
    return this.bancoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cuenta bancaria' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Cuenta bancaria actualizada' })
  @ApiResponse({ status: 404, description: 'Cuenta bancaria no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBancoDto) {
    return this.bancoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cuenta bancaria' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Cuenta bancaria eliminada' })
  @ApiResponse({ status: 404, description: 'Cuenta bancaria no encontrada' })
  remove(@Param('id') id: string) {
    return this.bancoService.remove(id);
  }
}
