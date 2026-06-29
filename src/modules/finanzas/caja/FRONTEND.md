# Caja — Efectivo (`/caja`)

Gestión de cuentas de caja, movimientos de efectivo y arqueos (Res. 324/1994 BNC, Res. 111/2023 BCC).

---

## Cuentas de Caja

### Crear Cuenta de Caja

`POST /caja/cuenta`

**Tipos de cuenta:** `"principal"`, `"fondo_fijo"`, `"chica"`, `"otra"`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CAJA-PPAL-CUP",
  "nombre": "Caja Principal CUP",
  "tipo": "principal",
  "moneda": "507f1f77bcf86cd799439011",
  "saldoInicial": 0,
  "montoFondoFijo": 0,
  "montoMinimo": 0,
  "responsable": "Juan Pérez",
  "cuentaBancariaReposicion": "507f1f77bcf86cd799439022"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439bbb",
  "codigo": "CAJA-PPAL-CUP",
  "nombre": "Caja Principal CUP",
  "tipo": "principal",
  "moneda": { "_id": "...", "nombre": "CUP" },
  "saldoInicial": 0,
  "saldoActual": 0,
  "montoFondoFijo": 0,
  "montoMinimo": 0,
  "responsable": "Juan Pérez",
  "cuentaBancariaReposicion": "507f1f77bcf86cd799439022",
  "activo": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

### Listar Cuentas

`GET /caja/cuentas`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439bbb",
    "codigo": "CAJA-PPAL-CUP",
    "nombre": "Caja Principal CUP",
    "tipo": "principal",
    "moneda": { "_id": "...", "nombre": "CUP" },
    "saldoActual": 15250.00,
    "responsable": "Juan Pérez"
  }
]
```
</details>

### Saldos de Cajas

`GET /caja/cuentas/saldos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "cuentaId": "507f1f77bcf86cd799439bbb",
    "codigo": "CAJA-PPAL-CUP",
    "nombre": "Caja Principal CUP",
    "tipo": "principal",
    "saldoActual": 15250.00
  }
]
```
</details>

### Obtener Cuenta por ID

`GET /caja/cuentas/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439bbb",
  "codigo": "CAJA-PPAL-CUP",
  "nombre": "Caja Principal CUP",
  "tipo": "principal",
  "moneda": { "_id": "...", "nombre": "CUP" },
  "saldoInicial": 0,
  "saldoActual": 15250.00,
  "montoFondoFijo": 5000,
  "montoMinimo": 1000,
  "responsable": "Juan Pérez",
  "cuentaBancariaReposicion": "507f1f77bcf86cd799439022",
  "activo": true
}
```
</details>

### Actualizar Cuenta

`PATCH /caja/cuentas/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "responsable": "Pedro López"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439bbb",
  "responsable": "Pedro López",
  "activo": true
}
```
</details>

### Eliminar Cuenta

`DELETE /caja/cuentas/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>

### Reponer Fondo Fijo

`POST /caja/cuentas/:id/reponer`

