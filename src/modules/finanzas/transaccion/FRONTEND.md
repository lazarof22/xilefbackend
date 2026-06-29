# Transacciones de Tesorería (`/transaccion`)

Registro central de ingresos y egresos, con reportes de flujo de efectivo (Res. 101/2011, Res. 111/2023 BCC).

**Métodos de pago:** `"efectivo"`, `"transferencia"`, `"cheque"`, `"credito"`, `"otro"`

---

### Registrar Transacción

`POST /transaccion`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "TRX-2024-001",
  "tipo": "ingreso",
  "categoria": "507f1f77bcf86cd799439011",
  "monto": 5000.00,
  "moneda": "507f1f77bcf86cd799439022",
  "fecha": "2024-01-15",
  "metodoPago": "transferencia",
  "referencia": "FAC-2024-001",
  "descripcion": "Cobro de factura",
  "cuentaBancaria": "507f1f77bcf86cd799439033",
  "cliente": "507f1f77bcf86cd799439044"
}
```
</details>

Para operaciones de divisa, incluye además:
```json
{
  "tipoCambio": 120.00,
  "monedaOrigen": "507f1f77bcf86cd799439055",
  "tipoOperacionCambio": "compra_divisa"
}
```

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a012",
  "codigo": "TRX-2024-001",
  "tipo": "ingreso",
  "categoria": { "_id": "...", "nombre": "Ventas" },
  "monto": 5000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "fecha": "2024-01-15T00:00:00.000Z",
  "metodoPago": "transferencia",
  "referencia": "FAC-2024-001",
  "descripcion": "Cobro de factura",
  "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "cliente": { "_id": "...", "nombre": "Cliente ABC" },
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Transacciones

`GET /transaccion`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a012",
    "codigo": "TRX-2024-001",
    "tipo": "ingreso",
    "monto": 5000.00,
    "moneda": { "_id": "...", "nombre": "CUP" },
    "fecha": "2024-01-15T00:00:00.000Z",
    "metodoPago": "transferencia",
    "descripcion": "Cobro de factura"
  }
]
```
</details>

---

### Transacciones por Período

`GET /transaccion/periodo?desde=2024-01-01&hasta=2024-01-31`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "...",
    "codigo": "TRX-2024-001",
    "tipo": "ingreso",
    "monto": 5000.00,
    "fecha": "2024-01-15T00:00:00.000Z"
  }
]
```
</details>

---

### Resumen de Ingresos/Egresos

`GET /transaccion/resumen?desde=2024-01-01&hasta=2024-01-31`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalIngresos": 50000.00,
  "totalEgresos": 35000.00,
  "saldoNeto": 15000.00,
  "cantidadIngresos": 10,
  "cantidadEgresos": 8
}
```
</details>

---

### Flujo de Efectivo

`GET /transaccion/flujo-efectivo?desde=2024-01-01&hasta=2024-01-31`

Implementa NCC 2 — Estado de Flujo de Efectivo.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "periodo": { "desde": "2024-01-01", "hasta": "2024-01-31" },
  "saldoInicial": 10000.00,
  "ingresos": 50000.00,
  "egresos": 35000.00,
  "flujoNeto": 15000.00,
  "saldoFinal": 25000.00
}
```
</details>

---

### Obtener por ID

`GET /transaccion/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a012",
  "codigo": "TRX-2024-001",
  "tipo": "ingreso",
  "categoria": { "_id": "...", "nombre": "Ventas" },
  "monto": 5000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "fecha": "2024-01-15T00:00:00.000Z",
  "metodoPago": "transferencia",
  "referencia": "FAC-2024-001",
  "descripcion": "Cobro de factura",
  "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Actualizar

`PATCH /transaccion/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "descripcion": "Descripción actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a012", "descripcion": "Descripción actualizada" }
```
</details>

---

### Eliminar

`DELETE /transaccion/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
