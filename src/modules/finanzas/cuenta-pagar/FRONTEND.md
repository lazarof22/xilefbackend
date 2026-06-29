# Cuentas por Pagar (`/cuenta-pagar`)

Gestión de cuentas por pagar a proveedores, con análisis de envejecimiento.

---

### Registrar Cuenta por Pagar

`POST /cuenta-pagar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CXP-2024-001",
  "proveedor": "507f1f77bcf86cd799439011",
  "concepto": "507f1f77bcf86cd799439022",
  "montoOriginal": 15000.00,
  "fechaEmision": "2024-01-15",
  "fechaVencimiento": "2024-02-15",
  "notas": "Compra de materiales según factura PROV-2024-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a010",
  "codigo": "CXP-2024-001",
  "proveedor": { "_id": "...", "nombre": "Proveedor ABC" },
  "concepto": { "_id": "...", "nombre": "Compra de materiales" },
  "montoOriginal": 15000.00,
  "saldoPendiente": 15000.00,
  "fechaEmision": "2024-01-15T00:00:00.000Z",
  "fechaVencimiento": "2024-02-15T00:00:00.000Z",
  "estado": "pendiente",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Cuentas por Pagar

`GET /cuenta-pagar`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a010",
    "codigo": "CXP-2024-001",
    "proveedor": { "_id": "...", "nombre": "Proveedor ABC" },
    "montoOriginal": 15000.00,
    "saldoPendiente": 15000.00,
    "fechaVencimiento": "2024-02-15T00:00:00.000Z",
    "estado": "pendiente"
  }
]
```
</details>

---

### Cuentas Vencidas

`GET /cuenta-pagar/vencidas`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a011",
    "codigo": "CXP-2024-002",
    "proveedor": { "_id": "...", "nombre": "Proveedor XYZ" },
    "montoOriginal": 8000.00,
    "saldoPendiente": 8000.00,
    "fechaVencimiento": "2024-01-01T00:00:00.000Z",
    "diasVencido": 15,
    "estado": "vencida"
  }
]
```
</details>

---

### Análisis de Envejecimiento

`GET /cuenta-pagar/envejecimiento`

<details>
<summary>🔍 Ver response</summary>

```json
[
  { "rango": "0-30 dias", "cantidad": 4, "montoTotal": 35000.00 },
  { "rango": "31-60 dias", "cantidad": 2, "montoTotal": 15000.00 }
]
```
</details>

---

### Envejecimiento por Proveedor

`GET /cuenta-pagar/envejecimiento/proveedor/:proveedorId`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "proveedor": { "_id": "...", "nombre": "Proveedor ABC" },
  "totalAdeudado": 25000.00,
  "envejecimiento": [
    { "rango": "0-30 dias", "monto": 15000.00 },
    { "rango": "31-60 dias", "monto": 10000.00 }
  ]
}
```
</details>

---

### Resumen

`GET /cuenta-pagar/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalCxP": 8,
  "montoTotalOriginal": 95000.00,
  "saldoPendienteTotal": 58000.00,
  "porEstado": {
    "pendiente": 3,
    "parcial": 2,
    "pagada": 2,
    "vencida": 1
  }
}
```
</details>

---

### Obtener por ID

`GET /cuenta-pagar/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a010",
  "codigo": "CXP-2024-001",
  "proveedor": { "_id": "...", "nombre": "Proveedor ABC" },
  "concepto": { "_id": "...", "nombre": "Compra de materiales" },
  "montoOriginal": 15000.00,
  "saldoPendiente": 15000.00,
  "fechaEmision": "2024-01-15T00:00:00.000Z",
  "fechaVencimiento": "2024-02-15T00:00:00.000Z",
  "estado": "pendiente"
}
```
</details>

---

### Actualizar

`PATCH /cuenta-pagar/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "notas": "Nota actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a010", "notas": "Nota actualizada" }
```
</details>

---

### Registrar Pago

`POST /cuenta-pagar/:id/abonar`

<details>
<summary>🔍 Ver request</summary>

```json
{ "monto": 15000.00 }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a010",
  "codigo": "CXP-2024-001",
  "montoPagado": 15000.00,
  "saldoPendienteAnterior": 15000.00,
  "saldoPendienteActual": 0,
  "estado": "pagada"
}
```
</details>

---

### Eliminar

`DELETE /cuenta-pagar/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
