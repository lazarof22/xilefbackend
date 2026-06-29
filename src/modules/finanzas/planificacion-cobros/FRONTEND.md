# Planificación de Cobros (`/planificacion-cobros`)

Planificación y seguimiento de cobros programados, con proyección de ingresos.

**Ciclo de vida:** `programado` → `confirmado` / `cancelado` → `cobrado`

---

### Crear Plan de Cobro

`POST /planificacion-cobros`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "PC-2024-001",
  "cliente": "507f1f77bcf86cd799439011",
  "concepto": "507f1f77bcf86cd799439022",
  "monto": 25000.00,
  "moneda": "507f1f77bcf86cd799439033",
  "fechaProgramada": "2024-02-15",
  "descripcion": "Cobro planificado de factura FAC-2024-001",
  "referencia": "FAC-2024-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a025",
  "codigo": "PC-2024-001",
  "cliente": { "_id": "...", "nombre": "Cliente ABC" },
  "concepto": { "_id": "...", "nombre": "Venta de productos" },
  "monto": 25000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "fechaProgramada": "2024-02-15T00:00:00.000Z",
  "estado": "programado",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Planes de Cobro

`GET /planificacion-cobros`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a025",
    "codigo": "PC-2024-001",
    "cliente": { "_id": "...", "nombre": "Cliente ABC" },
    "monto": 25000.00,
    "fechaProgramada": "2024-02-15T00:00:00.000Z",
    "estado": "programado"
  }
]
```
</details>

---

### Planes Pendientes

`GET /planificacion-cobros/pendientes`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a025",
    "codigo": "PC-2024-001",
    "cliente": { "_id": "...", "nombre": "Cliente ABC" },
    "monto": 25000.00,
    "fechaProgramada": "2024-02-15T00:00:00.000Z",
    "estado": "programado"
  }
]
```
</details>

---

### Proyección de Ingresos

`GET /planificacion-cobros/proyeccion-ingresos?hasta=2024-12-31`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "proyeccion": [
    { "semana": "2024-02-12", "monto": 25000.00, "cantidad": 1 },
    { "semana": "2024-02-19", "monto": 45000.00, "cantidad": 2 }
  ],
  "totalProyectado": 250000.00,
  "hasta": "2024-12-31"
}
```
</details>

---

### Planes por Período

`GET /planificacion-cobros/periodo?desde=2024-01-01&hasta=2024-01-31`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a025",
    "codigo": "PC-2024-001",
    "monto": 25000.00,
    "fechaProgramada": "2024-02-15T00:00:00.000Z",
    "estado": "programado"
  }
]
```
</details>

---

### Resumen

`GET /planificacion-cobros/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalPlanes": 20,
  "montoTotal": 500000.00,
  "porEstado": {
    "programado": 10,
    "confirmado": 5,
    "cobrado": 3,
    "cancelado": 2
  }
}
```
</details>

---

### Obtener por ID

`GET /planificacion-cobros/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a025",
  "codigo": "PC-2024-001",
  "cliente": { "_id": "...", "nombre": "Cliente ABC" },
  "concepto": { "_id": "...", "nombre": "Venta de productos" },
  "monto": 25000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "fechaProgramada": "2024-02-15T00:00:00.000Z",
  "descripcion": "Cobro planificado de factura FAC-2024-001",
  "referencia": "FAC-2024-001",
  "estado": "programado"
}
```
</details>

---

### Actualizar

`PATCH /planificacion-cobros/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "descripcion": "Descripción actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a025", "descripcion": "Descripción actualizada" }
```
</details>

---

### Confirmar Plan

`POST /planificacion-cobros/:id/confirmar`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a025",
  "estado": "confirmado",
  "mensaje": "Plan de cobro confirmado"
}
```
</details>

---

### Registrar Cobro

`POST /planificacion-cobros/:id/cobrar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 25000.00,
  "fechaCobro": "2024-02-15",
  "referencia": "TRF-2024-004",
  "metodoPago": "transferencia"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a025",
  "estado": "cobrado",
  "montoCobrado": 25000.00,
  "fechaCobro": "2024-02-15T00:00:00.000Z"
}
```
</details>

---

### Reprogramar

`POST /planificacion-cobros/:id/reprogramar?fecha=2024-03-01`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a025",
  "fechaProgramada": "2024-03-01T00:00:00.000Z",
  "estado": "programado",
  "mensaje": "Plan de cobro reprogramado"
}
```
</details>

---

### Cancelar Plan

`POST /planificacion-cobros/:id/cancelar`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a025",
  "estado": "cancelado"
}
```
</details>

---

### Eliminar

`DELETE /planificacion-cobros/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
