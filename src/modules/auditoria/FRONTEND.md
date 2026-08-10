# Auditoría (/auditoria)

Registro automático de acciones CREATE, UPDATE y DELETE sobre las entidades del sistema.

**Acciones:** `"CREATE"`, `"UPDATE"`, `"DELETE"`  
**Módulos:** `"auth"`, `"clientes"`, `"compra"`, `"configuracion"`, `"contabilidad"`, `"finanzas"`, `"inventario"`, `"licencia"`, `"nomencladores"`, `"venta"`, `"proveedores"`, `"auditoria"`

> El registro se dispara mediante el decorador `@Auditable({ entidad, modulo? })` y el `AuditInterceptor`. No se documentan aquí los endpoints que lo consumen porque pertenecen a otros módulos.

---

### Consultar Registros de Auditoría

`GET /auditoria`

**Query params (todos opcionales):** `entidad`, `usuarioId`, `accion`, `modulo`, `fechaDesde`, `fechaHasta`, `limit`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "entidad": "Producto",
    "entidadId": "507f1f77bcf86cd799439022",
    "accion": "UPDATE",
    "usuarioId": "507f1f77bcf86cd799439033",
    "usuarioNombre": "Juan Pérez",
    "modulo": "inventario",
    "descripcion": "Producto actualizado — cambio de precio",
    "valoresAnteriores": {
      "precio": 1500.00
    },
    "valoresNuevos": {
      "precio": 1750.00
    },
    "ip": "192.168.1.100",
    "createdAt": "2024-03-15T14:30:00.000Z",
    "updatedAt": "2024-03-15T14:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "entidad": "Cliente",
    "entidadId": "507f1f77bcf86cd799439044",
    "accion": "CREATE",
    "usuarioId": "507f1f77bcf86cd799439033",
    "usuarioNombre": "Juan Pérez",
    "modulo": "clientes",
    "descripcion": "Cliente creado",
    "valoresNuevos": {
      "nombre": "María García",
      "ci": "90010112345"
    },
    "ip": "192.168.1.100",
    "createdAt": "2024-03-15T12:00:00.000Z",
    "updatedAt": "2024-03-15T12:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "entidad": "Venta",
    "entidadId": "507f1f77bcf86cd799439055",
    "accion": "DELETE",
    "usuarioId": "507f1f77bcf86cd799439066",
    "usuarioNombre": "Ana López",
    "modulo": "venta",
    "descripcion": "Venta anulada",
    "valoresAnteriores": {
      "total": 4500.00,
      "estado": "completada"
    },
    "ip": "192.168.1.101",
    "createdAt": "2024-03-14T09:15:00.000Z",
    "updatedAt": "2024-03-14T09:15:00.000Z"
  }
]
```
</details>

---

### Auditoría por Entidad

`GET /auditoria/entidad/:entidad`

**Query params (opcional):** `entidadId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "entidad": "Producto",
    "entidadId": "507f1f77bcf86cd799439022",
    "accion": "UPDATE",
    "usuarioId": "507f1f77bcf86cd799439033",
    "usuarioNombre": "Juan Pérez",
    "modulo": "inventario",
    "descripcion": "Producto actualizado — cambio de precio",
    "valoresAnteriores": {
      "precio": 1500.00
    },
    "valoresNuevos": {
      "precio": 1750.00
    },
    "ip": "192.168.1.100",
    "createdAt": "2024-03-15T14:30:00.000Z",
    "updatedAt": "2024-03-15T14:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "entidad": "Producto",
    "entidadId": "507f1f77bcf86cd799439022",
    "accion": "CREATE",
    "usuarioId": "507f1f77bcf86cd799439033",
    "usuarioNombre": "Juan Pérez",
    "modulo": "inventario",
    "descripcion": "Producto creado",
    "valoresNuevos": {
      "nombre": "Laptop HP",
      "precio": 1500.00
    },
    "ip": "192.168.1.100",
    "createdAt": "2024-03-10T08:00:00.000Z",
    "updatedAt": "2024-03-10T08:00:00.000Z"
  }
]
```
</details>

---

### Resumen por Módulo

`GET /auditoria/resumen`

**Query params (todos opcionales):** `fechaDesde`, `fechaHasta`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "venta",
    "total": 245,
    "acciones": ["CREATE", "UPDATE", "DELETE", "CREATE", "UPDATE"]
  },
  {
    "_id": "inventario",
    "total": 180,
    "acciones": ["CREATE", "UPDATE", "UPDATE", "DELETE"]
  },
  {
    "_id": "clientes",
    "total": 95,
    "acciones": ["CREATE", "UPDATE", "CREATE"]
  },
  {
    "_id": "compra",
    "total": 62,
    "acciones": ["CREATE", "UPDATE", "DELETE"]
  },
  {
    "_id": "finanzas",
    "total": 40,
    "acciones": ["CREATE", "UPDATE"]
  },
  {
    "_id": "contabilidad",
    "total": 33,
    "acciones": ["CREATE", "UPDATE"]
  }
]
```
</details>

---

### Obtener Registro por ID

`GET /auditoria/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "entidad": "Producto",
  "entidadId": "507f1f77bcf86cd799439022",
  "accion": "UPDATE",
  "usuarioId": "507f1f77bcf86cd799439033",
  "usuarioNombre": "Juan Pérez",
  "modulo": "inventario",
  "descripcion": "Producto actualizado — cambio de precio",
  "valoresAnteriores": {
    "precio": 1500.00
  },
  "valoresNuevos": {
    "precio": 1750.00
  },
  "ip": "192.168.1.100",
  "createdAt": "2024-03-15T14:30:00.000Z",
  "updatedAt": "2024-03-15T14:30:00.000Z"
}
```
</details>
