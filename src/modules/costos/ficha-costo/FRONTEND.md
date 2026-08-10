# Ficha de Costo (`/ficha-costo`)

Fichas de costo con cálculo automático de costo total y unitario al crear o actualizar.

**Cálculo automático:** `costoTotal = materiaPrima + manoObraDirecta + costosIndirectos + otrosCostos` → `costoUnitario = costoTotal / unidadesProducidas`

---

### Registrar Ficha de Costo

`POST /ficha-costo`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "FC-2026-001",
  "nombre": "Ficha Producto A - Agosto 2026",
  "producto": "507f1f77bcf86cd799439011",
  "centroCosto": "507f1f77bcf86cd79943a100",
  "materiaPrima": 15000.00,
  "manoObraDirecta": 8000.00,
  "costosIndirectos": 4500.00,
  "otrosCostos": 2500.00,
  "unidadesProducidas": 500,
  "moneda": "507f1f77bcf86cd799439033",
  "periodo": "2026-08",
  "observaciones": "Producción estándar agosto"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a200",
  "codigo": "FC-2026-001",
  "nombre": "Ficha Producto A - Agosto 2026",
  "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
  "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
  "materiaPrima": 15000.00,
  "manoObraDirecta": 8000.00,
  "costosIndirectos": 4500.00,
  "otrosCostos": 2500.00,
  "costoTotal": 30000.00,
  "unidadesProducidas": 500,
  "costoUnitario": 60.00,
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
  "periodo": "2026-08",
  "observaciones": "Producción estándar agosto",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-01T10:00:00.000Z"
}
```
</details>

---

### Listar Fichas de Costo

`GET /ficha-costo`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a200",
    "codigo": "FC-2026-001",
    "nombre": "Ficha Producto A - Agosto 2026",
    "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "costoTotal": 30000.00,
    "unidadesProducidas": 500,
    "costoUnitario": 60.00,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-01T10:00:00.000Z"
  }
]
```
</details>

---

### Obtener Ficha de Costo por ID

`GET /ficha-costo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a200",
  "codigo": "FC-2026-001",
  "nombre": "Ficha Producto A - Agosto 2026",
  "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
  "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
  "materiaPrima": 15000.00,
  "manoObraDirecta": 8000.00,
  "costosIndirectos": 4500.00,
  "otrosCostos": 2500.00,
  "costoTotal": 30000.00,
  "unidadesProducidas": 500,
  "costoUnitario": 60.00,
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
  "periodo": "2026-08",
  "observaciones": "Producción estándar agosto",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-01T10:00:00.000Z"
}
```
</details>

---

### Por Producto

`GET /ficha-costo/producto/:productoId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a200",
    "codigo": "FC-2026-001",
    "nombre": "Ficha Producto A - Agosto 2026",
    "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "costoTotal": 30000.00,
    "unidadesProducidas": 500,
    "costoUnitario": 60.00,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" }
  },
  {
    "_id": "507f1f77bcf86cd79943a201",
    "codigo": "FC-2026-005",
    "nombre": "Ficha Producto A - Julio 2026",
    "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "costoTotal": 28000.00,
    "unidadesProducidas": 480,
    "costoUnitario": 58.33,
    "periodo": "2026-07",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" }
  }
]
```
</details>

---

### Por Centro de Costo

`GET /ficha-costo/centro-costo/:centroCostoId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a200",
    "codigo": "FC-2026-001",
    "nombre": "Ficha Producto A - Agosto 2026",
    "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "costoTotal": 30000.00,
    "unidadesProducidas": 500,
    "costoUnitario": 60.00,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" }
  },
  {
    "_id": "507f1f77bcf86cd79943a202",
    "codigo": "FC-2026-002",
    "nombre": "Ficha Producto B - Agosto 2026",
    "producto": { "_id": "507f1f77bcf86cd799439012", "nombre": "Producto B" },
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "costoTotal": 22000.00,
    "unidadesProducidas": 300,
    "costoUnitario": 73.33,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" }
  }
]
```
</details>

---

### Por Período

`GET /ficha-costo/periodo/:periodo`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a200",
    "codigo": "FC-2026-001",
    "nombre": "Ficha Producto A - Agosto 2026",
    "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "costoTotal": 30000.00,
    "unidadesProducidas": 500,
    "costoUnitario": 60.00,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" }
  },
  {
    "_id": "507f1f77bcf86cd79943a202",
    "codigo": "FC-2026-002",
    "nombre": "Ficha Producto B - Agosto 2026",
    "producto": { "_id": "507f1f77bcf86cd799439012", "nombre": "Producto B" },
    "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "costoTotal": 22000.00,
    "unidadesProducidas": 300,
    "costoUnitario": 73.33,
    "periodo": "2026-08",
    "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" }
  }
]
```
</details>

---

### Actualizar Ficha de Costo

`PATCH /ficha-costo/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "unidadesProducidas": 600,
  "observaciones": "Ajuste de unidades producidas"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a200",
  "codigo": "FC-2026-001",
  "nombre": "Ficha Producto A - Agosto 2026",
  "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producto A" },
  "centroCosto": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
  "materiaPrima": 15000.00,
  "manoObraDirecta": 8000.00,
  "costosIndirectos": 4500.00,
  "otrosCostos": 2500.00,
  "costoTotal": 30000.00,
  "unidadesProducidas": 600,
  "costoUnitario": 50.00,
  "moneda": { "_id": "507f1f77bcf86cd799439033", "nombre": "CUP" },
  "periodo": "2026-08",
  "observaciones": "Ajuste de unidades producidas",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-05T09:00:00.000Z"
}
```
</details>

---

### Eliminar Ficha de Costo

`DELETE /ficha-costo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
