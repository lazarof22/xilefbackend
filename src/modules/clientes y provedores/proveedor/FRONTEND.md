# Proveedores (`/proveedor`)

Gestión de proveedores con calificación, estados y seguimiento contractual.

**Estado del proveedor:** `"activo"`, `"inactivo"`, `"suspendido"`, `"evaluacion"`

**Condición de pago:** `"contado"`, `"15_dias"`, `"30_dias"`, `"45_dias"`, `"60_dias"`, `"90_dias"`

---

### Registrar Proveedor

`POST /proveedor`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "PROV-001",
  "nombre": "Distribuidora Nacional S.A.",
  "nit": "12345678901234",
  "codigoREU": "REU-2024-001",
  "empresa": "507f1f77bcf86cd799439011",
  "tipo": "507f1f77bcf86cd799439012",
  "categoriasProducto": ["507f1f77bcf86cd799439013"],
  "condicionPago": "30_dias",
  "monedaPreferida": "507f1f77bcf86cd799439014",
  "descuentoHabitual": 5,
  "cuentaBancariaMLC": "MLC-123-456-789",
  "cuentaBancariaCUP": "CUP-987-654-321",
  "contactoNombre": "Juan Pérez",
  "contactoTelefono": "+53 51234567",
  "contactoEmail": "juan@distribuidora.cu",
  "contratoVigente": "CTR-2024-001",
  "fechaVencimientoContrato": "2025-12-31",
  "tipoContrato": "507f1f77bcf86cd799439015",
  "notas": "Proveedor preferencial para insumos de oficina"
}
```

</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigo": "PROV-001",
  "nombre": "Distribuidora Nacional S.A.",
  "nit": "12345678901234",
  "codigoREU": "REU-2024-001",
  "empresa": { "_id": "507f1f77bcf86cd799439011", "nombre": "XILEF S.A." },
  "tipo": { "_id": "507f1f77bcf86cd799439012", "nombre": "Nacional" },
  "categoriasProducto": [{ "_id": "507f1f77bcf86cd799439013", "nombre": "Insumos de Oficina" }],
  "condicionPago": "30_dias",
  "monedaPreferida": { "_id": "507f1f77bcf86cd799439014", "nombre": "CUP" },
  "descuentoHabitual": 5,
  "cuentaBancariaMLC": "MLC-123-456-789",
  "cuentaBancariaCUP": "CUP-987-654-321",
  "estado": "activo",
  "calificacion": 3,
  "contactoNombre": "Juan Pérez",
  "contactoTelefono": "+53 51234567",
  "contactoEmail": "juan@distribuidora.cu",
  "contratoVigente": "CTR-2024-001",
  "fechaVencimientoContrato": "2025-12-31T00:00:00.000Z",
  "tipoContrato": { "_id": "507f1f77bcf86cd799439015", "nombre": "Suministro" },
  "notas": "Proveedor preferencial para insumos de oficina",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

</details>

---

### Listar Proveedores

`GET /proveedor`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439aaa",
    "codigo": "PROV-001",
    "nombre": "Distribuidora Nacional S.A.",
    "nit": "12345678901234",
    "codigoREU": "REU-2024-001",
    "empresa": { "_id": "507f1f77bcf86cd799439011", "nombre": "XILEF S.A." },
    "tipo": { "_id": "507f1f77bcf86cd799439012", "nombre": "Nacional" },
    "categoriasProducto": [{ "_id": "507f1f77bcf86cd799439013", "nombre": "Insumos de Oficina" }],
    "condicionPago": "30_dias",
    "monedaPreferida": { "_id": "507f1f77bcf86cd799439014", "nombre": "CUP" },
    "descuentoHabitual": 5,
    "cuentaBancariaMLC": "MLC-123-456-789",
    "cuentaBancariaCUP": "CUP-987-654-321",
    "estado": "activo",
    "calificacion": 4,
    "contactoNombre": "Juan Pérez",
    "contactoTelefono": "+53 51234567",
    "contactoEmail": "juan@distribuidora.cu",
    "contratoVigente": "CTR-2024-001",
    "fechaVencimientoContrato": "2025-12-31T00:00:00.000Z",
    "tipoContrato": { "_id": "507f1f77bcf86cd799439015", "nombre": "Suministro" },
    "notas": "Proveedor preferencial para insumos de oficina",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-02-01T10:00:00.000Z"
  }
]
```

</details>

---

### Buscar por Categoría

`GET /proveedor/categoria/:categoriaId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439aaa",
    "codigo": "PROV-001",
    "nombre": "Distribuidora Nacional S.A.",
    "nit": "12345678901234",
    "codigoREU": "REU-2024-001",
    "empresa": { "_id": "507f1f77bcf86cd799439011", "nombre": "XILEF S.A." },
    "tipo": { "_id": "507f1f77bcf86cd799439012", "nombre": "Nacional" },
    "categoriasProducto": [{ "_id": "507f1f77bcf86cd799439013", "nombre": "Insumos de Oficina" }],
    "condicionPago": "30_dias",
    "monedaPreferida": { "_id": "507f1f77bcf86cd799439014", "nombre": "CUP" },
    "descuentoHabitual": 5,
    "cuentaBancariaMLC": "MLC-123-456-789",
    "cuentaBancariaCUP": "CUP-987-654-321",
    "estado": "activo",
    "calificacion": 4,
    "contactoNombre": "Juan Pérez",
    "contactoTelefono": "+53 51234567",
    "contactoEmail": "juan@distribuidora.cu",
    "contratoVigente": "CTR-2024-001",
    "fechaVencimientoContrato": "2025-12-31T00:00:00.000Z",
    "tipoContrato": { "_id": "507f1f77bcf86cd799439015", "nombre": "Suministro" },
    "notas": "Proveedor preferencial para insumos de oficina",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-02-01T10:00:00.000Z"
  }
]
```

