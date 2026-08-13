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
 * version_firma = 2 → payload canónico v2 (ordenado, JSON, 7 campos, SIN
 *   hardware_id): { activa, empresa_id, fecha_inicio, fecha_vencimiento,
 *   max_usuarios, revocada, tipo }. Firmado por XILEF con Ed25519.
 * version_firma = 1 → payload canónico v1 (8 campos, con hardware_id) — HMAC,
 *   solo de referencia.
 * version_firma = 0 / undefined → payload legacy (pipe-separated)
 *   empresa_id|tipo|fecha_inicio|fecha_vencimiento (back-compat).
 */
export const FIRMA_VERSION_ACTUAL = 2;
export const FIRMA_VERSION_LEGACY = 0;

/**
 * Campos canónicos del payload v2 (7 campos, sin hardware_id).
 * El orden aquí es ilustrativo: la canonicalización ordena las keys en
 * `payload-builder.ts` (`canonicalStringify`).
 */
export const LICENCIA_ED25519_PAYLOAD_FIELDS = [
  'activa',
  'empresa_id',
  'fecha_inicio',
  'fecha_vencimiento',
  'max_usuarios',
  'revocada',
  'tipo',
] as const;

/**
 * Clave pública Ed25519 de XILEF (raw 32 bytes, base64). Es pública y segura
 * para distribuir. El cliente SOLO verifica; la clave privada vive únicamente
 * en la máquina de XILEF.
 *
 * DEV: clave de prueba generada para desarrollo. XILEF debe regenerar el
 * keypair de producción con `npm run sign -- keygen` y reemplazar este valor.
 *
 * Uso en verifyEd25519: reconstruir SPKI anteponiendo el prefijo Ed25519 fijo
 * `302a300506032b6570032100` y cargar con
 * `crypto.createPublicKey({ key, format: 'der', type: 'spki' })`.
 */
export const LICENCIA_ED25519_PUBLIC_KEY =
  'JnoxEB42azN5d3cGoEvQPMuYB13cYWXvDBHw3VlKeU0=';

export const NONCE_TTL_SEGUNDOS = 300;
