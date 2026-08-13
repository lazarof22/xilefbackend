import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runKeygen, main } from './signing-tool';
import {
  loadPrivateKeyFromPath,
  publicKeyFromRawBase64,
  signEd25519,
} from './ed25519-sign';

const ENV_KEY = 'XILEF_SIGNING_PRIVATE_KEY_PATH';

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

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
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
