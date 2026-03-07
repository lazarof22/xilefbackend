import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id_cliente') id_cliente: string) {
    return this.clienteService.findOne(+id_cliente);
  }

  @Patch(':id')
  update(@Param('id_cliente') id_cliente: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(+id_cliente, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id_cliente') id_cliente: string) {
    return this.clienteService.remove(+id_cliente);
  }
}
