export enum AccionAuditoria {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum ModuloAuditoria {
  AUTH = 'auth',
  CLIENTES = 'clientes',
  COMPRA = 'compra',
  CONFIGURACION = 'configuracion',
  CONTABILIDAD = 'contabilidad',
  FINANZAS = 'finanzas',
  INVENTARIO = 'inventario',
  LICENCIA = 'licencia',
  NOMENCLADORES = 'nomencladores',
  VENTA = 'venta',
  PROVEEDORES = 'proveedores',
  AUDITORIA = 'auditoria',
}

export interface AuditEvento {
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  usuarioId: string;
  usuarioNombre?: string;
  valoresAnteriores?: Record<string, unknown>;
  valoresNuevos?: Record<string, unknown>;
  modulo?: ModuloAuditoria;
  ip?: string;
  descripcion?: string;
}
