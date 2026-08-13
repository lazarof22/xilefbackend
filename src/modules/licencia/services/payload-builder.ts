/**
 * Constructores canónicos de payload de licencia — puros y sin DI/env.
 *
 * Compartidos por el backend cliente (`src/`) y la CLI de firma de XILEF
 * (`cli/`) para garantizar que ambos produzcan bytes idénticos ante el mismo
 * estado lógico. No dependen de NestJS ni de variables de entorno.
 */

export interface LicenciaPayloadFields {
  empresa_id: string;
  tipo: string;
  fecha_inicio: Date;
  fecha_vencimiento: Date;
  max_usuarios?: number;
  hardware_id?: string;
  activa?: boolean;
  revocada?: boolean;
}

function canonicalStringify(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload).sort();
  const sorted: Record<string, unknown> = {};
  for (const k of keys) sorted[k] = payload[k];
  return JSON.stringify(sorted);
}

/**
 * Payload canónico de integridad versión 1 (8 campos, con `hardware_id`).
 * Solo de referencia: el flujo v1 (HMAC) queda inalcanzable tras el cutover.
 */
export function buildIntegrityPayload(datos: LicenciaPayloadFields): string {
  const payload: Record<string, unknown> = {
    activa: datos.activa,
    empresa_id: datos.empresa_id,
    fecha_inicio: datos.fecha_inicio.toISOString(),
    fecha_vencimiento: datos.fecha_vencimiento.toISOString(),
    hardware_id: datos.hardware_id ?? '',
    max_usuarios: datos.max_usuarios ?? 0,
    revocada: datos.revocada ?? false,
    tipo: datos.tipo,
  };
  return canonicalStringify(payload);
}

/**
 * Payload canónico versión 2 (7 campos, SIN `hardware_id`).
 * Firmado por XILEF con Ed25519; el cliente solo verifica.
 */
export function buildEd25519Payload(
  datos: Omit<LicenciaPayloadFields, 'hardware_id'>,
): string {
  const payload: Record<string, unknown> = {
    activa: datos.activa,
    empresa_id: datos.empresa_id,
    fecha_inicio: datos.fecha_inicio.toISOString(),
    fecha_vencimiento: datos.fecha_vencimiento.toISOString(),
    max_usuarios: datos.max_usuarios ?? 0,
    revocada: datos.revocada ?? false,
    tipo: datos.tipo,
  };
  return canonicalStringify(payload);
}

/**
 * Payload legacy (versión 0) para back-compat con licencias existentes.
 * Formato pipe-separated. Solo de referencia.
 */
export function buildLegacyIntegrityPayload(datos: {
  empresa_id: string;
  tipo: string;
  fecha_inicio: Date;
  fecha_vencimiento: Date;
}): string {
  return `${datos.empresa_id}|${datos.tipo}|${datos.fecha_inicio.toISOString()}|${datos.fecha_vencimiento.toISOString()}`;
}

/**
 * Despacha según `version_firma`:
 *   undefined / 0 → legacy (pipe)
 *   1             → canónico v1 (8 campos, HMAC)
 *   2             → canónico v2 (7 campos, Ed25519)
 */
export function buildPayloadForVersion(
  version: number | undefined,
  datos: LicenciaPayloadFields,
): string {
  if (version === undefined || version === 0) {
    return buildLegacyIntegrityPayload(datos);
  }
  if (version === 2) {
    return buildEd25519Payload(datos);
  }
  return buildIntegrityPayload(datos);
}
