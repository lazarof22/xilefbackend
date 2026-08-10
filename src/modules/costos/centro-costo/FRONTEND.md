# Centro de Costo (`/centro-costo`)

Gestión de centros de costo jerárquicos con clasificación por tipo y departamento.

**Tipos:** `administracion`, `produccion`, `ventas`, `servicios`, `logistica`, `otro`

---

### Registrar Centro de Costo

`POST /centro-costo`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CC-PROD-001",
  "nombre": "Planta Principal",
  "tipo": "produccion",
  "departamento": "507f1f77bcf86cd799439011",
  "centroPadre": "507f1f77bcf86cd799439022",
  "activo": true,
  "descripcion": "Centro de costo de la planta principal de producción"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a100",
  "codigo": "CC-PROD-001",
  "nombre": "Planta Principal",
  "tipo": "produccion",
  "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
  "centroPadre": { "_id": "507f1f77bcf86cd799439022", "nombre": "Operaciones" },
  "activo": true,
  "descripcion": "Centro de costo de la planta principal de producción",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Centros de Costo

`GET /centro-costo`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a100",
    "codigo": "CC-PROD-001",
    "nombre": "Planta Principal",
    "tipo": "produccion",
    "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
    "centroPadre": { "_id": "507f1f77bcf86cd799439022", "nombre": "Operaciones" },
    "activo": true,
    "descripcion": "Centro de costo de la planta principal de producción",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```
</details>

---

### Obtener Centro de Costo por ID

`GET /centro-costo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a100",
  "codigo": "CC-PROD-001",
  "nombre": "Planta Principal",
  "tipo": "produccion",
  "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
  "centroPadre": { "_id": "507f1f77bcf86cd799439022", "nombre": "Operaciones" },
  "activo": true,
  "descripcion": "Centro de costo de la planta principal de producción",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Subcentros de un Padre

`GET /centro-costo/subcentros/:id`

Retorna todos los centros de costo cuyo `centroPadre` coincide con el ID provisto.

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a101",
    "codigo": "CC-PROD-002",
    "nombre": "Línea de Ensamblaje",
    "tipo": "produccion",
    "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
    "centroPadre": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "activo": true,
    "descripcion": "Subcentro de línea de ensamblaje",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd79943a102",
    "codigo": "CC-PROD-003",
    "nombre": "Control de Calidad",
    "tipo": "produccion",
    "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
    "centroPadre": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "activo": true,
    "descripcion": "Subcentro de control de calidad",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
]
```
</details>

---

### Por Tipo

`GET /centro-costo/tipo/:tipo`

Filtra por `tipo` (`administracion`, `produccion`, `ventas`, `servicios`, `logistica`, `otro`).

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a100",
    "codigo": "CC-PROD-001",
    "nombre": "Planta Principal",
    "tipo": "produccion",
    "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
    "centroPadre": null,
    "activo": true,
    "descripcion": "Centro de costo de la planta principal de producción"
  },
  {
    "_id": "507f1f77bcf86cd79943a101",
    "codigo": "CC-PROD-002",
    "nombre": "Línea de Ensamblaje",
    "tipo": "produccion",
    "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
    "centroPadre": { "_id": "507f1f77bcf86cd79943a100", "nombre": "Planta Principal" },
    "activo": true
  }
]
```
</details>

---

### Actualizar Centro de Costo

`PATCH /centro-costo/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Planta Principal (Renovada)",
  "descripcion": "Actualizado con nueva línea de producción",
  "activo": true
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a100",
  "codigo": "CC-PROD-001",
  "nombre": "Planta Principal (Renovada)",
  "tipo": "produccion",
  "departamento": { "_id": "507f1f77bcf86cd799439011", "nombre": "Producción" },
  "centroPadre": { "_id": "507f1f77bcf86cd799439022", "nombre": "Operaciones" },
  "activo": true,
  "descripcion": "Actualizado con nueva línea de producción",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-02-10T14:00:00.000Z"
}
```
</details>

---

### Eliminar Centro de Costo

`DELETE /centro-costo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
