import { Expose, plainToInstance } from 'class-transformer';
import type { LicenciaDocument } from '../schemas/licencia.schema';
import type { EstadoLicenciaResponse } from '../types/licencia.types';

/**
 * Respuesta para admin: omite los campos sensibles (clave_activacion_encriptada,
 * firma_hmac, clave_hash, hardware_id). Incluye todo lo demás necesario para
 * auditoría y gestión.
 */
export class LicenciaAdminResponseDto {
  @Expose() _id: unknown;
  @Expose() empresa_nombre: string;
  @Expose() empresa_id: string;
  @Expose() tipo: string;
  @Expose() fecha_inicio: Date;
  @Expose() fecha_vencimiento: Date;
  @Expose() activa: boolean;
  @Expose() revocada: boolean;
  @Expose() motivo_revocacion?: string;
  @Expose() dias_restantes: number;
  @Expose() max_usuarios: number;
  @Expose() ultima_verificacion?: Date;
  @Expose() ultima_verificacion_efectiva?: Date;
  @Expose() skew_detectado?: boolean;
  @Expose() version_firma?: number;
  @Expose() requiere_re_firma?: boolean;
  @Expose() metadata?: Record<string, unknown>;
  @Expose() createdAt?: Date;
  @Expose() updatedAt?: Date;

  static fromDocument(doc: LicenciaDocument): LicenciaAdminResponseDto {
    return plainToInstance(LicenciaAdminResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}

/**
 * Respuesta para usuarios no-admin: solo info necesaria para mostrar en UI.
 * Sin firma, sin clave, sin hardware, sin empresa_id.
 */
export class LicenciaUserResponseDto {
  @Expose() valida: boolean;
  @Expose() vigente: boolean;
  @Expose() dias_restantes: number;
  @Expose() tipo: string | null;
  @Expose() fecha_vencimiento: Date | null;

  static fromEstado(estado: EstadoLicenciaResponse): LicenciaUserResponseDto {
    return plainToInstance(LicenciaUserResponseDto, estado, {
      excludeExtraneousValues: true,
    });
  }
}
