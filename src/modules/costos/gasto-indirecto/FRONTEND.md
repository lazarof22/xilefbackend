# Gasto Indirecto (`/gasto-indirecto`)

Gastos indirectos con método de prorrateo, asignables a centros de costo y distribuibles por período.

**Métodos de prorrateo:** `horas_directas`, `unidades_producidas`, `valor_materia_prima`, `mano_obra_directa`, `porcentaje`

---

### Registrar Gasto Indirecto

`POST /gasto-indirecto`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "GI-2026-001",
  "descripcion": "Electricidad planta - Agosto 2026",
  "monto": 12500.00,
  "centroCosto": "507f1f77bcf86cd79943a100",
  "tipoGasto": "507f1f77bcf86cd799439044",
  "metodoProrrateo": "unidades_producidas",
  "porcentajeProrrateo": 100,
  "distribuido": false,
  "periodo": "2026-08",
  "moneda": "507f1f77bcf86cd799439033",
  "fechaRegistro": "2026-08-01",
  "observaciones": "Factura UNE agosto"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a300",
  "codigo": "GI-2026-001",
  "descripcion": "Electricidad planta - Agosto 2026",
  "monto": 12500.00,
  "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
  "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
  "metodoProrrateo": "unidades_producidas",
  "porcentajeProrrateo": 100,
  "distribuido": false,
  "periodo": "2026-08",
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
  "fechaRegistro": "2026-08-01T00:00:00.000Z",
  "observaciones": "Factura UNE agosto",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-01T10:00:00.000Z"
}
```
</details>

---

### Listar Gastos Indirectos

`GET /gasto-indirecto`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a300",
    "codigo": "GI-2026-001",
    "descripcion": "Electricidad planta - Agosto 2026",
    "monto": 12500.00,
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
    "metodoProrrateo": "unidades_producidas",
    "porcentajeProrrateo": 100,
    "distribuido": false,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
    "fechaRegistro": "2026-08-01T00:00:00.000Z",
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
]
```
</details>

---

### Obtener Gasto Indirecto por ID

`GET /gasto-indirecto/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a300",
  "codigo": "GI-2026-001",
  "descripcion": "Electricidad planta - Agosto 2026",
  "monto": 12500.00,
  "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
  "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
  "metodoProrrateo": "unidades_producidas",
  "porcentajeProrrateo": 100,
  "distribuido": false,
  "periodo": "2026-08",
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
  "fechaRegistro": "2026-08-01T00:00:00.000Z",
  "observaciones": "Factura UNE agosto",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-01T10:00:00.000Z"
}
```
</details>

---

### Por Centro de Costo

`GET /gasto-indirecto/centro-costo/:centroCostoId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a300",
    "codigo": "GI-2026-001",
    "descripcion": "Electricidad planta - Agosto 2026",
    "monto": 12500.00,
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
    "metodoProrrateo": "unidades_producidas",
    "distribuido": false,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
    "fechaRegistro": "2026-08-01T00:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd79943a301",
    "codigo": "GI-2026-002",
    "descripcion": "Mantenimiento equipos - Agosto 2026",
    "monto": 4500.00,
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "tipoGasto": { "_id": "507f1f77bcf86cd799439045", "nombre": "Mantenimiento" },
    "metodoProrrateo": "horas_directas",
    "distribuido": false,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
    "fechaRegistro": "2026-08-02T00:00:00.000Z"
  }
]
```
</details>

---

### Por Período

`GET /gasto-indirecto/periodo/:periodo`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a300",
    "codigo": "GI-2026-001",
    "descripcion": "Electricidad planta - Agosto 2026",
    "monto": 12500.00,
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
    "metodoProrrateo": "unidades_producidas",
    "distribuido": false,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
    "fechaRegistro": "2026-08-01T00:00:00.000Z"
  }
]
```
</details>

---

### No Distribuidos

`GET /gasto-indirecto/no-distribuidos/:periodo`

Retorna los gastos indirectos del período que aún no han sido distribuidos (`distribuido: false`).

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a300",
    "codigo": "GI-2026-001",
    "descripcion": "Electricidad planta - Agosto 2026",
    "monto": 12500.00,
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
    "metodoProrrateo": "unidades_producidas",
    "porcentajeProrrateo": 100,
    "distribuido": false,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
    "fechaRegistro": "2026-08-01T00:00:00.000Z"
  }
]
```
</details>

---

### Distribuir Gasto Indirecto

`PATCH /gasto-indirecto/distribuir/:id`

Marca el gasto indirecto como `distribuido: true`. No requiere body.

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a300",
  "codigo": "GI-2026-001",
  "descripcion": "Electricidad planta - Agosto 2026",
  "monto": 12500.00,
  "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
  "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
  "metodoProrrateo": "unidades_producidas",
  "porcentajeProrrateo": 100,
  "distribuido": true,
  "periodo": "2026-08",
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
  "fechaRegistro": "2026-08-01T00:00:00.000Z",
  "observaciones": "Factura UNE agosto",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-10T15:00:00.000Z"
}
```
</details>

---

### Actualizar Gasto Indirecto

`PATCH /gasto-indirecto/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 13500.00,
  "observaciones": "Monto ajustado según factura corregida"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a300",
  "codigo": "GI-2026-001",
  "descripcion": "Electricidad planta - Agosto 2026",
  "monto": 13500.00,
  "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
  "tipoGasto": { "_id": "507f1f77bcf86cd799439044", "nombre": "Servicios Públicos" },
  "metodoProrrateo": "unidades_producidas",
  "porcentajeProrrateo": 100,
  "distribuido": false,
  "periodo": "2026-08",
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
  "fechaRegistro": "2026-08-01T00:00:00.000Z",
  "observaciones": "Monto ajustado según factura corregida",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-10T16:00:00.000Z"
}
```
</details>

---

### Eliminar Gasto Indirecto

`DELETE /gasto-indirecto/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
