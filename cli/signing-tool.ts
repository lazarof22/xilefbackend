import * as fs from 'fs';
import { generateEd25519Keypair, privateKeyToPkcs8Pem, publicKeyToRawBase64 } from './ed25519-sign';

/**
 * Herramienta de firma de licencias de XILEF (CLI standalone).
 *
 * Corre SOLO en la máquina de XILEF, que posee la clave privada Ed25519. El
 * backend cliente es verify-only: nunca importa este archivo.
 *
 * Comandos:
 *   keygen   — genera un keypair Ed25519, imprime la pública y escribe la privada.
 *   sign     — firma un payload canónico v2 y emite la firma hex (128 chars).
 *   generar  — crea una licencia firmada (clave XILEF-XXXX + artefacto).
 *   renovar  — actualiza fecha_vencimiento de una licencia y re-firma.
 *   revocar  — marca revocada=true y re-firma.
 *
 * La clave privada se carga desde el archivo indicado en la variable de entorno
 * `XILEF_SIGNING_PRIVATE_KEY_PATH` (solo en la máquina de XILEF, nunca en repo).
 */

const ENV_PRIVATE_KEY_PATH = 'XILEF_SIGNING_PRIVATE_KEY_PATH';

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

/**
 * `keygen`: genera un keypair Ed25519, escribe la clave privada en
 * `XILEF_SIGNING_PRIVATE_KEY_PATH` (PEM PKCS#8, mode 0600) y devuelve la clave
 * pública raw base64 para embeber en las constantes del cliente.
 */
export function runKeygen(): { publicKeyBase64: string; privateKeyPath: string } {
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
 * Punto de entrada de la CLI. `argv` son los argumentos tras `node` y el script
 * (i.e. `process.argv.slice(2)`). Retorna el código de salida (0 ok, !=0 error).
 */
export function main(argv: string[]): number {
  const command = argv[0];

  try {
    switch (command) {
      case 'keygen': {
        const result = runKeygen();
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(result, null, 2));
        return 0;
      }
      default: {
        // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.error(`Error: ${(error as Error).message}`);
    return 1;
  }
}

// Ejecuta la CLI solo cuando se invoca directamente (no bajo import/test).
if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
