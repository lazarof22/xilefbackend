import { LicenciaTipo, LicenciaAuditAccion } from '../constants/licencia.constants';

export interface LicenciaIntegrityData {
  empresa_id: string;
  tipo: string;
  fecha_inicio: Date;
  fecha_vencimiento: Date;
}

export interface LicenciaGeneradaResponse {
  mensaje: string;
  licencia: {
    clave: string;
    empresa: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
    dias_restantes: number;
    max_usuarios: number;
  };
}

export interface LicenciaActivadaResponse {
  mensaje: string;
  valida: boolean;
  vigente: boolean;
  dias_restantes: number;
  tipo: string;
  empresa: string;
  fecha_vencimiento: Date;
}

export interface EstadoLicenciaResponse {
  valida: boolean;
  vigente: boolean;
  dias_restantes: number;
  tipo: string | null;
  empresa: string | null;
  fecha_vencimiento: Date | null;
  max_usuarios: number;
}

export interface LicenciaRenovadaResponse {
  mensaje: string;
  licencia: {
    empresa: string;
    tipo: string;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
    dias_restantes: number;
  };
}

export interface EstadoPublicoResponse {
  valida: boolean;
  vigente: boolean;
  dias_restantes: number;
  tipo: string | null;
  empresa: string | null;
  empresa_id: string | null;
  fecha_inicio: Date | null;
  fecha_vencimiento: Date | null;
  max_usuarios: number;
  activa: boolean;
  revocada: boolean;
}

export interface AuthenticatedRequest {
  user?: {
    empresa_id?: string;
    correo_empleado?: string;
    rol?: string;
    nombre_empleado?: string;
    sub?: string;
  };
  query?: {
    empresa_id?: string;
  };
  body?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
  licenciaEstado?: EstadoLicenciaResponse;
}

export interface FormatoClaveResponse {
  formato_valido: boolean;
}

export interface RevocarResponse {
  mensaje: string;
}
