# Cuentas por Cobrar (`/cuenta-cobrar`)

Gestión de cuentas por cobrar a clientes, con análisis de envejecimiento (Inst. 34/2006 BCC).

---

### Registrar Cuenta por Cobrar

`POST /cuenta-cobrar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CXC-2024-001",
  "cliente": "507f1f77bcf86cd799439011",
  "concepto": "507f1f77bcf86cd799439022",
  "montoOriginal": 25000.00,
  "fechaEmision": "2024-01-15",
  "fechaVencimiento": "2024-02-15",
  "notas": "Venta de productos según factura FAC-2024-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a008",
  "codigo": "CXC-2024-001",
  "cliente": { "_id": "...", "nombre": "Cliente ABC" },
  "concepto": { "_id": "...", "nombre": "Venta de productos" },
  "montoOriginal": 25000.00,
  "saldoPendiente": 25000.00,
  "fechaEmision": "2024-01-15T00:00:00.000Z",
  "fechaVencimiento": "2024-02-15T00:00:00.000Z",
  "estado": "pendiente",
  "diasVencido": 0,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Cuentas por Cobrar

`GET /cuenta-cobrar`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a008",
    "codigo": "CXC-2024-001",
    "cliente": { "_id": "...", "nombre": "Cliente ABC" },
    "montoOriginal": 25000.00,
    "saldoPendiente": 15000.00,
    "fechaVencimiento": "2024-02-15T00:00:00.000Z",
    "diasVencido": 0,
    "estado": "parcial"
  }
]
```
</details>

---

### Cuentas Vencidas

`GET /cuenta-cobrar/vencidas`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a009",
    "codigo": "CXC-2024-002",
    "cliente": { "_id": "...", "nombre": "Cliente XYZ" },
    "montoOriginal": 10000.00,
    "saldoPendiente": 10000.00,
    "fechaVencimiento": "2024-01-01T00:00:00.000Z",
    "diasVencido": 15,
    "estado": "vencida"
  }
]
```
</details>

---

### Análisis de Envejecimiento (Aging)

`GET /cuenta-cobrar/envejecimiento`

<details>
<summary>🔍 Ver response</summary>

```json
[
  { "rango": "0-30 dias", "cantidad": 5, "montoTotal": 45000.00, "porcentaje": 45 },
  { "rango": "31-60 dias", "cantidad": 3, "montoTotal": 25000.00, "porcentaje": 25 },
  { "rango": "61-90 dias", "cantidad": 2, "montoTotal": 20000.00, "porcentaje": 20 },
  { "rango": "91+ dias", "cantidad": 1, "montoTotal": 10000.00, "porcentaje": 10 }
]
```
</details>

---

### Envejecimiento por Cliente

`GET /cuenta-cobrar/envejecimiento/cliente/:clienteId`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "cliente": { "_id": "...", "nombre": "Cliente ABC" },
  "totaladeudado": 35000.00,
  "envejecimiento": [
    { "rango": "0-30 dias", "monto": 20000.00 },
    { "rango": "31-60 dias", "monto": 15000.00 }
  ]
}
```
</details>

---

### Resumen

`GET /cuenta-cobrar/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalCxC": 10,
  "montoTotalOriginal": 150000.00,
  "saldoPendienteTotal": 85000.00,
  "porEstado": {
    "pendiente": 4,
    "parcial": 3,
    "pagada": 2,
    "vencida": 1
  }
}
```
</details>

---

### Obtener por ID

`GET /cuenta-cobrar/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a008",
  "codigo": "CXC-2024-001",
  "cliente": { "_id": "...", "nombre": "Cliente ABC" },
  "concepto": { "_id": "...", "nombre": "Venta de productos" },
  "montoOriginal": 25000.00,
  "saldoPendiente": 15000.00,
  "fechaEmision": "2024-01-15T00:00:00.000Z",
  "fechaVencimiento": "2024-02-15T00:00:00.000Z",
  "diasVencido": 0,
  "estado": "parcial",
  "notas": "Venta de productos según factura FAC-2024-001"
}
```
</details>

---

### Actualizar

`PATCH /cuenta-cobrar/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "notas": "Nota actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a008", "notas": "Nota actualizada" }
```
</details>

---

### Registrar Abono

`POST /cuenta-cobrar/:id/abonar`

El backend actualiza automáticamente el saldo pendiente y el estado.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 10000.00,
  "fechaPago": "2024-01-20",
  "referencia": "TRF-2024-002"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a008",
  "codigo": "CXC-2024-001",
  "montoAbonado": 10000.00,
  "saldoPendienteAnterior": 25000.00,
  "saldoPendienteActual": 15000.00,
  "estado": "parcial"
}
```
</details>

---

### Eliminar

`DELETE /cuenta-cobrar/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
