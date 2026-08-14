import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { App } from 'supertest/types';
import * as crypto from 'crypto';
import { LicenciaModule } from '../src/modules/licencia/licencia.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { buildEd25519Payload } from '../src/modules/licencia/services/payload-builder';

/**
 * E2E del controller de licencias tras el cutover Ed25519 (verify-only).
 *
 * Seeding: /generar fue removido (PR #2), así que en lugar de llamar al endpoint
 * de firma la suite genera un keypair Ed25519 en runtime, inyecta SU clave
 * pública vía `LICENCIA_ED25519_PUBLIC_KEY` (override soportado por
 * `LicenciaCryptoService.getPublicKey`) y firma el artefacto con la privada
 * local — simulando exactamente lo que hace la CLI de XILEF. `activar` crea el
 * registro por sí mismo (no requiere seed previo en Mongo). La privada nunca se
 * persiste ni se commitea.
 */
describe('LicenciaController (e2e)', () => {
  let app: INestApplication<App>;

  // Keypair de prueba generado en runtime (privada SOLO en memoria).
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const testPublicKeyRawB64 = Buffer.from(
    (publicKey.export({ format: 'jwk' }) as { x: string }).x,
    'base64url',
  ).toString('base64');

  // Identificadores únicos por corrida para que la suite sea re-ejecutable sin
  // colisionar con datos previos en la BD de test (nonce-replay, re-vinculación).
  const HEX = crypto.randomBytes(8).toString('hex').toUpperCase();
  const CLAVE = `XILEF-${HEX.slice(0, 4)}-${HEX.slice(4, 8)}-${HEX.slice(8, 12)}-${HEX.slice(12, 16)}`;
  const EMPRESA_ID = `E2E-${HEX}`;

  const FIELDS = {
    empresa_id: EMPRESA_ID,
    tipo: 'suscripcion_anual',
    fecha_inicio: '2026-01-01T00:00:00.000Z',
    fecha_vencimiento: '2099-01-01T00:00:00.000Z',
    max_usuarios: 10,
    clave_activacion: CLAVE,
    empresa_nombre: 'Test Corp',
    hardware_id: `e2e-hardware-${HEX}`,
  };

  /**
   * Firma el payload canónico v2 con la privada de prueba, replicando la firma
   * de XILEF. El cliente reconstruye el mismo payload con activa=true y
   * revocada=false (hardcodeado en activarLicencia) y verifica con la pública.
   */
  const signPayload = (): string => {
    const payload = buildEd25519Payload({
      empresa_id: FIELDS.empresa_id,
      tipo: FIELDS.tipo as 'suscripcion_anual',
      fecha_inicio: new Date(FIELDS.fecha_inicio),
      fecha_vencimiento: new Date(FIELDS.fecha_vencimiento),
      max_usuarios: FIELDS.max_usuarios,
      activa: true,
      revocada: false,
    });
    return crypto
      .sign(null, Buffer.from(payload, 'utf8'), privateKey)
      .toString('hex');
  };

  beforeAll(async () => {
    // Override de la clave pública Ed25519 antes de app.init().
    process.env.LICENCIA_ED25519_PUBLIC_KEY = testPublicKeyRawB64;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            uri:
              configService.get<string>('MONGODB_URI') ||
              'mongodb://localhost:27017/xilef_test',
          }),
          inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
        LicenciaModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    delete process.env.LICENCIA_ED25519_PUBLIC_KEY;
    if (app) {
      await app.close();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: POST /licencia/activar (público, verify-only, rate limited)
  // ═══════════════════════════════════════════════════════════════
  describe('POST /licencia/activar', () => {
    it('should activate a valid XILEF-signed license (Ed25519)', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: FIELDS.clave_activacion,
          empresa_nombre: FIELDS.empresa_nombre,
          empresa_id: FIELDS.empresa_id,
          nonce: `e2e-valid-${HEX}`,
          hardware_id: FIELDS.hardware_id,
          tipo: FIELDS.tipo,
          fecha_inicio: FIELDS.fecha_inicio,
          fecha_vencimiento: FIELDS.fecha_vencimiento,
          max_usuarios: FIELDS.max_usuarios,
          firma_ed25519: signPayload(),
        })
        .expect(200)
        .expect((res) => {
          const body = res.body as { valida: boolean; empresa?: string };
          expect(body.valida).toBe(true);
          expect(body.empresa).toBe(FIELDS.empresa_nombre);
        });
    });

    it('should reject a forged Ed25519 signature (400)', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: FIELDS.clave_activacion,
          empresa_nombre: FIELDS.empresa_nombre,
          empresa_id: FIELDS.empresa_id,
          nonce: `e2e-forged-${HEX}`,
          hardware_id: FIELDS.hardware_id,
          tipo: FIELDS.tipo,
          fecha_inicio: FIELDS.fecha_inicio,
          fecha_vencimiento: FIELDS.fecha_vencimiento,
          max_usuarios: FIELDS.max_usuarios,
          firma_ed25519: 'a'.repeat(128),
        })
        .expect(400);
    });

    it('should reject an invalid key format (400)', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: 'INVALID',
          empresa_nombre: FIELDS.empresa_nombre,
          empresa_id: FIELDS.empresa_id,
          nonce: `e2e-format-${HEX}`,
          hardware_id: FIELDS.hardware_id,
          tipo: FIELDS.tipo,
          fecha_inicio: FIELDS.fecha_inicio,
          fecha_vencimiento: FIELDS.fecha_vencimiento,
          max_usuarios: FIELDS.max_usuarios,
          firma_ed25519: signPayload(),
        })
        .expect(400);
    });

    it('should reject non-whitelisted fields (400)', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: FIELDS.clave_activacion,
          empresa_nombre: FIELDS.empresa_nombre,
          empresa_id: FIELDS.empresa_id,
          nonce: `e2e-whitelist-${HEX}`,
          hardware_id: FIELDS.hardware_id,
          tipo: FIELDS.tipo,
          fecha_inicio: FIELDS.fecha_inicio,
          fecha_vencimiento: FIELDS.fecha_vencimiento,
          max_usuarios: FIELDS.max_usuarios,
          firma_ed25519: signPayload(),
          campo_malicioso: 'DROP TABLE licencias;',
        })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: POST /licencia/validar-clave (público)
  // ═══════════════════════════════════════════════════════════════
  describe('POST /licencia/validar-clave', () => {
    it('should accept a valid key format', () => {
      return request(app.getHttpServer())
        .post('/licencia/validar-clave')
        .send({ clave: FIELDS.clave_activacion })
        .expect(200)
        .expect((res) => {
          const body = res.body as { formato_valido: boolean };
          expect(body.formato_valido).toBe(true);
        });
    });

    it('should reject an invalid key format', () => {
      return request(app.getHttpServer())
        .post('/licencia/validar-clave')
        .send({ clave: 'INVALID-KEY' })
        .expect(200)
        .expect((res) => {
          const body = res.body as { formato_valido: boolean };
          expect(body.formato_valido).toBe(false);
        });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: GET /licencia/public/estado (público)
  // ═══════════════════════════════════════════════════════════════
  describe('GET /licencia/public/estado', () => {
    it('should report the activated license as valid', () => {
      return request(app.getHttpServer())
        .get(`/licencia/public/estado?clave=${FIELDS.clave_activacion}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as { valida: boolean; vigente: boolean };
          expect(body.valida).toBe(true);
          expect(body.vigente).toBe(true);
        });
    });

    it('should report an unknown key as invalid', () => {
      return request(app.getHttpServer())
        .get('/licencia/public/estado?clave=XILEF-DEAD-BEEF-CAFE-BABE')
        .expect(200)
        .expect((res) => {
          const body = res.body as { valida: boolean; vigente: boolean };
          expect(body.valida).toBe(false);
          expect(body.vigente).toBe(false);
        });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: GET /licencia/estado (requiere JWT)
  // ═══════════════════════════════════════════════════════════════
  describe('GET /licencia/estado', () => {
    it('should return 401 without authorization token', () => {
      return request(app.getHttpServer()).get('/licencia/estado').expect(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: Endpoints de firma removidos (ya no existen → 404)
  // ═══════════════════════════════════════════════════════════════
  describe('Removed signing endpoints', () => {
    it('POST /licencia/generar should return 404', () => {
      return request(app.getHttpServer())
        .post('/licencia/generar')
        .send({
          empresa_nombre: 'Test Corp',
          empresa_id: 'E2E-TEST',
          tipo: 'suscripcion_anual',
        })
        .expect(404);
    });

    it('POST /licencia/renovar should return 404', () => {
      return request(app.getHttpServer())
        .post('/licencia/renovar')
        .send({ empresa_id: 'TEST', dias: 365 })
        .expect(404);
    });

    it('POST /licencia/revocar/:empresaId should return 404', () => {
      return request(app.getHttpServer())
        .post('/licencia/revocar/TEST-EMPRESA')
        .send({ motivo: 'test' })
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: Endpoints protegidos (admin) — requieren JWT
  // ═══════════════════════════════════════════════════════════════
  describe('Protected admin endpoints security', () => {
    it('GET /licencia should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/licencia').expect(401);
    });

    it('GET /licencia/admin/auditoria should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/licencia/admin/auditoria')
        .expect(401);
    });

    it('GET /licencia/:empresaId should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get(`/licencia/${FIELDS.empresa_id}`)
        .expect(401);
    });
  });
});