</details>

---

### Buscar por Estado

`GET /proveedor/estado/:estado`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439aaa",
    "codigo": "PROV-001",
    "nombre": "Distribuidora Nacional S.A.",
    "nit": "12345678901234",
    "codigoREU": "REU-2024-001",
    "empresa": { "_id": "507f1f77bcf86cd799439011", "nombre": "XILEF S.A." },
    "tipo": { "_id": "507f1f77bcf86cd799439012", "nombre": "Nacional" },
    "categoriasProducto": [{ "_id": "507f1f77bcf86cd799439013", "nombre": "Insumos de Oficina" }],
    "condicionPago": "30_dias",
    "monedaPreferida": { "_id": "507f1f77bcf86cd799439014", "nombre": "CUP" },
    "descuentoHabitual": 5,
    "cuentaBancariaMLC": "MLC-123-456-789",
    "cuentaBancariaCUP": "CUP-987-654-321",
    "estado": "activo",
    "calificacion": 4,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-02-01T10:00:00.000Z"
  }
]
```

</details>

---

### Buscar por Tipo

`GET /proveedor/tipo/:tipoId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439aaa",
    "codigo": "PROV-001",
    "nombre": "Distribuidora Nacional S.A.",
    "nit": "12345678901234",
    "codigoREU": "REU-2024-001",
    "empresa": { "_id": "507f1f77bcf86cd799439011", "nombre": "XILEF S.A." },
    "tipo": { "_id": "507f1f77bcf86cd799439012", "nombre": "Nacional" },
    "categoriasProducto": [{ "_id": "507f1f77bcf86cd799439013", "nombre": "Insumos de Oficina" }],
    "condicionPago": "30_dias",
    "monedaPreferida": { "_id": "507f1f77bcf86cd799439014", "nombre": "CUP" },
    "descuentoHabitual": 5,
    "estado": "activo",
    "calificacion": 4,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-02-01T10:00:00.000Z"
  }
]
```

</details>

---

### Obtener Proveedor por ID

`GET /proveedor/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigo": "PROV-001",
  "nombre": "Distribuidora Nacional S.A.",
  "nit": "12345678901234",
  "codigoREU": "REU-2024-001",
  "empresa": { "_id": "507f1f77bcf86cd799439011", "nombre": "XILEF S.A." },
  "tipo": { "_id": "507f1f77bcf86cd799439012", "nombre": "Nacional" },
  "categoriasProducto": [{ "_id": "507f1f77bcf86cd799439013", "nombre": "Insumos de Oficina" }],
  "condicionPago": "30_dias",
  "monedaPreferida": { "_id": "507f1f77bcf86cd799439014", "nombre": "CUP" },
  "descuentoHabitual": 5,
  "cuentaBancariaMLC": "MLC-123-456-789",
  "cuentaBancariaCUP": "CUP-987-654-321",
  "estado": "activo",
  "calificacion": 4,
  "contactoNombre": "Juan Pérez",
  "contactoTelefono": "+53 51234567",
  "contactoEmail": "juan@distribuidora.cu",
  "contratoVigente": "CTR-2024-001",
  "fechaVencimientoContrato": "2025-12-31T00:00:00.000Z",
  "tipoContrato": { "_id": "507f1f77bcf86cd799439015", "nombre": "Suministro" },
  "notas": "Proveedor preferencial para insumos de oficina"
}
```

</details>

---

### Actualizar Proveedor

`PATCH /proveedor/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Distribuidora Nacional S.A. (Actualizado)",
  "descuentoHabitual": 10,
  "contactoTelefono": "+53 59876543"
}
```

</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigo": "PROV-001",
  "nombre": "Distribuidora Nacional S.A. (Actualizado)",
  "nit": "12345678901234",
  "codigoREU": "REU-2024-001",
  "empresa": { "_id": "507f1f77bcf86cd799439011", "nombre": "XILEF S.A." },
  "tipo": { "_id": "507f1f77bcf86cd799439012", "nombre": "Nacional" },
  "categoriasProducto": [{ "_id": "507f1f77bcf86cd799439013", "nombre": "Insumos de Oficina" }],
  "condicionPago": "30_dias",
  "monedaPreferida": { "_id": "507f1f77bcf86cd799439014", "nombre": "CUP" },
  "descuentoHabitual": 10,
  "estado": "activo",
  "calificacion": 4,
  "contactoTelefono": "+53 59876543",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-02-10T14:00:00.000Z"
}
```

</details>

---

### Calificar Proveedor

`PATCH /proveedor/:id/calificar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "calificacion": 4
}
```

</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigo": "PROV-001",
  "nombre": "Distribuidora Nacional S.A.",
  "nit": "12345678901234",
  "calificacion": 4,
  "updatedAt": "2024-02-10T14:00:00.000Z"
}
```

</details>

---

### Eliminar Proveedor

`DELETE /proveedor/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```

</details>
