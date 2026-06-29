# Cambio de Divisa (`/cambio-divisa`)

Registro de operaciones de cambio entre divisas (compra, venta, contravalor).

---

### Registrar Operación

`POST /cambio-divisa`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CD-2024-001",
  "monedaOrigen": "507f1f77bcf86cd799439011",
  "monedaDestino": "507f1f77bcf86cd799439022",
  "montoOrigen": 100.00,
  "cuentaOrigen": "507f1f77bcf86cd799439033",
  "cuentaDestino": "507f1f77bcf86cd799439044",
  "cajaOrigen": null,
  "cajaDestino": null,
  "descripcion": "Cambio de USD a CUP"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a022",
  "codigo": "CD-2024-001",
  "monedaOrigen": { "_id": "...", "nombre": "USD" },
  "monedaDestino": { "_id": "...", "nombre": "CUP" },
  "montoOrigen": 100.00,
  "montoDestino": 12000.00,
  "tasaAplicada": 120.00,
  "cuentaOrigen": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "cuentaDestino": { "_id": "...", "nombreBanco": "Banco Metropolitano" },
  "estado": "pendiente",
  "descripcion": "Cambio de USD a CUP",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Operaciones

`GET /cambio-divisa`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a022",
    "codigo": "CD-2024-001",
    "monedaOrigen": { "_id": "...", "nombre": "USD" },
    "monedaDestino": { "_id": "...", "nombre": "CUP" },
    "montoOrigen": 100.00,
    "estado": "ejecutada",
    "fecha": "2024-01-15T10:00:00.000Z"
  }
]
```
</details>

---

### Resumen

`GET /cambio-divisa/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalOperaciones": 10,
  "montoTotalOrigen": 5000.00,
  "montoTotalDestino": 600000.00,
  "porEstado": {
    "pendiente": 2,
    "ejecutada": 7,
    "anulada": 1
  }
}
```
</details>

---

### Obtener por ID

`GET /cambio-divisa/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a022",
  "codigo": "CD-2024-001",
  "monedaOrigen": { "_id": "...", "nombre": "USD" },
  "monedaDestino": { "_id": "...", "nombre": "CUP" },
  "montoOrigen": 100.00,
  "montoDestino": 12000.00,
  "tasaAplicada": 120.00,
  "cuentaOrigen": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "cuentaDestino": { "_id": "...", "nombreBanco": "Banco Metropolitano" },
  "estado": "ejecutada",
  "descripcion": "Cambio de USD a CUP",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Actualizar

`PATCH /cambio-divisa/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "descripcion": "Descripción actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a022", "descripcion": "Descripción actualizada" }
```
</details>

---

### Anular Operación

`POST /cambio-divisa/:id/anular`

Revierte saldos automáticamente.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a022",
  "estado": "anulada",
  "mensaje": "Operación anulada. Saldos revertidos."
}
```
</details>

---

### Eliminar

`DELETE /cambio-divisa/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
