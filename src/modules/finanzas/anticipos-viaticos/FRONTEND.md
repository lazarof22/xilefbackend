# Anticipos y Viáticos (`/anticipos-viaticos`)

Gestión de anticipos a empleados (viáticos, anticipos de sueldo) y liquidaciones.

**Tipos de anticipo:** `"viatico"`, `"anticipo_sueldo"`, `"anticipo_proveedor"`, `"otro"`

**Ciclo de vida (viático):** `entregado` → liquidación → `aprobada` / `rechazada`

---

### Crear Anticipo

`POST /anticipos-viaticos/anticipo`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "ANT-2024-001",
  "tipo": "viatico",
  "beneficiario": "507f1f77bcf86cd799439011",
  "monto": 5000.00,
  "fecha": "2024-01-15",
  "cajaOrigen": "507f1f77bcf86cd799439022",
  "cuentaBancariaOrigen": "507f1f77bcf86cd799439033",
  "descripcion": "Viático para viaje a La Habana"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a019",
  "codigo": "ANT-2024-001",
  "tipo": "viatico",
  "beneficiario": { "_id": "...", "nombre": "María García" },
  "monto": 5000.00,
  "fecha": "2024-01-15T00:00:00.000Z",
  "estado": "entregado",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Anticipos

`GET /anticipos-viaticos/anticipos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a019",
    "codigo": "ANT-2024-001",
    "beneficiario": { "_id": "...", "nombre": "María García" },
    "tipo": "viatico",
    "monto": 5000.00,
    "fecha": "2024-01-15T00:00:00.000Z",
    "estado": "entregado"
  }
]
```
</details>

---

### Anticipos Pendientes de Liquidar

`GET /anticipos-viaticos/anticipos/pendientes`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a019",
    "codigo": "ANT-2024-001",
    "beneficiario": { "_id": "...", "nombre": "María García" },
    "monto": 5000.00,
    "estado": "entregado"
  }
]
```
</details>

---

### Anticipos por Beneficiario

`GET /anticipos-viaticos/beneficiario/:empleadoId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a019",
    "codigo": "ANT-2024-001",
    "tipo": "viatico",
    "monto": 5000.00,
    "estado": "entregado"
  }
]
```
</details>

---

### Obtener Anticipo

`GET /anticipos-viaticos/anticipos/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a019",
  "codigo": "ANT-2024-001",
  "tipo": "viatico",
  "beneficiario": { "_id": "...", "nombre": "María García" },
  "monto": 5000.00,
  "fecha": "2024-01-15T00:00:00.000Z",
  "cajaOrigen": { "_id": "...", "nombre": "Caja Principal CUP" },
  "cuentaBancariaOrigen": { "_id": "...", "nombreBanco": "BFA" },
  "descripcion": "Viático para viaje a La Habana",
  "estado": "entregado"
}
```
</details>

---

### Actualizar Anticipo

`PATCH /anticipos-viaticos/anticipos/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "descripcion": "Descripción actualizada" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a019", "descripcion": "Descripción actualizada" }
```
</details>

---

### Eliminar Anticipo

`DELETE /anticipos-viaticos/anticipos/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>

---

### Liquidar Viático

`POST /anticipos-viaticos/liquidacion`

El backend calcula automáticamente la diferencia: sobrante / exacto / faltante.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "anticipo": "507f1f77bcf86cd79943a019",
  "fecha": "2024-01-20",
  "gastoReal": 4800.00,
  "detalleGastos": [
    { "descripcion": "Alojamiento", "monto": 2000.00, "categoria": "507f1f77bcf86cd799439044", "fecha": "2024-01-16" },
    { "descripcion": "Alimentación", "monto": 1500.00, "categoria": "507f1f77bcf86cd799439044", "fecha": "2024-01-17" },
    { "descripcion": "Transporte", "monto": 1300.00, "categoria": "507f1f77bcf86cd799439044", "fecha": "2024-01-18" }
  ],
  "observaciones": "Gastos del viaje a La Habana"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a020",
  "anticipo": { "_id": "507f1f77bcf86cd79943a019", "codigo": "ANT-2024-001" },
  "fecha": "2024-01-20T00:00:00.000Z",
  "montoAnticipo": 5000.00,
  "gastoReal": 4800.00,
  "diferencia": 200.00,
  "resultado": "sobrante",
  "estado": "pendiente",
  "detalleGastos": [
    { "descripcion": "Alojamiento", "monto": 2000.00 },
    { "descripcion": "Alimentación", "monto": 1500.00 },
    { "descripcion": "Transporte", "monto": 1300.00 }
  ]
}
```
</details>

---

### Obtener Liquidaciones

`GET /anticipos-viaticos/liquidaciones`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a020",
    "anticipo": { "_id": "...", "codigo": "ANT-2024-001" },
    "montoAnticipo": 5000.00,
    "gastoReal": 4800.00,
    "diferencia": 200.00,
    "resultado": "sobrante",
    "estado": "pendiente"
  }
]
```
</details>

---

### Aprobar Liquidación

`POST /anticipos-viaticos/liquidacion/:id/aprobar`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a020",
  "estado": "aprobada",
  "anticipo": { "_id": "...", "codigo": "ANT-2024-001", "estado": "liquidado" },
  "mensaje": "Liquidación aprobada. Anticipo cerrado."
}
```
</details>

---

### Rechazar Liquidación

`POST /anticipos-viaticos/liquidacion/:id/rechazar`

<details>
<summary>🔍 Ver request</summary>

```json
{ "motivo": "Faltan comprobantes de gastos" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a020",
  "estado": "rechazada",
  "motivoRechazo": "Faltan comprobantes de gastos"
}
```
</details>

---

### Resumen

`GET /anticipos-viaticos/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalAnticipos": 10,
  "montoTotalEntregado": 50000.00,
  "montoTotalLiquidado": 42000.00,
  "montoPendienteLiquidar": 8000.00,
  "cantidadPendientes": 3,
  "cantidadLiquidados": 7
}
```
</details>
