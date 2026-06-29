# Transfermovil — Pasarela de Pago (`/transfermovil`)

Generación de códigos QR (estáticos y dinámicos) y webhook para pagos desde Transfermovil.

**Estados:** `"PENDIENTE"`, `"CONFIRMADO"`, `"RECHAZADO"`, `"REEMBOLSO"`

---

### Webhook

`POST /transfermovil/webhook`

Procesa el webhook y registra el pago.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "evento": "pago_confirmado",
  "id_operacion": "TMF-2024-001",
  "monto": 2500.00,
  "moneda": "CUP",
  "fecha": "2024-01-15T10:30:00.000Z",
  "telefono": "+5351234567",
  "identificador_cliente": "cli_001",
  "referencia": "FAC-2024-001",
  "metadata": {}
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "recibido": true,
  "mensaje": "Webhook procesado exitosamente",
  "transaccionCreada": "507f1f77bcf86cd79943a013"
}
```
</details>

---

### Generar QR Estático

`POST /transfermovil/qr/estatico`

Genera un QR para pagos recurrentes (monto lo define el cliente).

<details>
<summary>🔍 Ver request</summary>

```json
{
  "telefono": "+5351234567",
  "identificadorComerciante": "COM-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a014",
  "telefono": "+5351234567",
  "identificadorComerciante": "COM-001",
  "qrData": "data:image/png;base64,...",
  "activo": true,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Generar QR Dinámico

`POST /transfermovil/qr/dinamico`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 2500.00,
  "concepto": "Factura FAC-2024-001",
  "referencia": "CXC-2024-001",
  "vencimiento": "2024-01-20T23:59:59.000Z"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a015",
  "monto": 2500.00,
  "concepto": "Factura FAC-2024-001",
  "referencia": "CXC-2024-001",
  "vencimiento": "2024-01-20T23:59:59.000Z",
  "qrData": "data:image/png;base64,...",
  "estado": "pendiente",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Pagos

`GET /transfermovil`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a013",
    "idOperacion": "TMF-2024-001",
    "monto": 2500.00,
    "moneda": "CUP",
    "estado": "confirmado",
    "fecha": "2024-01-15T10:30:00.000Z",
    "referencia": "FAC-2024-001"
  }
]
```
</details>

---

### Listar QR Estáticos

`GET /transfermovil/qr-estaticos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a014",
    "telefono": "+5351234567",
    "identificadorComerciante": "COM-001",
    "activo": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```
</details>

---

### Pagos por Estado

`GET /transfermovil/estado/PENDIENTE`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "...",
    "idOperacion": "TMF-2024-002",
    "monto": 1500.00,
    "estado": "pendiente",
    "fecha": "2024-01-15T11:00:00.000Z"
  }
]
```
</details>

---

### Resumen

`GET /transfermovil/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalPagos": 25,
  "montoTotal": 50000.00,
  "porEstado": {
    "pendiente": 5,
    "confirmado": 18,
    "rechazado": 1,
    "reembolso": 1
  }
}
```
</details>

---

### Obtener Pago por ID

`GET /transfermovil/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a013",
  "idOperacion": "TMF-2024-001",
  "evento": "pago_confirmado",
  "monto": 2500.00,
  "moneda": "CUP",
  "fecha": "2024-01-15T10:30:00.000Z",
  "telefono": "+5351234567",
  "referencia": "FAC-2024-001",
  "estado": "confirmado",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```
</details>
