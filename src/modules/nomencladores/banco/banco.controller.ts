import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('banco')
export class BancoController {
  constructor(private readonly bancoService: BancoService) { }

  @ApiOperation({ summary: 'Registrar un nuevo banco' })
  @ApiResponse({ status: 201, description: 'Banco registrado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createBancoDto: CreateBancoDto) {
    return this.bancoService.create(createBancoDto);
  }

  @ApiOperation({ summary: 'Obtener todos los bancos' })
  @ApiResponse({ status: 201, description: 'Bancos obtenidos con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.bancoService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un banco' })
  @ApiResponse({ status: 201, description: 'Banco obtenido con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bancoService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar un banco' })
  @ApiResponse({ status: 201, description: 'Banco modificado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBancoDto: UpdateBancoDto) {
    return this.bancoService.update(id, updateBancoDto);
  }

   @ApiOperation({ summary: 'Eliminar un banco' })
  @ApiResponse({ status: 201, description: 'Banco eliminado con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bancoService.remove(id);
  }
}


