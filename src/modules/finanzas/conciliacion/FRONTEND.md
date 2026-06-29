# Conciliación Bancaria (`/conciliacion`)

Ciclo completo de conciliación bancaria (Res. 40/2016 BCC).

**Ciclo de vida:** `pendiente` → importar extractos → conciliar → `conciliada`

---

### Crear Conciliación

`POST /conciliacion`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CONC-2024-001",
  "cuentaBancaria": "507f1f77bcf86cd799439022",
  "periodo": "01-2024",
  "saldoBanco": 15000.00,
  "saldoLibros": 14800.00,
  "observaciones": "Conciliación mensual"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a003",
  "codigo": "CONC-2024-001",
  "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "periodo": "01-2024",
  "saldoBanco": 15000.00,
  "saldoLibros": 14800.00,
  "diferencia": 200.00,
  "estado": "pendiente",
  "fechaInicio": "2024-01-15T10:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Conciliaciones

`GET /conciliacion`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a003",
    "codigo": "CONC-2024-001",
    "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
    "periodo": "01-2024",
    "saldoBanco": 15000.00,
    "saldoLibros": 14800.00,
    "diferencia": 200.00,
    "estado": "conciliada",
    "fechaInicio": "2024-01-15T10:00:00.000Z"
  }
]
```
</details>

---

### Conciliaciones Pendientes

`GET /conciliacion/pendientes`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a003",
    "codigo": "CONC-2024-001",
    "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
    "periodo": "01-2024",
    "saldoBanco": 15000.00,
    "saldoLibros": 14800.00,
    "diferencia": 200.00,
    "estado": "pendiente"
  }
]
```
</details>

---

### Importar Extracto Bancario

`POST /conciliacion/:id/extractos/importar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "partidas": [
    {
      "fecha": "2024-01-15",
      "descripcion": "Transferencia recibida",
      "monto": 5000.00,
      "tipo": "credito",
      "numeroReferencia": "TRF-001"
    },
    {
      "fecha": "2024-01-16",
      "descripcion": "Pago de cheque",
      "monto": 2000.00,
      "tipo": "debito",
      "numeroReferencia": "CH-000123"
    }
  ]
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "importados": 2,
  "conciliacionId": "507f1f77bcf86cd79943a003",
  "partidas": [
    { "_id": "...", "fecha": "2024-01-15", "monto": 5000.00, "tipo": "credito", "estado": "pendiente" },
    { "_id": "...", "fecha": "2024-01-16", "monto": 2000.00, "tipo": "debito", "estado": "pendiente" }
  ]
}
```
</details>

---

### Extractos Pendientes

`GET /conciliacion/:id/extractos/pendientes`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a004",
    "fecha": "2024-01-15",
    "descripcion": "Transferencia recibida",
    "monto": 5000.00,
    "tipo": "credito",
    "numeroReferencia": "TRF-001",
    "estado": "pendiente"
  }
]
```
</details>

---

### Conciliar Movimiento Manual

`POST /conciliacion/extractos/:extractoId/conciliar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "transaccionId": "507f1f77bcf86cd799439055"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "extractoId": "507f1f77bcf86cd79943a004",
  "transaccionId": "507f1f77bcf86cd799439055",
  "estado": "conciliado",
  "mensaje": "Movimiento conciliado exitosamente"
}
```
</details>

---

### Auto-Conciliación

`POST /conciliacion/:id/auto-conciliar`

Realiza fuzzy match por monto + fecha (±3 días).

<details>
<summary>🔍 Ver response</summary>

```json
{
  "conciliados": 3,
  "pendientes": 2,
  "detalle": [
    { "extractoId": "...", "transaccionId": "...", "monto": 5000.00, "coincidencia": "exacta" },
    { "extractoId": "...", "transaccionId": "...", "monto": 1980.00, "coincidencia": "aproximada" }
  ]
}
```
</details>

---

### Resumen de Conciliación

`GET /conciliacion/:id/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "conciliacion": "CONC-2024-001",
  "saldoBanco": 15000.00,
  "saldoLibros": 14800.00,
  "diferencia": 200.00,
  "totalExtractos": 5,
  "extractosConciliados": 3,
  "extractosPendientes": 2,
  "diferencias": [
    { "tipo": "falta_en_libros", "montoBanco": 5000.00, "montoLibros": 0, "diferencia": 5000.00 }
  ]
}
```
</details>

---

### Obtener Conciliación

`GET /conciliacion/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a003",
  "codigo": "CONC-2024-001",
  "cuentaBancaria": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "periodo": "01-2024",
  "saldoBanco": 15000.00,
  "saldoLibros": 14800.00,
  "diferencia": 200.00,
  "estado": "conciliada",
  "fechaInicio": "2024-01-15T10:00:00.000Z",
  "fechaFin": "2024-01-15T12:00:00.000Z",
  "observaciones": "Conciliación mensual"
}
```
</details>

---

### Procesar Conciliación

`POST /conciliacion/:id/procesar`

Calcula las diferencias entre saldo banco y saldo libros.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a003",
  "estado": "conciliada",
  "diferencia": 0,
  "extractosConciliados": 5,
  "extractosPendientes": 0,
  "mensaje": "Conciliación procesada. Diferencia resuelta."
}
```
</details>

---

### Actualizar Conciliación

`PATCH /conciliacion/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "observaciones": "Actualización de datos de conciliación"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a003",
  "observaciones": "Actualización de datos de conciliación"
}
```
</details>

---

### Eliminar Conciliación

`DELETE /conciliacion/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
