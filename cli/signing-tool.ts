import * as crypto from 'crypto';
import * as fs from 'fs';
import {
  generateEd25519Keypair,
  loadPrivateKeyFromPath,
  privateKeyToPkcs8Pem,
  publicKeyToRawBase64,
  signEd25519,
} from './ed25519-sign';
import { generateLicenciaKey } from '../src/modules/licencia/utils/licencia-key.util';
import { buildEd25519Payload } from '../src/modules/licencia/services/payload-builder';

/**
 * Herramienta de firma de licencias de XILEF (CLI standalone).
 *
 * Corre SOLO en la máquina de XILEF, que posee la clave privada Ed25519. El
 * backend cliente es verify-only: nunca importa este archivo. Comparte los
 * módulos puros de `src/` (`payload-builder`, `licencia-key.util`) para
 * garantizar bytes canónicos idénticos a los que el cliente verifica.
 *
 * Comandos:
 *   keygen   — genera un keypair Ed25519, imprime la pública y escribe la privada.
 *   sign     — firma un payload canónico v2 y emite la firma hex (128 chars).
 *   generar  — crea una licencia firmada (clave XILEF-XXXX + artefacto).
 *   renovar  — actualiza fecha_vencimiento de una licencia y re-firma.
 *   revocar  — marca revocada=true (activa=false) y re-firma.
 *
 * La clave privada se carga desde el archivo indicado en la variable de entorno
 * `XILEF_SIGNING_PRIVATE_KEY_PATH` (solo en la máquina de XILEF, nunca en repo).
 */

const ENV_PRIVATE_KEY_PATH = 'XILEF_SIGNING_PRIVATE_KEY_PATH';

/** Especificación de entrada de `generar`. */
export interface GenerarSpec {
  empresa_id: string;
  empresa_nombre?: string;
  tipo: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  max_usuarios?: number;
}

/** Artefacto de licencia firmado (formato entregado al cliente). */
export interface SignedLicenseArtifact {
  version: number;
  clave_activacion: string;
  empresa_id: string;
  empresa_nombre: string;
  tipo: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  max_usuarios: number;
  activa: boolean;
  revocada: boolean;
  motivo_revocacion?: string;
  firma_ed25519: string;
}

/** Campos firmados (payload canónico v2) que recibe el comando `sign`. */
export interface SignPayloadInput {
  empresa_id: string;
  tipo: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  max_usuarios?: number;
  activa?: boolean;
  revocada?: boolean;
}

function getPrivateKeyPath(): string {
  const keyPath = process.env[ENV_PRIVATE_KEY_PATH];
  if (!keyPath) {
    throw new Error(
      `Variable de entorno ${ENV_PRIVATE_KEY_PATH} no configurada. ` +
        'Defina la ruta del archivo PEM de la clave privada de XILEF.',
    );
  }
  return keyPath;
}

/** Carga la clave privada Ed25519 de XILEF desde el archivo de entorno. */
export function loadSigningPrivateKey(): crypto.KeyObject {
  return loadPrivateKeyFromPath(getPrivateKeyPath());
}

