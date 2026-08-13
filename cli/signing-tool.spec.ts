import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  runKeygen,
  main,
  generarLicencia,
  renovarLicencia,
  revocarLicencia,
  signPayload,
  parseJsonArg,
} from './signing-tool';
import {
  generateEd25519Keypair,
  loadPrivateKeyFromPath,
  publicKeyFromRawBase64,
  signEd25519,
} from './ed25519-sign';
import { buildEd25519Payload } from '../src/modules/licencia/services/payload-builder';
import type { SignedLicenseArtifact } from './signing-tool';

const ENV_KEY = 'XILEF_SIGNING_PRIVATE_KEY_PATH';

const SPEC = {
  empresa_id: '1234567890-1',
  empresa_nombre: 'Mi Empresa S.A.',
  tipo: 'suscripcion_anual',
  fecha_inicio: '2026-01-01T00:00:00.000Z',
  fecha_vencimiento: '2027-01-01T00:00:00.000Z',
  max_usuarios: 10,
};

/**
 * Replica EXACTA de la verificación del cliente (`verifyEd25519` sobre
 * `buildEd25519Payload`): reconstruye el payload canónico v2 con los campos del
 * artefacto y verifica la firma con la clave pública. Demuestra que el artefacto
 * de la herramienta es aceptado por el backend cliente.
 */
function verifyArtifactSignature(
  artifact: SignedLicenseArtifact,
  publicKey: crypto.KeyObject,
): boolean {
  const payload = buildEd25519Payload({
    empresa_id: artifact.empresa_id,
    tipo: artifact.tipo,
    fecha_inicio: new Date(artifact.fecha_inicio),
    fecha_vencimiento: new Date(artifact.fecha_vencimiento),
    max_usuarios: artifact.max_usuarios,
    activa: artifact.activa,
    revocada: artifact.revocada,
  });
  return crypto.verify(
    null,
    Buffer.from(payload, 'utf8'),
    publicKey,
    Buffer.from(artifact.firma_ed25519, 'hex'),
  );
}

