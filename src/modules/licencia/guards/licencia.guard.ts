import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { LicenciaService } from '../licencia.service';

interface GuardRequest {
  user?: {
    empresa_id?: string;
    rol?: string;
    sub?: string;
  };
  body?: { empresa_id?: string };
  headers?: Record<string, string | string[] | undefined>;
  licenciaEstado?: unknown;
}

/**
 * LicenciaGuard: protege rutas garantizando que la empresa del JWT tenga
 * licencia activa y vigente.
 *
 * Reglas:
 * - Sin `req.user` se rechaza con Unauthorized (la auth no ocurrió).
 * - Para non-admin: usa EXCLUSIVAMENTE `req.user.empresa_id`. No se aceptan
 *   overrides por body ni header (anti IDOR).
 * - Para admin (rol === 'administrador'): se permite override explícito vía
 *   `req.body.empresa_id` o header `x-empresa-id` si viene para inspección
 *   administrativa.
 * - Sin `empresa_id` estando autenticado pero sin empresa asociada: Unauthorized.
 */
@Injectable()
export class LicenciaGuard implements CanActivate {
  constructor(private readonly licenciaService: LicenciaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GuardRequest>();

    if (!request.user) {
      throw new UnauthorizedException('No autenticado');
    }

    const isAdmin = request.user.rol === 'administrador';
    let empresaId: string | undefined;

    if (isAdmin) {
      const headerEmpresa = request.headers?.['x-empresa-id'];
      const headerValue = Array.isArray(headerEmpresa)
        ? headerEmpresa[0]
        : headerEmpresa;
      empresaId =
        request.user.empresa_id ?? request.body?.empresa_id ?? headerValue;
    } else {
      empresaId = request.user.empresa_id;
    }

    if (!empresaId) {
      throw new UnauthorizedException(
        'empresa_id no presente en el JWT. Solicite un token con empresa asociada.',
      );
    }

    const estado = await this.licenciaService.verificarEstado(
      empresaId,
      undefined,
      undefined,
    );

    if (!estado.valida) {
      throw new ForbiddenException('No hay licencia activa para esta empresa');
    }

    if (!estado.vigente) {
      const diasExpirados = Math.abs(estado.dias_restantes);
      throw new ForbiddenException(
        `Licencia expirada hace ${diasExpirados} días. Por favor, renueve su licencia.`,
      );
    }

    request.licenciaEstado = estado;

    return true;
  }
}
