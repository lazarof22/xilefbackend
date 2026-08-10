import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import {
  AUDITABLE_KEY,
  AuditableOptions,
} from '../decorators/auditable.decorator';
import { AccionAuditoria, ModuloAuditoria } from '../types/auditoria.types';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
    id?: string;
    sub?: string;
    correo_empleado?: string;
    nombre?: string;
    email?: string;
  };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const auditableMeta = this.reflector.get<AuditableOptions>(
      AUDITABLE_KEY,
      context.getHandler(),
    );

    const pathParts = request.path.split('/').filter(Boolean);
    const entidad = auditableMeta?.entidad || pathParts[0] || 'desconocido';
    const modulo = auditableMeta?.modulo || pathParts[0] || 'general';

    const accion: AccionAuditoria =
      method === 'POST'
        ? AccionAuditoria.CREATE
        : method === 'DELETE'
          ? AccionAuditoria.DELETE
          : AccionAuditoria.UPDATE;

    const user = request.user;
    const usuarioId = user?.userId || user?.id || user?.sub || 'sistema';
    const usuarioNombre =
      user?.correo_empleado || user?.nombre || user?.email || 'Sistema';
    const ip: string =
      ((Array.isArray(request.ip) ? request.ip[0] : request.ip) as string) ||
      request.socket?.remoteAddress ||
      '';

    const rawEntidadId = request.params?.id;
    const entidadId = Array.isArray(rawEntidadId)
      ? rawEntidadId[0]
      : rawEntidadId || '';
    const valoresNuevos: Record<string, unknown> | undefined =
      method !== 'DELETE'
        ? (request.body as Record<string, unknown>)
        : undefined;

    return next.handle().pipe(
      tap((result) => {
        const resultObj = result as Record<string, unknown> | undefined;
        const resultId: string =
          entidadId ||
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          String(resultObj?._id ?? resultObj?.id ?? '');
        this.auditService
          .registrar({
            entidad,
            entidadId: resultId,
            accion,
            usuarioId,
            usuarioNombre,
            valoresNuevos,
            modulo: modulo as ModuloAuditoria,
            ip,
            descripcion: `${accion} en ${entidad}`,
          })
          .catch((error: unknown) => {
            console.error('Error registrando auditoría:', error);
          });
      }),
    );
  }
}
