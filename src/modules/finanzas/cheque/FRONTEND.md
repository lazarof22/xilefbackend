# Cheques (`/cheque`)

Gestión de cheques emitidos y recibidos (Res. 101/2011 BCC).

**Estados de un cheque:** `"emitido"` → `"entregado"` → `"cobrado"` / `"devuelto"` / `"anulado"`

---

### Registrar Cheque

`POST /cheque`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "numeroCheque": "CH-000123",
  "tipo": "emitido",
  "beneficiario": "Proveedor ABC",
  "cuentaBancaria": "507f1f77bcf86cd799439022",
  "monto": 5000.00,
  "fechaEmision": "2024-01-15",
  "concepto": "Pago de factura FAC-2024-050"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439eee",
  "numeroCheque": "CH-000123",
  "tipo": "emitido",
  "beneficiario": "Proveedor ABC",
  "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "monto": 5000.00,
  "fechaEmision": "2024-01-15T00:00:00.000Z",
  "concepto": "Pago de factura FAC-2024-050",
  "estado": "emitido",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Cheques

`GET /cheque`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439eee",
    "numeroCheque": "CH-000123",
    "tipo": "emitido",
    "beneficiario": "Proveedor ABC",
    "monto": 5000.00,
    "estado": "emitido",
    "fechaEmision": "2024-01-15T00:00:00.000Z"
  }
]
```
</details>

---

### Cheques Pendientes

`GET /cheque/pendientes`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439eee",
    "numeroCheque": "CH-000123",
    "beneficiario": "Proveedor ABC",
    "monto": 5000.00,
    "estado": "emitido",
    "fechaEmision": "2024-01-15T00:00:00.000Z"
  }
]
```
</details>

---

### Obtener Cheque

`GET /cheque/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439eee",
  "numeroCheque": "CH-000123",
  "tipo": "emitido",
  "beneficiario": "Proveedor ABC",
  "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "monto": 5000.00,
  "fechaEmision": "2024-01-15T00:00:00.000Z",
  "concepto": "Pago de factura FAC-2024-050",
  "estado": "emitido",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Registrar Cobro

`PATCH /cheque/:id/cobrar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "fechaCobro": "2024-01-20"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439eee",
  "numeroCheque": "CH-000123",
  "estado": "cobrado",
  "fechaCobro": "2024-01-20T00:00:00.000Z"
}
```
</details>

---

### Registrar Devolución

`PATCH /cheque/:id/devolver`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "motivo": "Fondos insuficientes"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439eee",
  "numeroCheque": "CH-000123",
  "estado": "devuelto",
  "motivoDevolucion": "Fondos insuficientes"
}
```
</details>

---

### Anular Cheque

`PATCH /cheque/:id/anular`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439eee",
  "numeroCheque": "CH-000123",
  "estado": "anulado"
}
```
</details>
