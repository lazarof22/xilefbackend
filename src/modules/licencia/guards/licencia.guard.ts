import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { LicenciaService } from '../licencia.service';

@Injectable()
export class LicenciaGuard implements CanActivate {
  constructor(private readonly licenciaService: LicenciaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const empresaId =
      request.user?.empresa_id ||
      request.body?.empresa_id ||
      request.headers?.['x-empresa-id'];

    if (!empresaId) {
      throw new UnauthorizedException(
        'Empresa no identificada. Incluya empresa_id en el token, body o header x-empresa-id.',
      );
    }

    const estado = await this.licenciaService.verificarEstado(empresaId);

    if (!estado.valida) {
      throw new ForbiddenException(
        'No hay licencia activa para esta empresa',
      );
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
