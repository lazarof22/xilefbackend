import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaDatosService } from './empresa-datos.service';
import { UpdateEmpresaDatosDto } from './dto/update-empresa-datos.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import type { EmpresaDatosDocument } from './schemas/empresa-datos.schema';

@ApiTags('Empresa')
@Controller('empresa')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class EmpresaDatosController {
  constructor(private readonly empresaService: EmpresaDatosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener datos de la empresa (público)' })
  @ApiResponse({ status: 200, description: 'Datos de la empresa' })
  obtener(): Promise<EmpresaDatosDocument | null> {
    return this.empresaService.obtener();
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar o actualizar datos de la empresa (admin)' })
  @ApiResponse({ status: 200, description: 'Datos actualizados' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  guardar(@Body() dto: UpdateEmpresaDatosDto): Promise<EmpresaDatosDocument> {
    return this.empresaService.guardar(dto);
  }

  @Post('logo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subir logo de la empresa (admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  guardarLogo(@Body('logo') logo: string): Promise<EmpresaDatosDocument> {
    return this.empresaService.guardarLogo(logo);
  }
}
