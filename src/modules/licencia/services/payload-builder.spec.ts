import {
  buildEd25519Payload,
  buildIntegrityPayload,
  buildLegacyIntegrityPayload,
  buildPayloadForVersion,
} from './payload-builder';

const BASE = {
  empresa_id: 'EMP-001',
  tipo: 'trial',
  fecha_inicio: new Date('2024-01-01T00:00:00.000Z'),
  fecha_vencimiento: new Date('2025-01-01T00:00:00.000Z'),
  max_usuarios: 10,
  activa: true,
  revocada: false,
};

describe('payload-builder', () => {
  describe('buildEd25519Payload (v2)', () => {
    it('produce canonical JSON determinista con 7 campos (sin hardware_id)', () => {
      const payload = buildEd25519Payload(BASE);
      expect(payload).toBe(
        '{"activa":true,"empresa_id":"EMP-001","fecha_inicio":"2024-01-01T00:00:00.000Z","fecha_vencimiento":"2025-01-01T00:00:00.000Z","max_usuarios":10,"revocada":false,"tipo":"trial"}',
      );

      const parsed = JSON.parse(payload) as Record<string, unknown>;
      expect(Object.keys(parsed).sort()).toEqual([
        'activa',
        'empresa_id',
        'fecha_inicio',
        'fecha_vencimiento',
        'max_usuarios',
        'revocada',
        'tipo',
      ]);
      expect(parsed).not.toHaveProperty('hardware_id');
    });

    it('es byte-idéntico entre llamadas', () => {
      expect(buildEd25519Payload(BASE)).toBe(buildEd25519Payload(BASE));
    });

    it('coincide con v1 menos el campo hardware_id', () => {
      const v1 = buildIntegrityPayload({ ...BASE, hardware_id: 'ignored' });
      const v2 = buildEd25519Payload(BASE);
      // Canonical sorted JSON: quitar el único campo `hardware_id` del v1
      expect(v2).toBe(v1.replace(/,"hardware_id":"[^"]*"/, ''));
    });
  });

  describe('buildIntegrityPayload (v1)', () => {
    it('incluye hardware_id (8 campos)', () => {
      const payload = buildIntegrityPayload({ ...BASE, hardware_id: 'hw' });
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      expect(Object.keys(parsed).sort()).toEqual([
        'activa',
        'empresa_id',
        'fecha_inicio',
        'fecha_vencimiento',
        'hardware_id',
        'max_usuarios',
        'revocada',
        'tipo',
      ]);
      expect(parsed.hardware_id).toBe('hw');
    });
  });

  describe('buildLegacyIntegrityPayload (v0)', () => {
    it('formato pipe-separated con 4 campos', () => {
      const payload = buildLegacyIntegrityPayload(BASE);
      expect(payload.split('|')).toHaveLength(4);
    });
  });

  describe('buildPayloadForVersion', () => {
    it('undefined y 0 → legacy', () => {
      const legacy = buildLegacyIntegrityPayload(BASE);
      expect(buildPayloadForVersion(undefined, BASE)).toBe(legacy);
      expect(buildPayloadForVersion(0, BASE)).toBe(legacy);
    });

    it('1 → v1 (8 campos)', () => {
      expect(buildPayloadForVersion(1, { ...BASE, hardware_id: 'hw' })).toBe(
        buildIntegrityPayload({ ...BASE, hardware_id: 'hw' }),
      );
    });

    it('2 → v2 (7 campos, sin hardware_id)', () => {
      expect(buildPayloadForVersion(2, BASE)).toBe(buildEd25519Payload(BASE));
    });
  });
});