/** Normaliza una fecha ISO 8601 a su representación canónica UTC. */
function normalizeIso(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Fecha inválida: "${iso}" (se espera ISO 8601)`);
  }
  return date.toISOString();
}

/**
 * `keygen`: genera un keypair Ed25519, escribe la clave privada en
 * `XILEF_SIGNING_PRIVATE_KEY_PATH` (PEM PKCS#8, mode 0600) y devuelve la clave
 * pública raw base64 para embeber en las constantes del cliente.
 */
export function runKeygen(): {
  publicKeyBase64: string;
  privateKeyPath: string;
} {
  const privateKeyPath = getPrivateKeyPath();
  const { publicKey, privateKey } = generateEd25519Keypair();
  fs.writeFileSync(privateKeyPath, privateKeyToPkcs8Pem(privateKey), {
    mode: 0o600,
  });
  return {
    publicKeyBase64: publicKeyToRawBase64(publicKey),
    privateKeyPath,
  };
}

/**
 * `sign`: firma el payload canónico v2 de los campos dados y retorna la firma
 * hex (128 chars). Determinista: misma clave + mismos campos → misma firma.
 */
export function signPayload(
  input: SignPayloadInput,
  privateKey: crypto.KeyObject,
): string {
  const payload = buildEd25519Payload({
    empresa_id: input.empresa_id,
    tipo: input.tipo,
    fecha_inicio: new Date(normalizeIso(input.fecha_inicio)),
    fecha_vencimiento: new Date(normalizeIso(input.fecha_vencimiento)),
    max_usuarios: input.max_usuarios ?? 0,
    activa: input.activa ?? true,
    revocada: input.revocada ?? false,
  });
  return signEd25519(payload, privateKey);
}

/**
 * `generar`: crea una licencia firmada. Genera la clave `XILEF-XXXX-...`,
 * firma el payload canónico v2 (activa=true, revocada=false) y retorna el
 * artefacto listo para entregar al cliente (aceptado por `activar`).
 */
export function generarLicencia(
  spec: GenerarSpec,
  privateKey: crypto.KeyObject,
): SignedLicenseArtifact {
  const fechaInicio = normalizeIso(spec.fecha_inicio);
  const fechaVencimiento = normalizeIso(spec.fecha_vencimiento);
  const maxUsuarios = spec.max_usuarios ?? 0;

  const claveActivacion = generateLicenciaKey(
    spec.empresa_id,
    spec.tipo,
    new Date(fechaVencimiento),
  );
  const firma = signEd25519(
    buildEd25519Payload({
      empresa_id: spec.empresa_id,
      tipo: spec.tipo,
      fecha_inicio: new Date(fechaInicio),
      fecha_vencimiento: new Date(fechaVencimiento),
      max_usuarios: maxUsuarios,
      activa: true,
      revocada: false,
    }),
    privateKey,
  );

  return {
    version: 2,
    clave_activacion: claveActivacion,
    empresa_id: spec.empresa_id,
    empresa_nombre: spec.empresa_nombre ?? '',
    tipo: spec.tipo,
    fecha_inicio: fechaInicio,
    fecha_vencimiento: fechaVencimiento,
    max_usuarios: maxUsuarios,
    activa: true,
    revocada: false,
    firma_ed25519: firma,
  };
}

/**
 * `renovar`: lee una licencia existente, actualiza `fecha_vencimiento` y
 * re-firma. Conserva la `clave_activacion` (misma identidad en el cliente) y el
 * resto de campos firmados; la firma antigua deja de ser válida para el payload
 * renovado.
 */
export function renovarLicencia(
  artifact: SignedLicenseArtifact,
  nuevaFechaVencimiento: string,
  privateKey: crypto.KeyObject,
): SignedLicenseArtifact {
  const fechaVencimiento = normalizeIso(nuevaFechaVencimiento);
  const firma = signEd25519(
    buildEd25519Payload({
      empresa_id: artifact.empresa_id,
      tipo: artifact.tipo,
      fecha_inicio: new Date(artifact.fecha_inicio),
      fecha_vencimiento: new Date(fechaVencimiento),
      max_usuarios: artifact.max_usuarios,
      activa: true,
      revocada: false,
    }),
    privateKey,
  );

  return {
    ...artifact,
    fecha_vencimiento: fechaVencimiento,
    activa: true,
    revocada: false,
    firma_ed25519: firma,
  };
}

/**
 * `revocar`: marca la licencia `revocada=true` (y `activa=false`), registra el
 * motivo y re-firma. El artefacto resultante se entrega físicamente al cliente
 * para que invalide la licencia localmente.
 */
export function revocarLicencia(
  artifact: SignedLicenseArtifact,
  motivo: string,
  privateKey: crypto.KeyObject,
): SignedLicenseArtifact {
  const firma = signEd25519(
    buildEd25519Payload({
      empresa_id: artifact.empresa_id,
      tipo: artifact.tipo,
      fecha_inicio: new Date(artifact.fecha_inicio),
      fecha_vencimiento: new Date(artifact.fecha_vencimiento),
      max_usuarios: artifact.max_usuarios,
      activa: false,
      revocada: true,
    }),
    privateKey,
  );

  return {
    ...artifact,
    activa: false,
    revocada: true,
    motivo_revocacion: motivo,
    firma_ed25519: firma,
  };
}

/**
 * Lee un argumento JSON: si es una ruta a un archivo existente, lee y parsea el
 * archivo; si no, lo interpreta como JSON inline.
 */
export function parseJsonArg(arg: string): unknown {
  if (!arg) {
    throw new Error('Falta el argumento JSON (o ruta de archivo) requerido');
  }
  if (fs.existsSync(arg)) {
    return JSON.parse(fs.readFileSync(arg, 'utf8'));
  }
  return JSON.parse(arg);
}

/**
 * Punto de entrada de la CLI. `argv` son los argumentos tras `node` y el script
 * (i.e. `process.argv.slice(2)`). Retorna el código de salida (0 ok, !=0 error).
 */
export function main(argv: string[]): number {
  const command = argv[0];

  try {
    switch (command) {
      case 'keygen': {
        const result = runKeygen();
        console.log(JSON.stringify(result, null, 2));
        return 0;
      }
      case 'sign': {
        const input = parseJsonArg(argv[1]) as SignPayloadInput;
        const signature = signPayload(input, loadSigningPrivateKey());
        console.log(signature);
        return 0;
      }
      case 'generar': {
        const spec = parseJsonArg(argv[1]) as GenerarSpec;
        const artifact = generarLicencia(spec, loadSigningPrivateKey());
        console.log(JSON.stringify(artifact, null, 2));
        return 0;
      }
      case 'renovar': {
        const artifact = parseJsonArg(argv[1]) as SignedLicenseArtifact;
        if (!argv[2]) {
          throw new Error(
            'renovar requiere la nueva fecha de vencimiento (ISO 8601)',
          );
        }
        const updated = renovarLicencia(
          artifact,
          argv[2],
          loadSigningPrivateKey(),
        );
        console.log(JSON.stringify(updated, null, 2));
        return 0;
      }
      case 'revocar': {
        const artifact = parseJsonArg(argv[1]) as SignedLicenseArtifact;
        const updated = revocarLicencia(
          artifact,
          argv[2] ?? '',
          loadSigningPrivateKey(),
        );
        console.log(JSON.stringify(updated, null, 2));
        return 0;
      }
      default: {
        console.error(
          `Comando desconocido: "${command ?? ''}". ` +
            'Uso: keygen | sign <payload-json-or-file> | generar <empresa-json> | ' +
            'renovar <artifact-json-or-file> <nueva-fecha-vencimiento> | ' +
            'revocar <artifact-json-or-file> [motivo]',
        );
        return 1;
      }
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    return 1;
  }
}

// Ejecuta la CLI solo cuando se invoca directamente (no bajo import/test).
if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
