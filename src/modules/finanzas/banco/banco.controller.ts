import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cuentas Bancarias')
@Controller('banco')
export class BancoController {
  constructor(private readonly bancoService: BancoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva cuenta bancaria (Res. 248/2008 BCC)' })
  create(@Body() createDto: CreateBancoDto) {
    return this.bancoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas bancarias' })
  findAll() {
    return this.bancoService.findAll();
  }

  @Get('saldos')
  @ApiOperation({ summary: 'Obtener saldos actuales de cuentas activas' })
  getSaldos() {
    return this.bancoService.getSaldos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta bancaria por ID' })
  findOne(@Param('id') id: string) {
    return this.bancoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cuenta bancaria' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBancoDto) {
    return this.bancoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cuenta bancaria' })
  remove(@Param('id') id: string) {
    return this.bancoService.remove(id);
  }
}
