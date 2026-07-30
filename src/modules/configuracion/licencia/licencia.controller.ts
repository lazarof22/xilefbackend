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
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LicenciaService } from './licencia.service';
import { ActivarLicenciaDto } from './dto/activar-licencia.dto';
import { GenerarLicenciaDto } from './dto/generar-licencia.dto';
import { RenovarLicenciaDto } from './dto/renovar-licencia.dto';
import { RevocarLicenciaDto } from './dto/revocar-licencia.dto';
import {
  LicenciaAdminResponseDto,
  LicenciaUserResponseDto,
} from './dto/licencia-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { LICENCIA_FORMAT_REGEX } from './constants/licencia.constants';
import {
  FormatoClaveResponse,
  LicenciaActivadaResponse,
  EstadoLicenciaResponse,
  LicenciaGeneradaResponse,
  LicenciaRenovadaResponse,
  RevocarResponse,
  EstadoPublicoResponse,
} from './types/licencia.types';

interface RequestWithUser {
  user?: {
    empresa_id?: string;
    rol?: string;
    sub?: string;
  };
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string>;
  ip?: string;
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
  @ApiResponse({
    status: 200,
    description: 'Resultado de validación de formato',
  })
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  validarClave(@Body('clave') clave: string): FormatoClaveResponse {
    return { formato_valido: LICENCIA_FORMAT_REGEX.test(clave) };
  }

  @Post('activar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar una licencia (endpoint público)' })
  @ApiResponse({ status: 200, description: 'Licencia activada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o licencia revocada/expirada',
  })
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

  @Get('public/estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar estado público de licencia por clave' })
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async estadoPublico(
    @Query('clave') clave: string,
  ): Promise<EstadoPublicoResponse> {
    return this.licenciaService.estadoPublico(clave);
  }

  @Get('estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar estado actual de la licencia' })
  @ApiResponse({ status: 200, description: 'Estado de la licencia' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async verificarEstado(
    @Req() req: RequestWithUser,
  ): Promise<LicenciaUserResponseDto> {
    // P0-7: cierre de IDOR. Non-admin ignora query y usa solo JWT.
    const isAdmin = req.user?.rol === 'administrador';
    let empresaId: string;
    if (isAdmin) {
      const q = (req.query as Record<string, string>)?.empresa_id;
      empresaId = req.user?.empresa_id ?? q ?? '';
    } else {
      empresaId = req.user?.empresa_id ?? '';
    }
    if (!empresaId) {
      throw new BadRequestException('empresa_id no presente en JWT');
    }
    const estado = await this.licenciaService.verificarEstado(
      empresaId,
      req.ip,
      req.headers?.['user-agent'] as string | undefined,
    );
    return LicenciaUserResponseDto.fromEstado(estado);
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
  renovar(
    @Body() dto: RenovarLicenciaDto,
    @Req() req: RequestWithUser,
  ): Promise<LicenciaRenovadaResponse> {
    const uaRaw = req.headers?.['user-agent'];
    const ua = Array.isArray(uaRaw) ? uaRaw[0] : (uaRaw ?? '');
    return this.licenciaService.renovarLicencia(dto, req.ip, ua);
  }

  @Post('revocar/:empresaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revocar una licencia (solo admin)' })
  @ApiParam({ name: 'empresaId', description: 'ID de la empresa' })
  @ApiResponse({ status: 200, description: 'Licencia revocada exitosamente' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  revocar(
    @Param('empresaId') empresaId: string,
    @Body() body: RevocarLicenciaDto,
    @Req() req: RequestWithUser,
  ): Promise<RevocarResponse> {
    const uaRaw = req.headers?.['user-agent'];
    const ua = Array.isArray(uaRaw) ? uaRaw[0] : (uaRaw ?? '');
    return this.licenciaService.revocarLicencia(
      empresaId,
      body.motivo,
      req.ip,
      ua,
    );
  }

  @Get('admin/auditoria')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener auditoría de licencias (solo admin)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Máx 100 (default 100)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Desplazamiento (default 0)',
  })
  @ApiQuery({ name: 'empresa_id', required: false })
  @ApiQuery({ name: 'accion', required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async auditoria(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('empresa_id') empresaId?: string,
    @Query('accion') accion?: string,
  ): Promise<unknown[]> {
    return this.licenciaService.getAuditoria({
      limit,
      offset,
      empresa_id: empresaId,
      accion,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas las licencias (solo admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  listarTodas(): Promise<LicenciaAdminResponseDto[]> {
    return this.licenciaService
      .findAll()
      .then((licencias) =>
        licencias.map((l) => LicenciaAdminResponseDto.fromDocument(l)),
      );
  }

  // P0-9: Ruta paramétrica `:empresaId` declarada al FINAL para que no
  // intercepte rutas estáticas como /admin/auditoria, /estado, /public/estado.
  @Get(':empresaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una licencia por empresa_id (solo admin)' })
  @ApiParam({ name: 'empresaId', description: 'ID de la empresa' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async obtenerUna(
    @Param('empresaId') empresaId: string,
  ): Promise<LicenciaAdminResponseDto | null> {
    const lic = await this.licenciaService.findOne(empresaId);
    return lic ? LicenciaAdminResponseDto.fromDocument(lic) : null;
  }
}
