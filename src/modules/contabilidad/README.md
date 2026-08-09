# Módulo de Contabilidad — XILEF Backend

CRUD y reportes contables implementados siguiendo la legislación cubana (NCIF / elementos del gasto) y guiados por el frontend de XILEF.

## Módulos creados

- **Cuenta** — plan de cuentas con código, nombre, naturaleza (Deudora/Acreedora), jerarquía (padre) y moneda.
- **Comprobante** — asientos con líneas (débito/crédito) y validación automática de equilibrio.
- **Asiento** — asientos simples (fecha, número, concepto, cuenta, debe/haber).
- **Elemento de Gasto** — nomenclador de elementos del gasto.
- **Centro de Costo** — nomenclador de centros de costo.
- **Clasificación Ingreso/Gasto** — marca cada cuenta como Ingreso o Gasto.

## Reportes contables

Endpoints bajo `/reportes-contables`:

- `GET /reportes-contables/estado-rendimiento` — ingresos y gastos del período (utilidad neta y margen).
- `GET /reportes-contables/gastos-elementos` — gastos agrupados por elemento del gasto.
- `GET /reportes-contables/balance-comprobacion` — sumas y saldos por cuenta con verificación de cuadre.
- `GET /reportes-contables/submayor` — mayor auxiliar de una cuenta (saldo corrido por naturaleza).

Todos aceptan `fechaInicio` y `fechaFin`; el submayor requiere `cuentaId` y permite filtrar por `centroCostoId`.

## Verificación

- Build: OK
- Lint (módulos de contabilidad): OK
- Tests: 106/106 aprobados
