import { Test, TestingModule } from '@nestjs/testing';
import { LicenciaController } from './licencia.controller';
import { LicenciaService } from './licencia.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LicenciaTipo } from './constants/licencia.constants';
import { APP_GUARD } from '@nestjs/core';

describe('LicenciaController', () => {
  let controller: LicenciaController;
  let mockLicenciaService: any;

  beforeEach(async () => {
    mockLicenciaService = {
      generateLicencia: jest.fn().mockResolvedValue({
        mensaje: 'Licencia generada exitosamente',
        licencia: {
          clave: 'XILEF-A1B2-C3D4-E5F6-F7A8',
          empresa: 'Test Corp',
          tipo: 'suscripcion_anual',
          fecha_inicio: new Date(),
          fecha_vencimiento: new Date(),
          dias_restantes: 365,
          max_usuarios: 10,
        },
      }),
      activarLicencia: jest.fn().mockResolvedValue({
        mensaje: 'Licencia activada exitosamente',
        valida: true,
        vigente: true,
        dias_restantes: 365,
        tipo: 'suscripcion_anual',
        empresa: 'Test Corp',
        fecha_vencimiento: new Date(),
      }),
      verificarEstado: jest.fn().mockResolvedValue({
        valida: true,
        vigente: true,
        dias_restantes: 100,
        tipo: 'suscripcion_anual',
        empresa: 'Test Corp',
        fecha_vencimiento: new Date(),
        max_usuarios: 10,
      }),
      renovarLicencia: jest.fn().mockResolvedValue({
        mensaje: 'Licencia renovada exitosamente',
        licencia: {
          empresa: 'Test Corp',
          tipo: 'suscripcion_anual',
          fecha_inicio: new Date(),
          fecha_vencimiento: new Date(),
          dias_restantes: 365,
        },
      }),
      revocarLicencia: jest.fn().mockResolvedValue({
        mensaje: 'Licencia revocada exitosamente',
      }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({
        empresa_nombre: 'Test Corp',
        empresa_id: 'EMP-001',
        tipo: 'suscripcion_anual',
        activa: true,
        dias_restantes: 100,
      }),
      getAuditoria: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenciaController],
      providers: [
        {
          provide: LicenciaService,
          useValue: mockLicenciaService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LicenciaController>(LicenciaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validarClave', () => {
    it('should validate correct format', () => {
      const result = controller.validarClave('XILEF-A1B2-C3D4-E5F6-F7A8');
      expect(result.formato_valido).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = controller.validarClave('INVALID');
      expect(result.formato_valido).toBe(false);
    });
  });

  describe('activar', () => {
    it('should call service.activarLicencia', async () => {
      const dto = {
        clave_activacion: 'XILEF-A1B2-C3D4-E5F6-F7A8',
        empresa_nombre: 'Test Corp',
        empresa_id: 'EMP-001',
      };
      const result = await controller.activar(dto, '127.0.0.1', { headers: {} });
      expect(mockLicenciaService.activarLicencia).toHaveBeenCalledWith(
        dto,
        '127.0.0.1',
        '',
      );
      expect(result.valida).toBe(true);
    });
  });

  describe('verificarEstado', () => {
    it('should return estado for valid empresa', async () => {
      const req = { user: { empresa_id: 'EMP-001' } };
      const result = await controller.verificarEstado(req);
      expect(mockLicenciaService.verificarEstado).toHaveBeenCalledWith('EMP-001');
      expect(result.valida).toBe(true);
    });

    it('should return invalid if no empresa_id', async () => {
      const req = { user: {}, query: {} };
      const result = await controller.verificarEstado(req);
      expect(result.valida).toBe(false);
      expect((result as any).mensaje).toContain('empresa_id no proporcionado');
    });

    it('should use empresa_id from query if not in user', async () => {
      const req = { user: {}, query: { empresa_id: 'EMP-QUERY' } };
      await controller.verificarEstado(req);
      expect(mockLicenciaService.verificarEstado).toHaveBeenCalledWith('EMP-QUERY');
    });
  });

  describe('generar', () => {
    it('should generate a license', async () => {
      const dto = {
        empresa_nombre: 'New Corp',
        empresa_id: 'EMP-NEW',
        tipo: 'suscripcion_anual' as LicenciaTipo,
      };
      const result = await controller.generar(dto);
      expect(mockLicenciaService.generateLicencia).toHaveBeenCalledWith(dto);
      expect(result.licencia.clave).toBe('XILEF-A1B2-C3D4-E5F6-F7A8');
    });
  });

  describe('renovar', () => {
    it('should renew a license', async () => {
      const dto = { empresa_id: 'EMP-001', dias: 365 };
      const result = await controller.renovar(dto);
      expect(mockLicenciaService.renovarLicencia).toHaveBeenCalledWith(dto);
      expect(result.mensaje).toContain('renovada');
    });
  });

  describe('revocar', () => {
    it('should revoke a license', async () => {
      const result = await controller.revocar('EMP-001', 'Violación de términos');
      expect(mockLicenciaService.revocarLicencia).toHaveBeenCalledWith(
        'EMP-001',
        'Violación de términos',
      );
      expect(result.mensaje).toContain('revocada');
    });
  });

  describe('listarTodas', () => {
    it('should return all licenses', async () => {
      const result = await controller.listarTodas();
      expect(mockLicenciaService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('obtenerUna', () => {
    it('should return one license by empresa_id', async () => {
      const result = await controller.obtenerUna('EMP-001');
      expect(mockLicenciaService.findOne).toHaveBeenCalledWith('EMP-001');
      expect(result!.empresa_id).toBe('EMP-001');
    });
  });

  describe('auditoria', () => {
    it('should return audit logs', async () => {
      const result = await controller.auditoria();
      expect(mockLicenciaService.getAuditoria).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
