import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FormaPagoService } from './forma-pago.service';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('FormaPago')
@Controller('forma-pago')
export class FormaPagoController {
  constructor(private readonly formaPagoService: FormaPagoService) {}

  @ApiOperation({ summary: 'Registrar una nueva forma de pago' })
  @ApiResponse({
    status: 201,
    description: 'Forma de pago registrada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createFormaPagoDto: CreateFormaPagoDto) {
    return this.formaPagoService.create(createFormaPagoDto);
  }

  @ApiOperation({ summary: 'Obtener todas las formas de pago' })
  @ApiResponse({
    status: 201,
    description: 'Formas de pago obtenidas con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  findAll() {
    return this.formaPagoService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una forma de pago' })
  @ApiResponse({ status: 201, description: 'Forma de pago obtenida con exito' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formaPagoService.findOne(id);
  }

  @ApiOperation({ summary: 'Modificar una forma de pago' })
  @ApiResponse({
    status: 201,
    description: 'Forma de pago modificada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormaPagoDto: UpdateFormaPagoDto,
  ) {
    return this.formaPagoService.update(id, updateFormaPagoDto);
  }

  @ApiOperation({ summary: 'Eliminar una forma de pago' })
  @ApiResponse({
    status: 201,
    description: 'Forma de pago eliminada con exito',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formaPagoService.remove(id);
  }
}
