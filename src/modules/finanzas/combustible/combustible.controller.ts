import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CombustibleService } from './combustible.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { CreateCargaDto } from './dto/create-carga.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Combustible')
@Controller('combustible')
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  @Post('vehiculo')
  @ApiOperation({ summary: 'Registrar vehículo' })
  @ApiResponse({ status: 201, description: 'Vehículo registrado' })
  createVehiculo(@Body() createDto: CreateVehiculoDto) {
    return this.combustibleService.createVehiculo(createDto);
  }

  @Get('vehiculo')
  @ApiOperation({ summary: 'Listar vehículos' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos' })
  findAllVehiculos() {
    return this.combustibleService.findAllVehiculos();
  }

  @Get('vehiculo/:id')
  @ApiOperation({ summary: 'Obtener vehículo por ID' })
  @ApiParam({ name: 'id', description: 'ID del vehículo' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  findVehiculo(@Param('id') id: string) {
    return this.combustibleService.findVehiculo(id);
  }

  @Delete('vehiculo/:id')
  @ApiOperation({ summary: 'Eliminar vehículo' })
  @ApiParam({ name: 'id', description: 'ID del vehículo' })
  @ApiResponse({ status: 200, description: 'Vehículo eliminado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  removeVehiculo(@Param('id') id: string) {
    return this.combustibleService.removeVehiculo(id);
  }

  @Post('tarjeta')
  @ApiOperation({
    summary: 'Registrar tarjeta prepagada (Res. 60/2009 MFP, Decreto 110/2024)',
  })
  @ApiResponse({ status: 201, description: 'Tarjeta registrada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe una tarjeta con ese número',
  })
  createTarjeta(@Body() createDto: CreateTarjetaDto) {
    return this.combustibleService.createTarjeta(createDto);
  }

  @Get('tarjeta')
  @ApiOperation({ summary: 'Listar tarjetas' })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas' })
  findAllTarjetas() {
    return this.combustibleService.findAllTarjetas();
  }

  @Post('carga')
  @ApiOperation({ summary: 'Registrar carga de combustible' })
  @ApiResponse({ status: 201, description: 'Carga registrada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Ya existe una carga con ese código',
  })
  createCarga(@Body() createDto: CreateCargaDto) {
    return this.combustibleService.createCarga(createDto);
  }

  @Get('carga')
  @ApiOperation({ summary: 'Listar cargas' })
  @ApiResponse({ status: 200, description: 'Lista de cargas' })
  findAllCargas() {
    return this.combustibleService.findAllCargas();
  }

  @Get('carga/vehiculo/:vehiculoId')
  @ApiOperation({ summary: 'Cargas por vehículo' })
  @ApiParam({ name: 'vehiculoId', description: 'ID del vehículo' })
  @ApiResponse({ status: 200, description: 'Cargas del vehículo' })
  getCargasPorVehiculo(@Param('vehiculoId') vehiculoId: string) {
    return this.combustibleService.getCargasPorVehiculo(vehiculoId);
  }

  @Get('consumo')
  @ApiOperation({ summary: 'Resumen de consumo' })
  @ApiQuery({
    name: 'vehiculoId',
    required: false,
    description: 'Filtrar por vehículo',
  })
  @ApiResponse({ status: 200, description: 'Resumen de consumo' })
  getConsumo(@Query('vehiculoId') vehiculoId?: string) {
    return this.combustibleService.getConsumoResumen(vehiculoId);
  }
}
