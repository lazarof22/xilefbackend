import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { LicenciaModule } from '../src/modules/licencia/licencia.module';
import { AuthModule } from '../src/modules/auth/auth.module';

describe('LicenciaController (e2e)', () => {
  let app: INestApplication<App>;
  let generatedKey = '';

  beforeAll(async () => {
    process.env.LICENSE_SECRET_KEY = 'e2e-test-secret-key-minimum-32-chars!!';
    process.env.LICENSE_SIGN_SECRET = 'e2e-test-sign-secret-minimum-32-chars!';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/xilef_test',
          }),
          inject: [ConfigService],
        }),
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
    if (app) {
      await app.close();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: POST /licencia/validar-clave (público)
  // ═══════════════════════════════════════════════════════════════
  describe('POST /licencia/validar-clave', () => {
    it('should accept valid key format', () => {
      return request(app.getHttpServer())
        .post('/licencia/validar-clave')
        .send({ clave: 'XILEF-A1B2-C3D4-E5F6-F7A8' })
        .expect(200)
        .expect((res) => {
          expect(res.body.formato_valido).toBe(true);
        });
    });

    it('should reject invalid key format', () => {
      return request(app.getHttpServer())
        .post('/licencia/validar-clave')
        .send({ clave: 'INVALID-KEY' })
        .expect(200)
        .expect((res) => {
          expect(res.body.formato_valido).toBe(false);
        });
    });

    it('should reject key with wrong number of segments', () => {
      return request(app.getHttpServer())
        .post('/licencia/validar-clave')
        .send({ clave: 'XILEF-AAAA-BBBB-CCCC' })
        .expect(200)
        .expect((res) => {
          expect(res.body.formato_valido).toBe(false);
        });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: POST /licencia/activar (público, rate limited)
  // ═══════════════════════════════════════════════════════════════
  describe('POST /licencia/activar', () => {
    it('should reject invalid key format', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: 'INVALID',
          empresa_nombre: 'Test Corp',
          empresa_id: 'E2E-001',
        })
        .expect(400);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({})
        .expect(400);
    });

    it('should return 404 for non-existent license key', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: 'XILEF-DEAD-BEEF-CAFE-BABE',
          empresa_nombre: 'Test Corp',
          empresa_id: 'E2E-002',
        })
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: GET /licencia/estado (requiere JWT)
  // ═══════════════════════════════════════════════════════════════
  describe('GET /licencia/estado', () => {
    it('should return 401 without authorization token', () => {
      return request(app.getHttpServer())
        .get('/licencia/estado')
        .expect(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: POST /licencia/generar (solo admin)
  // ═══════════════════════════════════════════════════════════════
  describe('POST /licencia/generar', () => {
    it('should return 401 without authorization', () => {
      return request(app.getHttpServer())
        .post('/licencia/generar')
        .send({
          empresa_nombre: 'Test Corp',
          empresa_id: 'E2E-TEST',
          tipo: 'suscripcion_anual',
        })
        .expect(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: Endpoints que requieren autenticación
  // ═══════════════════════════════════════════════════════════════
  describe('Protected endpoints security', () => {
    it('POST /licencia/renovar should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/licencia/renovar')
        .send({ empresa_id: 'TEST', dias: 365 })
        .expect(401);
    });

    it('POST /licencia/revocar/:empresaId should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/licencia/revocar/TEST-EMPRESA')
        .send({ motivo: 'test' })
        .expect(401);
    });

    it('GET /licencia should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/licencia')
        .expect(401);
    });

    it('GET /licencia/admin/auditoria should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/licencia/admin/auditoria')
        .expect(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: Rate limiting en endpoint público
  // ═══════════════════════════════════════════════════════════════
  describe('Rate limiting on POST /licencia/activar', () => {
    it('should accept requests under rate limit', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: 'XILEF-1234-5678-9ABC-DEF0',
          empresa_nombre: 'Test',
          empresa_id: 'RATE-TEST',
        })
        .expect((res) => {
          expect([404, 400]).toContain(res.status);
        });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST: Validación DTO (ValidationPipe)
  // ═══════════════════════════════════════════════════════════════
  describe('DTO Validation', () => {
    it('should reject non-whitelisted fields on activar', () => {
      return request(app.getHttpServer())
        .post('/licencia/activar')
        .send({
          clave_activacion: 'XILEF-1234-5678-9ABC-DEF0',
          empresa_nombre: 'Test',
          empresa_id: 'DTO-TEST',
          campo_malicioso: 'DROP TABLE licencias;',
        })
        .expect(400);
    });

    it('should reject invalid tipo on generar (auth required first)', () => {
      return request(app.getHttpServer())
        .post('/licencia/generar')
        .send({
          empresa_nombre: 'Test',
          empresa_id: 'DTO-TEST-2',
          tipo: 'tipo_invalido',
        })
        .expect(401);
    });
  });
});
