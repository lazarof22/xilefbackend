# Transferencias (`/transferencias`)

Transferencias entre cuentas bancarias y cajas, con ciclo de vida completo.

**Tipos:** `"banco_banco"`, `"banco_caja"`, `"caja_banco"`, `"caja_caja"`

**Ciclo de vida:** `pendiente` → `aplicada` / `rechazada` / `anulada`

---

### Crear Transferencia

`POST /transferencias`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "TRF-2024-001",
  "tipo": "banco_banco",
  "origenCuentaTipo": "banco",
  "origenCuentaId": "507f1f77bcf86cd799439011",
  "destinoCuentaTipo": "banco",
  "destinoCuentaId": "507f1f77bcf86cd799439022",
  "monto": 10000.00,
  "moneda": "507f1f77bcf86cd799439033",
  "comision": 0,
  "fecha": "2024-01-15",
  "descripcion": "Transferencia entre cuentas",
  "comprobante": "COM-2024-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "codigo": "TRF-2024-001",
  "tipo": "banco_banco",
  "origenCuentaTipo": "banco",
  "origenCuentaId": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "destinoCuentaTipo": "banco",
  "destinoCuentaId": { "_id": "...", "nombreBanco": "Banco Metropolitano" },
  "monto": 10000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "estado": "pendiente",
  "fecha": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Transferencias

`GET /transferencias`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a016",
    "codigo": "TRF-2024-001",
    "tipo": "banco_banco",
    "monto": 10000.00,
    "estado": "aplicada",
    "fecha": "2024-01-15T00:00:00.000Z"
  }
]
```
</details>

---

### Transferencias Aplicadas

`GET /transferencias/aplicadas`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a016",
    "codigo": "TRF-2024-001",
    "tipo": "banco_banco",
    "monto": 10000.00,
    "estado": "aplicada",
    "fechaAplicacion": "2024-01-15T12:00:00.000Z"
  }
]
```
</details>

---

### Por Período

`GET /transferencias/periodo?desde=2024-01-01&hasta=2024-01-31`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "...",
    "codigo": "TRF-2024-001",
    "tipo": "banco_banco",
    "monto": 10000.00,
    "estado": "aplicada",
    "fecha": "2024-01-15T00:00:00.000Z"
  }
]
```
</details>

---

### Resumen

`GET /transferencias/resumen?desde=2024-01-01&hasta=2024-01-31`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalTransferencias": 15,
  "totalMonto": 150000.00,
  "porTipo": {
    "banco_banco": { "cantidad": 8, "monto": 100000.00 },
    "banco_caja": { "cantidad": 4, "monto": 30000.00 }
  },
  "porEstado": {
    "pendiente": 2,
    "aplicada": 12,
    "rechazada": 1
  }
}
```
</details>

---

### Obtener por ID

`GET /transferencias/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "codigo": "TRF-2024-001",
  "tipo": "banco_banco",
  "origenCuentaTipo": "banco",
  "origenCuentaId": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "destinoCuentaTipo": "banco",
  "destinoCuentaId": { "_id": "...", "nombreBanco": "Banco Metropolitano" },
  "monto": 10000.00,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "comision": 0,
  "estado": "aplicada",
  "fecha": "2024-01-15T00:00:00.000Z",
  "fechaAplicacion": "2024-01-15T12:00:00.000Z",
  "descripcion": "Transferencia entre cuentas"
}
```
</details>

---

### Actualizar

`PATCH /transferencias/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "descripcion": "Descripción actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a016", "descripcion": "Descripción actualizada" }
```
</details>

---

### Aplicar Transferencia

`POST /transferencias/:id/aplicar`

Actualiza los saldos de origen (decrementa) y destino (incrementa).

<details>
<summary>🔍 Ver request</summary>

```json
{
  "fechaAplicacion": "2024-01-15",
  "referencia": "APL-2024-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "estado": "aplicada",
  "fechaAplicacion": "2024-01-15T12:00:00.000Z",
  "saldoOrigenAnterior": 50000.00,
  "saldoOrigenActual": 40000.00,
  "saldoDestinoAnterior": 20000.00,
  "saldoDestinoActual": 30000.00
}
```
</details>

---

### Rechazar Transferencia

`POST /transferencias/:id/rechazar`

<details>
<summary>🔍 Ver request</summary>

```json
{ "motivo": "Saldo insuficiente en origen" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "estado": "rechazada",
  "motivoRechazo": "Saldo insuficiente en origen"
}
```
</details>

---

### Anular Transferencia

`POST /transferencias/:id/anular`

Si estaba aplicada, revierte los saldos automáticamente.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a016",
  "estado": "anulada",
  "saldoOrigenActual": 50000.00,
  "saldoDestinoActual": 20000.00,
  "mensaje": "Saldos revertidos exitosamente"
}
```
</details>

---

### Eliminar

`DELETE /transferencias/:id` (solo si no está aplicada)

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
