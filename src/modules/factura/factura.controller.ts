import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@ApiTags('Facturas')
@Controller('facturas')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva factura' })
  @ApiResponse({ status: 201, description: 'Factura registrada con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturaService.create(createFacturaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las facturas' })
  @ApiResponse({ status: 200, description: 'Facturas obtenidas con exito' })
  findAll() {
    return this.facturaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una factura por ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({ status: 200, description: 'Factura encontrada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  findOne(@Param('id') id: string) {
    return this.facturaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar una factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({ status: 200, description: 'Factura modificada con exito' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  update(@Param('id') id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturaService.update(id, updateFacturaDto);
  }

  @Patch(':id/anular')
  @ApiOperation({
    summary: 'Anular una factura (conserva el registro por obligacion legal)',
  })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({ status: 200, description: 'Factura anulada con exito' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  anular(@Param('id') id: string) {
    return this.facturaService.anular(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Anular una factura (baja blanda, conserva el registro)',
  })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({ status: 200, description: 'Factura anulada con exito' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  remove(@Param('id') id: string) {
    return this.facturaService.remove(id);
  }
}
