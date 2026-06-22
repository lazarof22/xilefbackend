import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LicenciaService } from './licencia.service';
import { ActivarLicenciaDto } from './dto/activar-licencia.dto';
import { GenerarLicenciaDto } from './dto/generar-licencia.dto';
import { RenovarLicenciaDto } from './dto/renovar-licencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import {
  FormatoClaveResponse,
  LicenciaActivadaResponse,
  EstadoLicenciaResponse,
  LicenciaGeneradaResponse,
  LicenciaRenovadaResponse,
  RevocarResponse,
  EstadoPublicoResponse,
} from './types/licencia.types';
import type { LicenciaDocument } from './schemas/licencia.schema';
import type { AuditoriaLicenciaDocument } from './schemas/auditoria-licencia.schema';

interface RequestWithUser {
  user?: {
    empresa_id?: string;
    rol?: string;
    sub?: string;
  };
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string>;
}

@ApiTags('Licencias')
@Controller('licencia')
@UseGuards(ThrottlerGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class LicenciaController {
  constructor(private readonly licenciaService: LicenciaService) {}

  @Post('validar-clave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar formato de clave sin activar' })
  @ApiResponse({ status: 200, description: 'Resultado de validación de formato' })
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  validarClave(@Body('clave') clave: string): FormatoClaveResponse {
    const regex = /^XILEF-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    return { formato_valido: regex.test(clave) };
  }

  @Post('activar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar una licencia (endpoint público)' })
  @ApiResponse({ status: 200, description: 'Licencia activada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o licencia revocada/expirada' })
  @ApiResponse({ status: 404, description: 'Clave no encontrada' })
  @Throttle({ default: { ttl: 900000, limit: 5 } })
  activar(
    @Body() dto: ActivarLicenciaDto,
    @Ip() ip: string,
    @Req() req: RequestWithUser,
  ): Promise<LicenciaActivadaResponse> {
    const rawAgent = req.headers?.['user-agent'];
    const userAgent = Array.isArray(rawAgent) ? rawAgent[0] : (rawAgent ?? '');
    return this.licenciaService.activarLicencia(dto, ip, userAgent);
  }

  @Get('estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar estado actual de la licencia' })
  @ApiResponse({ status: 200, description: 'Estado de la licencia' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  verificarEstado(
    @Req() req: RequestWithUser,
  ): Promise<EstadoLicenciaResponse | (EstadoLicenciaResponse & { mensaje: string })> {
    const empresaId = req.user?.empresa_id ?? (req.query as Record<string, string>)?.empresa_id;
    if (!empresaId) {
      return Promise.resolve({
        valida: false,
        vigente: false,
        dias_restantes: 0,
        tipo: null,
        empresa: null,
        fecha_vencimiento: null,
        max_usuarios: 0,
        mensaje: 'empresa_id no proporcionado',
      });
    }
    return this.licenciaService.verificarEstado(empresaId);
  }

  @Post('generar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar una nueva licencia (solo admin)' })
  @ApiResponse({ status: 201, description: 'Licencia generada exitosamente' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  generar(@Body() dto: GenerarLicenciaDto): Promise<LicenciaGeneradaResponse> {
    return this.licenciaService.generateLicencia(dto);
  }

  @Post('renovar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar una licencia existente (solo admin)' })
  @ApiResponse({ status: 200, description: 'Licencia renovada exitosamente' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  renovar(@Body() dto: RenovarLicenciaDto): Promise<LicenciaRenovadaResponse> {
    return this.licenciaService.renovarLicencia(dto);
  }

  @Post('revocar/:empresaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revocar una licencia (solo admin)' })
  @ApiResponse({ status: 200, description: 'Licencia revocada exitosamente' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  revocar(
    @Param('empresaId') empresaId: string,
    @Body('motivo') motivo: string,
  ): Promise<RevocarResponse> {
    return this.licenciaService.revocarLicencia(empresaId, motivo);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas las licencias (solo admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  listarTodas(): Promise<LicenciaDocument[]> {
    return this.licenciaService.findAll();
  }

  @Get(':empresaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una licencia por empresa_id (solo admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  obtenerUna(@Param('empresaId') empresaId: string): Promise<LicenciaDocument | null> {
    return this.licenciaService.findOne(empresaId);
  }

  @Get('admin/auditoria')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener auditoría de licencias (solo admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  auditoria(): Promise<AuditoriaLicenciaDocument[]> {
    return this.licenciaService.getAuditoria();
  }

  @Get('public/estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar estado público de licencia por clave' })
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async estadoPublico(@Query('clave') clave: string): Promise<EstadoPublicoResponse> {
    return this.licenciaService.estadoPublico(clave);
  }
}
