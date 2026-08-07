export const LICENCIA_PREFIX = 'XILEF';

export const GRACE_PERIOD_DAYS = 7;

export const LICENCIA_TIPOS = [
  'trial',
  'suscripcion_mensual',
  'suscripcion_anual',
  'perpetua',
] as const;

export type LicenciaTipo = (typeof LICENCIA_TIPOS)[number];

export const LICENCIA_DURACIONES: Record<LicenciaTipo, number> = {
  trial: 30,
  suscripcion_mensual: 30,
  suscripcion_anual: 365,
  perpetua: Number.MAX_SAFE_INTEGER,
};

export const LICENCIA_FORMAT_REGEX =
  /^XILEF-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;

export const HARDWARE_FINGERPRINT_FIELDS = [
  'platform',
  'hostname',
  'cpus',
] as const;

export const NONCE_EXPIRATION_MS = 5 * 60 * 1000;

export const LICENCIA_AUDIT_ACCIONES = [
  'activacion',
  'verificacion',
  'renovacion',
  'revocacion',
  'rechazo',
  'generacion',
  'firma-legacy',
  'skew',
] as const;

export type LicenciaAuditAccion = (typeof LICENCIA_AUDIT_ACCIONES)[number];

export const THROTTLE_LIMIT = 5;
export const THROTTLE_TTL = 15 * 60 * 1000;

/**
 * version_firma = 1 → payload canónico (ordenado, JSON) con
 *   { activa, empresa_id, fecha_inicio, fecha_vencimiento, hardware_id,
 *     max_usuarios, revocada, tipo }.
 * version_firma = 0 / undefined → payload legacy (pipe-separated)
 *   empresa_id|tipo|fecha_inicio|fecha_vencimiento (back-compat).
 */
export const FIRMA_VERSION_ACTUAL = 1;
export const FIRMA_VERSION_LEGACY = 0;

export const NONCE_TTL_SEGUNDOS = 300;
