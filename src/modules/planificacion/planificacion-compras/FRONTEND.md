# Planificación de Compras (`/planificacion-compras`)

Planes de compra de productos a proveedores, con ejecución por cantidad y ciclo de vida completo.

**Estados:** `planificado` → `en_proceso` → `completado` / `cancelado`

**Prioridades:** `baja`, `media`, `alta`, `urgente`

Al registrar una compra, se acumula en `cantidadComprada`. Si la cantidad comprada alcanza o supera la planificada, el plan pasa automáticamente a `completado`.

---

### Crear Plan de Compra

`POST /planificacion-compras`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "PC-2026-001",
  "producto": "507f1f77bcf86cd799439011",
  "cantidadPlanificada": 500,
  "precioEstimado": 45.50,
  "proveedorPreferido": "507f1f77bcf86cd799439022",
  "centroCosto": "507f1f77bcf86cd799439033",
  "prioridad": "alta",
  "fechaPlanificada": "2026-03-15",
  "moneda": "507f1f77bcf86cd799439044",
  "notas": "Compra trimestral de materia prima"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a020",
  "codigo": "PC-2026-001",
  "producto": "507f1f77bcf86cd799439011",
  "cantidadPlanificada": 500,
  "cantidadComprada": 0,
  "precioEstimado": 45.50,
  "proveedorPreferido": "507f1f77bcf86cd799439022",
  "centroCosto": "507f1f77bcf86cd799439033",
  "prioridad": "alta",
  "fechaPlanificada": "2026-03-15T00:00:00.000Z",
  "estado": "planificado",
  "moneda": "507f1f77bcf86cd799439044",
  "notas": "Compra trimestral de materia prima",
  "createdAt": "2026-02-01T10:00:00.000Z",
  "updatedAt": "2026-02-01T10:00:00.000Z"
}
```
</details>

---

### Listar Planes de Compra

`GET /planificacion-compras`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a020",
    "codigo": "PC-2026-001",
    "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Acero Inoxidable 304" },
    "cantidadPlanificada": 500,
    "cantidadComprada": 200,
    "precioEstimado": 45.50,
    "proveedorPreferido": { "_id": "507f1f77bcf86cd799439022", "nombre": "Proveedor ABC" },
    "fechaPlanificada": "2026-03-15T00:00:00.000Z",
    "estado": "en_proceso",
    "prioridad": "alta"
  }
]
```
</details>

---

### Planes Pendientes

`GET /planificacion-compras/pendientes`

Retorna solo los planes en estado `planificado` o `en_proceso`.

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a020",
    "codigo": "PC-2026-001",
    "producto": { "_id": "...", "nombre": "Acero Inoxidable 304" },
    "cantidadPlanificada": 500,
    "cantidadComprada": 200,
    "fechaPlanificada": "2026-03-15T00:00:00.000Z",
    "estado": "en_proceso",
    "prioridad": "alta"
  }
]
```
</details>

---

### Por Producto

`GET /planificacion-compras/producto?productoId=507f1f77bcf86cd799439011`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a020",
    "codigo": "PC-2026-001",
    "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Acero Inoxidable 304" },
    "cantidadPlanificada": 500,
    "cantidadComprada": 200,
    "precioEstimado": 45.50,
    "fechaPlanificada": "2026-03-15T00:00:00.000Z",
    "estado": "en_proceso",
    "prioridad": "alta"
  }
]
```
</details>

---

### Por Proveedor

`GET /planificacion-compras/proveedor?proveedorId=507f1f77bcf86cd799439022`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a020",
    "codigo": "PC-2026-001",
    "producto": { "_id": "...", "nombre": "Acero Inoxidable 304" },
    "cantidadPlanificada": 500,
    "cantidadComprada": 200,
    "proveedorPreferido": { "_id": "507f1f77bcf86cd799439022", "nombre": "Proveedor ABC" },
    "fechaPlanificada": "2026-03-15T00:00:00.000Z",
    "estado": "en_proceso",
    "prioridad": "alta"
  }
]
```
</details>

---

### Por Estado

`GET /planificacion-compras/estado?estado=en_proceso`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a020",
    "codigo": "PC-2026-001",
    "producto": { "_id": "...", "nombre": "Acero Inoxidable 304" },
    "cantidadPlanificada": 500,
    "cantidadComprada": 200,
    "fechaPlanificada": "2026-03-15T00:00:00.000Z",
    "estado": "en_proceso",
    "prioridad": "alta"
  }
]
```
</details>

---

### Obtener por ID

`GET /planificacion-compras/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a020",
  "codigo": "PC-2026-001",
  "producto": { "_id": "507f1f77bcf86cd799439011", "nombre": "Acero Inoxidable 304" },
  "cantidadPlanificada": 500,
  "cantidadComprada": 200,
  "precioEstimado": 45.50,
  "proveedorPreferido": { "_id": "507f1f77bcf86cd799439022", "nombre": "Proveedor ABC" },
  "centroCosto": { "_id": "507f1f77bcf86cd799439033", "nombre": "Producción" },
  "prioridad": "alta",
  "fechaPlanificada": "2026-03-15T00:00:00.000Z",
  "fechaCompra": "2026-03-20T16:30:00.000Z",
  "estado": "en_proceso",
  "moneda": { "_id": "507f1f77bcf86cd799439044", "nombre": "USD" },
  "notas": "Compra trimestral de materia prima",
  "createdAt": "2026-02-01T10:00:00.000Z",
  "updatedAt": "2026-03-20T16:30:00.000Z"
}
```
</details>

---

### Actualizar

`PATCH /planificacion-compras/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "precioEstimado": 48.00,
  "prioridad": "urgente",
  "notas": "Prioridad ajustada por aumento de demanda"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a020",
  "precioEstimado": 48.00,
  "prioridad": "urgente",
  "notas": "Prioridad ajustada por aumento de demanda"
}
```
</details>

---

### Registrar Compra

`POST /planificacion-compras/:id/comprar?cantidad=100`

Registra la compra de una cantidad de producto. Acumula en `cantidadComprada` y actualiza `fechaCompra`. Si el plan estaba en `planificado`, pasa a `en_proceso`. Si `cantidadComprada` alcanza o supera `cantidadPlanificada`, el plan pasa automáticamente a `completado`. No se puede comprar sobre un plan `completado` ni `cancelado`.

**ⓘ La cantidad debe ser mayor a 0.**

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a020",
  "cantidadComprada": 300,
  "fechaCompra": "2026-03-25T10:15:00.000Z",
  "estado": "en_proceso"
}
```
</details>

---

### Eliminar

`DELETE /planificacion-compras/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