Si omites `monto`, se calcula automáticamente para llevar el saldo al `montoFondoFijo`.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 5000.00,
  "referencia": "REP-2024-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "cuentaId": "507f1f77bcf86cd799439bbb",
  "saldoAnterior": 2000.00,
  "montoRepuesto": 3000.00,
  "saldoActual": 5000.00,
  "referencia": "REP-2024-001"
}
```
</details>

---

## Movimientos de Caja

### Registrar Movimiento

`POST /caja/movimiento`

**Tipos de movimiento:** `"apertura"`, `"ingreso"`, `"egreso"`, `"cierre"`

**Conceptos:** `"ventas_efectivo"`, `"pagos_menores"`, `"viaticos"`, `"combustible"`, `"comedor"`, `"fondo_fijo_reposicion"`, `"anticipo"`, `"reembolso"`, `"otros"`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "cajaId": "507f1f77bcf86cd799439bbb",
  "codigo": "MC-2024-001",
  "tipo": "ingreso",
  "concepto": "ventas_efectivo",
  "descripcion": "Venta del día 15-01-2024",
  "monto": 2500.00,
  "fecha": "2024-01-15",
  "referencia": "FAC-2024-001",
  "responsable": "María García"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439ccc",
  "cajaId": "507f1f77bcf86cd799439bbb",
  "codigo": "MC-2024-001",
  "tipo": "ingreso",
  "concepto": "ventas_efectivo",
  "descripcion": "Venta del día 15-01-2024",
  "monto": 2500.00,
  "fecha": "2024-01-15T00:00:00.000Z",
  "referencia": "FAC-2024-001",
  "responsable": "María García",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

### Listar Movimientos

`GET /caja` (opcional: `?cajaId=...`)

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439ccc",
    "cajaId": { "_id": "...", "nombre": "Caja Principal CUP" },
    "codigo": "MC-2024-001",
    "tipo": "ingreso",
    "concepto": "ventas_efectivo",
    "monto": 2500.00,
    "fecha": "2024-01-15T00:00:00.000Z",
    "responsable": "María García"
  }
]
```
</details>

### Saldo Actual

`GET /caja/saldo` (opcional: `?cajaId=...`)

<details>
<summary>🔍 Ver response</summary>

```json
{
  "cajaId": "507f1f77bcf86cd799439bbb",
  "cajaNombre": "Caja Principal CUP",
  "saldoActual": 15250.00
}
```
</details>

### Movimientos del Día

`GET /caja/dia?fecha=2024-01-15&cajaId=...`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439ccc",
    "codigo": "MC-2024-001",
    "tipo": "ingreso",
    "concepto": "ventas_efectivo",
    "monto": 2500.00,
    "fecha": "2024-01-15T00:00:00.000Z",
    "responsable": "María García"
  }
]
```
</details>

### Resumen por Concepto

`GET /caja/resumen?desde=2024-01-01&hasta=2024-01-31&cajaId=...`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "concepto": "ventas_efectivo",
    "cantidad": 15,
    "totalIngresos": 45000.00,
    "totalEgresos": 0
  },
  {
    "concepto": "pagos_menores",
    "cantidad": 8,
    "totalIngresos": 0,
    "totalEgresos": 12500.00
  }
]
```
</details>

### Obtener Movimiento por ID

`GET /caja/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439ccc",
  "cajaId": { "_id": "...", "nombre": "Caja Principal CUP" },
  "codigo": "MC-2024-001",
  "tipo": "ingreso",
  "concepto": "ventas_efectivo",
  "descripcion": "Venta del día 15-01-2024",
  "monto": 2500.00,
  "fecha": "2024-01-15T00:00:00.000Z",
  "referencia": "FAC-2024-001",
  "responsable": "María García",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

### Eliminar Movimiento

`DELETE /caja/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>

---

## Arqueos de Caja

### Historial de Arqueos

`GET /caja/arqueos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439ddd",
    "cajaId": { "_id": "...", "nombre": "Caja Principal CUP" },
    "efectivoEsperado": 15000.00,
    "efectivoContado": 15250.00,
    "diferencia": 250.00,
    "resultado": "diferencia",
    "realizadoPor": "María García",
    "fecha": "2024-01-15T17:00:00.000Z"
  }
]
```
</details>

### Realizar Arqueo

`POST /caja/arqueo`

El backend calcula automáticamente la diferencia contra el saldo esperado.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "cajaId": "507f1f77bcf86cd799439bbb",
  "efectivoContado": 15250.00,
  "observaciones": "Arqueo diario sin novedades",
  "realizadoPor": "María García"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439ddd",
  "cajaId": "507f1f77bcf86cd799439bbb",
  "efectivoEsperado": 15000.00,
  "efectivoContado": 15250.00,
  "diferencia": 250.00,
  "resultado": "diferencia",
  "observaciones": "Arqueo diario sin novedades",
  "realizadoPor": "María García",
  "fecha": "2024-01-15T17:00:00.000Z"
}
```
</details>
