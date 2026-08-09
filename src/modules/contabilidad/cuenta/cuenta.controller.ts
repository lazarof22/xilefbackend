import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cuentas Contables')
@Controller('cuenta')
export class CuentaController {
  constructor(private readonly cuentaService: CuentaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva cuenta contable' })
  @ApiResponse({ status: 201, description: 'Cuenta registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createCuentaDto: CreateCuentaDto) {
    return this.cuentaService.create(createCuentaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas contables' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas contables' })
  findAll() {
    return this.cuentaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta contable por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta contable' })
  @ApiResponse({ status: 200, description: 'Cuenta contable encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta contable no encontrada' })
  findOne(@Param('id') id: string) {
    return this.cuentaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cuenta contable' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta contable' })
  @ApiResponse({ status: 200, description: 'Cuenta contable actualizada' })
  @ApiResponse({ status: 404, description: 'Cuenta contable no encontrada' })
  update(@Param('id') id: string, @Body() updateCuentaDto: UpdateCuentaDto) {
    return this.cuentaService.update(id, updateCuentaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una cuenta contable' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta contable' })
  @ApiResponse({ status: 200, description: 'Cuenta contable eliminada' })
  @ApiResponse({ status: 404, description: 'Cuenta contable no encontrada' })
  remove(@Param('id') id: string) {
    return this.cuentaService.remove(id);
  }
}