describe('signing-tool — keygen', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xilef-keygen-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env[ENV_KEY];
  });

  it('genera keypair, escribe PEM PKCS#8 (mode 0600) y devuelve la pública raw base64', () => {
    const keyPath = path.join(tmpDir, 'private.pem');
    process.env[ENV_KEY] = keyPath;

    const result = runKeygen();

    expect(result.privateKeyPath).toBe(keyPath);
    expect(result.publicKeyBase64).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

    const pem = fs.readFileSync(keyPath, 'utf8');
    expect(pem).toContain('-----BEGIN PRIVATE KEY-----');

    const mode = fs.statSync(keyPath).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('la clave pública emitida verifica una firma hecha con la privada escrita (round-trip)', () => {
    const keyPath = path.join(tmpDir, 'private.pem');
    process.env[ENV_KEY] = keyPath;

    const { publicKeyBase64 } = runKeygen();
    const privateKey = loadPrivateKeyFromPath(keyPath);
    const payload = 'payload-de-roundtrip';
    const signature = signEd25519(payload, privateKey);
    const publicKey = publicKeyFromRawBase64(publicKeyBase64);

    const ok = crypto.verify(
      null,
      Buffer.from(payload, 'utf8'),
      publicKey,
      Buffer.from(signature, 'hex'),
    );
    expect(ok).toBe(true);
  });

  it('main(["keygen"]) imprime la pública y sale con código 0', () => {
    const keyPath = path.join(tmpDir, 'private.pem');
    process.env[ENV_KEY] = keyPath;

    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const code = main(['keygen']);

    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('keygen sin XILEF_SIGNING_PRIVATE_KEY_PATH falla cerrado (código distinto de 0)', () => {
    delete process.env[ENV_KEY];

    const errSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const code = main(['keygen']);

    expect(code).not.toBe(0);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

describe('signing-tool — sign', () => {
  const FIELDS = {
    empresa_id: '1234567890-1',
    tipo: 'suscripcion_anual',
    fecha_inicio: '2026-01-01T00:00:00.000Z',
    fecha_vencimiento: '2027-01-01T00:00:00.000Z',
    max_usuarios: 10,
    activa: true,
    revocada: false,
  };

  it('firma el payload canónico v2 y la firma verifica con la pública', () => {
    const { publicKey, privateKey } = generateEd25519Keypair();
    const signature = signPayload(FIELDS, privateKey);
    expect(signature).toMatch(/^[0-9a-f]{128}$/i);

    const payload = buildEd25519Payload({
      empresa_id: FIELDS.empresa_id,
      tipo: FIELDS.tipo,
      fecha_inicio: new Date(FIELDS.fecha_inicio),
      fecha_vencimiento: new Date(FIELDS.fecha_vencimiento),
      max_usuarios: FIELDS.max_usuarios,
      activa: FIELDS.activa,
      revocada: FIELDS.revocada,
    });
    const ok = crypto.verify(
      null,
      Buffer.from(payload, 'utf8'),
      publicKey,
      Buffer.from(signature, 'hex'),
    );
    expect(ok).toBe(true);
  });

  it('es determinista (mismo payload + misma clave → firma idéntica)', () => {
    const { privateKey } = generateEd25519Keypair();
    expect(signPayload(FIELDS, privateKey)).toBe(
      signPayload(FIELDS, privateKey),
    );
  });
});

describe('signing-tool — generar', () => {
  it('produce artefacto con clave XILEF-XXXX y firma aceptada por el cliente', () => {
    const { publicKey, privateKey } = generateEd25519Keypair();
    const artifact = generarLicencia(SPEC, privateKey);

    expect(artifact.clave_activacion).toMatch(
      /^XILEF-[A-F0-9]{4}(-[A-F0-9]{4}){3}$/,
    );
    expect(artifact.version).toBe(2);
    expect(artifact.empresa_id).toBe(SPEC.empresa_id);
    expect(artifact.empresa_nombre).toBe(SPEC.empresa_nombre);
    expect(artifact.tipo).toBe(SPEC.tipo);
    expect(artifact.max_usuarios).toBe(SPEC.max_usuarios);
    expect(artifact.activa).toBe(true);
    expect(artifact.revocada).toBe(false);
    expect(artifact.fecha_inicio).toBe('2026-01-01T00:00:00.000Z');
    expect(artifact.fecha_vencimiento).toBe('2027-01-01T00:00:00.000Z');
    expect(artifact.firma_ed25519).toMatch(/^[0-9a-f]{128}$/i);
    expect(verifyArtifactSignature(artifact, publicKey)).toBe(true);
  });
});

describe('signing-tool — renovar', () => {
  it('actualiza fecha_vencimiento, conserva clave y re-firma válido', () => {
    const { publicKey, privateKey } = generateEd25519Keypair();
    const artifact = generarLicencia(SPEC, privateKey);

    const renovado = renovarLicencia(
      artifact,
      '2028-01-01T00:00:00.000Z',
      privateKey,
    );

    expect(renovado.clave_activacion).toBe(artifact.clave_activacion);
    expect(renovado.fecha_vencimiento).toBe('2028-01-01T00:00:00.000Z');
    expect(renovado.firma_ed25519).not.toBe(artifact.firma_ed25519);
    expect(verifyArtifactSignature(renovado, publicKey)).toBe(true);
    // La firma antigua ya NO es válida para el payload renovado.
    expect(
      verifyArtifactSignature(
        { ...renovado, firma_ed25519: artifact.firma_ed25519 },
        publicKey,
      ),
    ).toBe(false);
  });
});

describe('signing-tool — revocar', () => {
  it('marca revocada=true/activa=false, registra motivo y re-firma', () => {
    const { publicKey, privateKey } = generateEd25519Keypair();
    const artifact = generarLicencia(SPEC, privateKey);

    const revocado = revocarLicencia(artifact, 'impago', privateKey);

    expect(revocado.revocada).toBe(true);
    expect(revocado.activa).toBe(false);
    expect(revocado.motivo_revocacion).toBe('impago');
    expect(revocado.firma_ed25519).not.toBe(artifact.firma_ed25519);
    expect(verifyArtifactSignature(revocado, publicKey)).toBe(true);
  });
});

describe('signing-tool — parseJsonArg', () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xilef-jsonarg-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('parsea JSON inline', () => {
    expect(parseJsonArg('{"a":1}')).toEqual({ a: 1 });
  });

  it('lee un archivo JSON cuando el argumento es una ruta existente', () => {
    const file = path.join(tmpDir, 'spec.json');
    fs.writeFileSync(file, JSON.stringify({ empresa_id: '1' }), 'utf8');
    expect(parseJsonArg(file)).toEqual({ empresa_id: '1' });
  });
});

describe('signing-tool — main (integración)', () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xilef-main-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env[ENV_KEY];
  });

  function setupKey(): { keyPath: string; publicKeyBase64: string } {
    const keyPath = path.join(tmpDir, 'private.pem');
    process.env[ENV_KEY] = keyPath;
    const { publicKeyBase64 } = runKeygen();
    return { keyPath, publicKeyBase64 };
  }

  it('main(["sign", json]) imprime la firma hex y sale 0', () => {
    const { publicKeyBase64 } = setupKey();
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    const code = main([
      'sign',
      JSON.stringify({
        empresa_id: '1',
        tipo: 'perpetua',
        fecha_inicio: '2026-01-01T00:00:00.000Z',
        fecha_vencimiento: '2099-01-01T00:00:00.000Z',
        max_usuarios: 0,
        activa: true,
        revocada: false,
      }),
    ]);

    expect(code).toBe(0);
    const printed = (logSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(printed).toMatch(/^[0-9a-f]{128}$/i);
    logSpy.mockRestore();

    // La firma emitida verifica con la pública del keypair creado.
    const publicKey = publicKeyFromRawBase64(publicKeyBase64);
    const payload = buildEd25519Payload({
      empresa_id: '1',
      tipo: 'perpetua',
      fecha_inicio: new Date('2026-01-01T00:00:00.000Z'),
      fecha_vencimiento: new Date('2099-01-01T00:00:00.000Z'),
      max_usuarios: 0,
      activa: true,
      revocada: false,
    });
    expect(
      crypto.verify(
        null,
        Buffer.from(payload, 'utf8'),
        publicKey,
        Buffer.from(printed, 'hex'),
      ),
    ).toBe(true);
  });

  it('main(["generar", json]) imprime el artefacto JSON y sale 0', () => {
    setupKey();
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    const code = main(['generar', JSON.stringify(SPEC)]);

    expect(code).toBe(0);
    const printed = (logSpy.mock.calls[0]?.[0] as string) ?? '';
    const artifact = JSON.parse(printed) as SignedLicenseArtifact;
    expect(artifact.clave_activacion).toMatch(
      /^XILEF-[A-F0-9]{4}(-[A-F0-9]{4}){3}$/,
    );
    logSpy.mockRestore();
  });

  it('main(["generar", json]) sin clave privada falla cerrado (código != 0)', () => {
    delete process.env[ENV_KEY];
    const errSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const code = main(['generar', JSON.stringify(SPEC)]);

    expect(code).not.toBe(0);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
