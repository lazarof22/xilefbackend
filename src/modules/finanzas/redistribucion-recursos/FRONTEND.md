# Redistribución de Recursos (`/redistribucion-recursos`)

Redistribución de saldos entre cuentas bancarias y/o cajas, con flujo de aprobación.

**Ciclo de vida:** `pendiente` → `aprobada` → `ejecutada` / `anulada`

---

### Crear Redistribución

`POST /redistribucion-recursos`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "RR-2024-001",
  "descripcion": "Redistribución de liquidez",
  "fecha": "2024-01-15",
  "items": [
    {
      "tipo": "banco",
      "cuentaId": "507f1f77bcf86cd799439011",
      "monto": 10000.00,
      "accion": "ORIGEN"
    },
    {
      "tipo": "caja",
      "cuentaId": "507f1f77bcf86cd799439022",
      "monto": 10000.00,
      "accion": "DESTINO"
    }
  ],
  "montoTotal": 10000.00,
  "justificacion": "Necesidad de efectivo en caja principal"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a018",
  "codigo": "RR-2024-001",
  "descripcion": "Redistribución de liquidez",
  "fecha": "2024-01-15T00:00:00.000Z",
  "items": [
    { "tipo": "banco", "cuentaId": { "_id": "...", "nombreBanco": "BFA" }, "monto": 10000.00, "accion": "ORIGEN" },
    { "tipo": "caja", "cuentaId": { "_id": "...", "nombre": "Caja Principal" }, "monto": 10000.00, "accion": "DESTINO" }
  ],
  "montoTotal": 10000.00,
  "estado": "pendiente",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Redistribuciones

`GET /redistribucion-recursos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a018",
    "codigo": "RR-2024-001",
    "descripcion": "Redistribución de liquidez",
    "montoTotal": 10000.00,
    "estado": "pendiente"
  }
]
```
</details>

---

### Redistribuciones Pendientes

`GET /redistribucion-recursos/pendientes`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a018",
    "codigo": "RR-2024-001",
    "descripcion": "Redistribución de liquidez",
    "montoTotal": 10000.00,
    "estado": "pendiente"
  }
]
```
</details>

---

### Obtener por ID

`GET /redistribucion-recursos/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a018",
  "codigo": "RR-2024-001",
  "descripcion": "Redistribución de liquidez",
  "fecha": "2024-01-15T00:00:00.000Z",
  "items": [
    { "tipo": "banco", "cuentaId": { "_id": "...", "nombreBanco": "BFA" }, "monto": 10000.00, "accion": "ORIGEN" },
    { "tipo": "caja", "cuentaId": { "_id": "...", "nombre": "Caja Principal" }, "monto": 10000.00, "accion": "DESTINO" }
  ],
  "montoTotal": 10000.00,
  "justificacion": "Necesidad de efectivo en caja principal",
  "estado": "pendiente"
}
```
</details>

---

### Actualizar

`PATCH /redistribucion-recursos/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "justificacion": "Justificación actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a018", "justificacion": "Justificación actualizada" }
```
</details>

---

### Aprobar

`POST /redistribucion-recursos/:id/aprobar`

<details>
<summary>🔍 Ver request</summary>

```json
{ "aprobadoPor": "507f1f77bcf86cd799439033" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a018",
  "estado": "aprobada",
  "aprobadoPor": { "_id": "...", "nombre": "Juan Pérez" }
}
```
</details>

---

### Ejecutar

`POST /redistribucion-recursos/:id/ejecutar`

Aplica los cambios de saldo en las cuentas involucradas.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a018",
  "estado": "ejecutada",
  "items": [
    { "cuentaId": "...", "saldoAnterior": 50000.00, "saldoActual": 40000.00 },
    { "cuentaId": "...", "saldoAnterior": 10000.00, "saldoActual": 20000.00 }
  ]
}
```
</details>

---

### Anular

`POST /redistribucion-recursos/:id/anular`

Revierte los cambios de saldo si estaba ejecutada.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a018",
  "estado": "anulada",
  "mensaje": "Redistribución anulada. Saldos revertidos."
}
```
</details>

---

### Eliminar

`DELETE /redistribucion-recursos/:id` (solo si no está ejecutada)

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
