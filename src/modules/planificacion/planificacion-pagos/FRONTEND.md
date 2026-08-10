# Planificación de Pagos (`/planificacion-pagos`)

Planes de pago programados a proveedores, con ciclo de vida completo y proyección semanal.

**Estados:** `programado` → `confirmado` → `ejecutado` / `cancelado` / `reprogramado`

Al ejecutar, se crea automáticamente una transacción de egreso y se descuenta el saldo de la cuenta bancaria asociada.

---

### Crear Plan de Pago

`POST /planificacion-pagos`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "PP-2024-001",
  "proveedor": "507f1f77bcf86cd799439011",
  "cuentaPagar": "507f1f77bcf86cd799439022",
  "montoProgramado": 50000.00,
  "fechaProgramada": "2024-03-15",
  "cuentaBancaria": "507f1f77bcf86cd799439033",
  "metodoPago": "transferencia",
  "prioridad": 1,
  "observaciones": "Pago anticipado proveedor principal"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "codigo": "PP-2024-001",
  "proveedor": "507f1f77bcf86cd799439011",
  "cuentaPagar": "507f1f77bcf86cd799439022",
  "montoProgramado": 50000.00,
  "montoPagado": 0,
  "saldoProgramado": 50000.00,
  "fechaProgramada": "2024-03-15T00:00:00.000Z",
  "cuentaBancaria": "507f1f77bcf86cd799439033",
  "estado": "programado",
  "metodoPago": "transferencia",
  "prioridad": 1,
  "observaciones": "Pago anticipado proveedor principal",
  "createdAt": "2024-03-01T10:00:00.000Z"
}
```
</details>

---

### Listar Planes de Pago

`GET /planificacion-pagos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a016",
    "codigo": "PP-2024-001",
    "proveedor": { "_id": "...", "nombre": "Proveedor ABC" },
    "montoProgramado": 50000.00,
    "montoPagado": 30000.00,
    "saldoProgramado": 20000.00,
    "fechaProgramada": "2024-03-15T00:00:00.000Z",
    "estado": "confirmado",
    "prioridad": 1
  }
]
```
</details>

---

### Planes Pendientes

`GET /planificacion-pagos/pendientes`

Retorna solo los planes en estado `programado` o `confirmado`.

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "...",
    "codigo": "PP-2024-003",
    "fechaProgramada": "2024-03-20T00:00:00.000Z",
    "saldoProgramado": 12000.00,
    "estado": "programado"
  }
]
```
</details>

---

### Proyección de Pagos por Semana

`GET /planificacion-pagos/proyeccion?hasta=2024-06-30`

Agrupa los planes pendientes (`programado` y `confirmado`) por semana ISO hasta la fecha límite.

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "periodo": "2024-W11",
    "totalProgramado": 85000.00,
    "cantidad": 4
  },
  {
    "periodo": "2024-W12",
    "totalProgramado": 62000.00,
    "cantidad": 3
  }
]
```
</details>

---

### Por Período

`GET /planificacion-pagos/periodo?desde=2024-01-01&hasta=2024-01-31`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "...",
    "codigo": "PP-2024-001",
    "proveedor": { "_id": "...", "nombre": "Proveedor ABC" },
    "montoProgramado": 50000.00,
    "saldoProgramado": 20000.00,
    "fechaProgramada": "2024-01-15T00:00:00.000Z",
    "estado": "ejecutado"
  }
]
```
</details>

---

### Resumen

`GET /planificacion-pagos/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "porEstado": [
    {
      "_id": "programado",
      "cantidad": 5,
      "totalProgramado": 120000.00,
      "totalPagado": 0,
      "saldoPendiente": 120000.00
    },
    {
      "_id": "confirmado",
      "cantidad": 3,
      "totalProgramado": 85000.00,
      "totalPagado": 40000.00,
      "saldoPendiente": 45000.00
    },
    {
      "_id": "ejecutado",
      "cantidad": 12,
      "totalProgramado": 300000.00,
      "totalPagado": 300000.00,
      "saldoPendiente": 0
    }
  ],
  "totalGeneral": {
    "totalProgramado": 205000.00,
    "totalPagado": 40000.00,
    "saldoPendiente": 165000.00,
    "cantidad": 8
  }
}
```
</details>

---

### Obtener por ID

`GET /planificacion-pagos/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "codigo": "PP-2024-001",
  "proveedor": { "_id": "...", "nombre": "Proveedor ABC" },
  "cuentaPagar": { "_id": "...", "codigo": "CP-2024-010" },
  "montoProgramado": 50000.00,
  "montoPagado": 30000.00,
  "saldoProgramado": 20000.00,
  "fechaProgramada": "2024-03-15T00:00:00.000Z",
  "fechaEjecucion": "2024-03-15T14:30:00.000Z",
  "cuentaBancaria": "507f1f77bcf86cd799439033",
  "estado": "confirmado",
  "metodoPago": "transferencia",
  "prioridad": 1,
  "observaciones": "Pago anticipado proveedor principal",
  "createdAt": "2024-03-01T10:00:00.000Z",
  "updatedAt": "2024-03-15T14:30:00.000Z"
}
```
</details>

---

### Actualizar

`PATCH /planificacion-pagos/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "prioridad": 2,
  "observaciones": "Prioridad ajustada por cambio de proveedor"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "prioridad": 2,
  "observaciones": "Prioridad ajustada por cambio de proveedor"
}
```
</details>

---

### Confirmar

`POST /planificacion-pagos/:id/confirmar`

Cambia el estado de `programado` a `confirmado`. No se puede confirmar un plan `ejecutado` ni `cancelado`.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "estado": "confirmado"
}
```
</details>

---

### Ejecutar

`POST /planificacion-pagos/:id/ejecutar`

Ejecuta un pago parcial o total sobre un plan en estado `confirmado`. Crea una transacción de egreso automáticamente y descuenta el saldo de la cuenta bancaria. Si el saldo llega a 0, el plan pasa a `ejecutado`.

**ⓘ El monto no puede exceder el `saldoProgramado` ni ser ≤ 0.**

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 20000.00,
  "metodoPago": "transferencia",
  "referencia": "REF-2024-001",
  "fechaEjecucion": "2024-03-15"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "montoPagado": 20000.00,
  "saldoProgramado": 30000.00,
  "fechaEjecucion": "2024-03-15T14:30:00.000Z",
  "estado": "confirmado"
}
```
</details>

---

### Reprogramar

`POST /planificacion-pagos/:id/reprogramar`

Cambia la `fechaProgramada` y pasa el estado a `reprogramado`. Solo disponible para planes en estado `programado` o `confirmado`.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nuevaFecha": "2024-04-01"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "fechaProgramada": "2024-04-01T00:00:00.000Z",
  "estado": "reprogramado"
}
```
</details>

---

### Cancelar

`POST /planificacion-pagos/:id/cancelar`

Cambia el estado a `cancelado`. No se puede cancelar un plan ya `ejecutado`.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "estado": "cancelado"
}
```
</details>

---

### Eliminar

`DELETE /planificacion-pagos/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
