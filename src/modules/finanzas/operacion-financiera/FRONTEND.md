# Operaciones Financieras (`/operacion-financiera`)

Registro de operaciones financieras diversas (préstamos, inversiones, etc.) con pagos y seguimiento de vencimientos.

---

### Registrar Operación

`POST /operacion-financiera`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "OF-2024-001",
  "tipo": "prestamo",
  "descripcion": "Préstamo a corto plazo",
  "monto": 50000.00,
  "moneda": "507f1f77bcf86cd799439011",
  "fecha": "2024-01-15",
  "fechaVencimiento": "2024-07-15",
  "entidad": "507f1f77bcf86cd799439022"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a023",
  "codigo": "OF-2024-001",
  "tipo": "prestamo",
  "descripcion": "Préstamo a corto plazo",
  "monto": 50000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "fecha": "2024-01-15T00:00:00.000Z",
  "fechaVencimiento": "2024-07-15T00:00:00.000Z",
  "entidad": { "_id": "...", "nombre": "Banco de Crédito y Comercio" },
  "estado": "pendiente",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Operaciones

`GET /operacion-financiera`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a023",
    "codigo": "OF-2024-001",
    "tipo": "prestamo",
    "monto": 50000.00,
    "fechaVencimiento": "2024-07-15T00:00:00.000Z",
    "estado": "pendiente"
  }
]
```
</details>

---

### Operaciones Vencidas

`GET /operacion-financiera/vencidas`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a024",
    "codigo": "OF-2024-002",
    "tipo": "prestamo",
    "monto": 10000.00,
    "diasVencido": 5,
    "estado": "vencida"
  }
]
```
</details>

---

### Operaciones por Tipo

`GET /operacion-financiera/tipo/:tipo`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a023",
    "codigo": "OF-2024-001",
    "tipo": "prestamo",
    "monto": 50000.00,
    "estado": "pendiente"
  }
]
```
</details>

---

### Operaciones por Período

`GET /operacion-financiera/periodo/:periodo` (ej. "2026-06")

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a023",
    "codigo": "OF-2024-001",
    "fecha": "2024-01-15T00:00:00.000Z",
    "monto": 50000.00
  }
]
```
</details>

---

### Resumen

`GET /operacion-financiera/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalOperaciones": 15,
  "montoTotal": 250000.00,
  "porEstado": {
    "pendiente": 8,
    "pagada": 5,
    "vencida": 2
  },
  "porTipo": {
    "prestamo": 10,
    "inversion": 3,
    "otra": 2
  }
}
```
</details>

---

### Obtener por ID

`GET /operacion-financiera/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a023",
  "codigo": "OF-2024-001",
  "tipo": "prestamo",
  "descripcion": "Préstamo a corto plazo",
  "monto": 50000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "fecha": "2024-01-15T00:00:00.000Z",
  "fechaVencimiento": "2024-07-15T00:00:00.000Z",
  "entidad": { "_id": "...", "nombre": "Banco de Crédito y Comercio" },
  "estado": "pendiente",
  "saldoPendiente": 50000.00
}
```
</details>

---

### Actualizar

`PATCH /operacion-financiera/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "descripcion": "Descripción actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a023", "descripcion": "Descripción actualizada" }
```
</details>

---

### Registrar Pago

`POST /operacion-financiera/:id/pagar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 25000.00,
  "fechaPago": "2024-03-15",
  "referencia": "TRF-2024-003"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a023",
  "montoPagado": 25000.00,
  "saldoPendienteAnterior": 50000.00,
  "saldoPendienteActual": 25000.00,
  "estado": "parcial"
}
```
</details>

---

### Eliminar

`DELETE /operacion-financiera/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
