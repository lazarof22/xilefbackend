# Presupuesto (`/presupuesto`)

Gestión de presupuestos con ciclo de vida completo y ejecución mensual.

**Estados:** `borrador` → `aprobado` → `en_ejecucion` → `cerrado`

**Tipos:** `ingreso`, `gasto`, `inversion`

Al ejecutar un monto sobre un mes, se acumula en `ejecutadoMensual` y `ejecutado`. Si estaba en `aprobado`, pasa automáticamente a `en_ejecucion`.

---

### Crear Presupuesto

`POST /presupuesto`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "PRES-2026-001",
  "nombre": "Presupuesto Operativo 2026",
  "periodo": "2026",
  "tipo": "gasto",
  "centroCosto": "507f1f77bcf86cd799439011",
  "tipoGasto": "507f1f77bcf86cd799439022",
  "planAnual": 240000.00,
  "planMensual": [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
  "moneda": "507f1f77bcf86cd799439033",
  "observaciones": "Gastos operativos área administrativa"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "codigo": "PRES-2026-001",
  "nombre": "Presupuesto Operativo 2026",
  "periodo": "2026",
  "tipo": "gasto",
  "centroCosto": "507f1f77bcf86cd799439011",
  "tipoGasto": "507f1f77bcf86cd799439022",
  "planAnual": 240000.00,
  "planMensual": [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
  "ejecutado": 0,
  "ejecutadoMensual": [],
  "estado": "borrador",
  "moneda": "507f1f77bcf86cd799439033",
  "observaciones": "Gastos operativos área administrativa",
  "createdAt": "2026-01-10T10:00:00.000Z",
  "updatedAt": "2026-01-10T10:00:00.000Z"
}
```
</details>

---

### Listar Presupuestos

`GET /presupuesto`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a016",
    "codigo": "PRES-2026-001",
    "nombre": "Presupuesto Operativo 2026",
    "periodo": "2026",
    "tipo": "gasto",
    "centroCosto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Administración" },
    "tipoGasto": { "_id": "507f1f77bcf86cd799439022", "nombre": "Servicios" },
    "planAnual": 240000.00,
    "ejecutado": 45000.00,
    "estado": "en_ejecucion",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "USD" }
  }
]
```
</details>

---

### Por Período

`GET /presupuesto/periodo?periodo=2026`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a016",
    "codigo": "PRES-2026-001",
    "nombre": "Presupuesto Operativo 2026",
    "periodo": "2026",
    "tipo": "gasto",
    "centroCosto": { "_id": "...", "nombre": "Administración" },
    "planAnual": 240000.00,
    "ejecutado": 45000.00,
    "estado": "en_ejecucion"
  }
]
```
</details>

---

### Por Centro de Costo

`GET /presupuesto/centro-costo?centroCostoId=507f1f77bcf86cd799439011`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a016",
    "codigo": "PRES-2026-001",
    "nombre": "Presupuesto Operativo 2026",
    "periodo": "2026",
    "centroCosto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Administración" },
    "planAnual": 240000.00,
    "ejecutado": 45000.00,
    "estado": "en_ejecucion"
  }
]
```
</details>

---

### Por Tipo

`GET /presupuesto/tipo?tipo=gasto`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a016",
    "codigo": "PRES-2026-001",
    "nombre": "Presupuesto Operativo 2026",
    "periodo": "2026",
    "tipo": "gasto",
    "centroCosto": { "_id": "...", "nombre": "Administración" },
    "planAnual": 240000.00,
    "ejecutado": 45000.00,
    "estado": "en_ejecucion"
  }
]
```
</details>

---

### Obtener por ID

`GET /presupuesto/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "codigo": "PRES-2026-001",
  "nombre": "Presupuesto Operativo 2026",
  "periodo": "2026",
  "tipo": "gasto",
  "centroCosto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Administración" },
  "tipoGasto": { "_id": "507f1f77bcf86cd799439022", "nombre": "Servicios" },
  "planAnual": 240000.00,
  "planMensual": [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
  "ejecutado": 45000.00,
  "ejecutadoMensual": [20000, 25000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "estado": "en_ejecucion",
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "USD" },
  "observaciones": "Gastos operativos área administrativa",
  "createdAt": "2026-01-10T10:00:00.000Z",
  "updatedAt": "2026-02-15T14:30:00.000Z"
}
```
</details>

---

### Actualizar

`PATCH /presupuesto/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Presupuesto Operativo Actualizado 2026",
  "planAnual": 260000.00,
  "observaciones": "Ajuste por inflación trimestral"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "nombre": "Presupuesto Operativo Actualizado 2026",
  "planAnual": 260000.00,
  "observaciones": "Ajuste por inflación trimestral"
}
```
</details>

---

### Aprobar

`POST /presupuesto/:id/aprobar`

Cambia el estado de `borrador` a `aprobado`. No se puede aprobar un presupuesto ya `aprobado` ni `cerrado`.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "estado": "aprobado"
}
```
</details>

---

### Cerrar

`POST /presupuesto/:id/cerrar`

Cambia el estado a `cerrado`. No se puede cerrar un presupuesto que ya está `cerrado`.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "estado": "cerrado"
}
```
</details>

---

### Registrar Ejecución

`POST /presupuesto/:id/ejecutar?monto=15000&mes=1`

Registra un monto ejecutado en un mes específico (1 = enero, 12 = diciembre). Acumula en la posición `mes - 1` del array `ejecutadoMensual` y en `ejecutado`. Si el presupuesto está en `aprobado`, pasa a `en_ejecucion`. Solo disponible para presupuestos en estado `aprobado` o `en_ejecucion`.

**ⓘ El mes debe estar entre 1 y 12. El monto debe ser mayor a 0.**

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "ejecutado": 15000.00,
  "ejecutadoMensual": [15000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "estado": "en_ejecucion"
}
```
</details>

---

### Eliminar

`DELETE /presupuesto/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
