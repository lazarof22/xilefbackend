# XILEF Backend - Documentación para Frontend

## Cómo Usar esta Documentación

Hay **dos formas** de ver la documentación de la API:

1. **Swagger UI** (recomendado): Cuando el backend esté corriendo, abre `http://localhost:3000/docs` — ahí puedes probar los endpoints directamente.
2. **Este README**: Describe cada endpoint, qué espera recibir (`request`) y qué devuelve (`response`).

---

## Convenciones Generales

**Base URL:** `http://localhost:3000`

**Formato de fechas:** ISO 8601 — `"2024-01-15"` o `"2024-01-15T10:30:00.000Z"`

**IDs:** MongoDB ObjectId de 24 caracteres hexadecimales — ej: `"507f1f77bcf86cd799439011"`

**Campos opcionales:** Se pueden omitir o enviar como `null`. No enviarlos es lo mismo.

**Respuesta de error estándar:**
```json
{
  "message": "Activo no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

Códigos de error comunes:
| Status | Significado |
|---|---|
| `201` | Creado exitosamente |
| `200` | Operación exitosa |
| `400` | Datos inválidos en la petición |
| `404` | Recurso no encontrado (ID inválido o no existe) |

---

## 1. Nomencladores (Catálogos)

Son datos de referencia que se usan para llenar los selects del formulario de Activos Fijos.

### 1.1 Grupos de Activos Fijos

`GET /grupo-activo` — Lista todos los grupos

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "codigo": "COMP",
    "nombre": "Equipos de Computación",
    "descripcion": "Computadoras, servidores, impresoras, redes, equipos informáticos",
    "vidaUtilMinima": 3,
    "vidaUtilMaxima": 4,
    "tasaDepreciacionMinima": 25,
    "tasaDepreciacionMaxima": 33,
    "activo": true
  }
]
```
</details>

`GET /grupo-activo/activos` — Solo los grupos activos (para selects)

`POST /grupo-activo` — Crear nuevo grupo

<details>
<summary>🔍 Ver body</summary>

```json
{
  "codigo": "COMP",
  "nombre": "Equipos de Computación",
  "descripcion": "Computadoras, servidores",
  "vidaUtilMinima": 3,
  "vidaUtilMaxima": 4,
  "tasaDepreciacionMinima": 25,
  "tasaDepreciacionMaxima": 33,
  "activo": true
}
```
</details>

### 1.2 Tasas de Depreciación

`GET /tasa-depreciacion` — Lista todas las tasas

`POST /tasa-depreciacion` — Crear tasa

<details>
<summary>🔍 Ver body</summary>

```json
{
  "tasa_depreciacion": 25,
  "descripcion": "Tasa para equipos de computo"
}
```
</details>

### 1.3 Áreas

`GET /area` — Lista áreas/ubicaciones donde están los activos

### 1.4 Estados

`GET /estado` — Lista estados posibles (Activo, Baja, En Reparación, Ocioso, etc.)

### 1.5 Monedas

`GET /moneda` — Lista monedas

### 1.6 Conceptos

`GET /concepto` — Lista conceptos contables

---

## 2. Activos Fijos (Módulo Principal)

### 2.1 Crear Activo Fijo

`POST /activofijo`

**Body (campos obligatorios marcados con ⚠️):**

```json
{
  "codigoActivo": "AF-001",
  "descripcionActivo": "Servidor Dell PowerEdge R740",
  "marca": "Dell",
  "modelo": "PowerEdge R740",
  "numeroSerie": "SN123456789",
  "proveedor": "507f1f77bcf86cd799439011",
  "area": "507f1f77bcf86cd799439022",
  "grupoActivo": "507f1f77bcf86cd799439033",
  "fechaCompra": "2024-01-15",
  "fechaPuestaMarcha": "2024-02-01",
  "valorAdquisicion": 10000.00,
  "valorResidual": 500.00,
  "vidaUtil": 4,
  "tasaDepreciacion": "507f1f77bcf86cd799439044",
  "metodoDepreciacion": "linea_recta",
  "moneda": "507f1f77bcf86cd799439055",
  "pais": "507f1f77bcf86cd799439066",
  "concepto": "507f1f77bcf86cd799439077",
  "estadoActivo": "507f1f77bcf86cd799439088",
  "cuentaDebe": "507f1f77bcf86cd799439099",
  "cuentaHaber": "507f1f77bcf86cd799439100",
  "cuentaDepreciacion": "507f1f77bcf86cd799439111",
  "numeroFactura": "FAC-2024-001",
  "ordenCompra": "OC-2024-001",
  "observaciones": "Servidor principal para oficina central",
  "ajusteValor": 0,
  "activo": true,
  "cantidad": 1
}
```

**⚠️ Campos obligatorios:** `codigoActivo`, `descripcionActivo`, `proveedor`, `area`, `fechaCompra`, `valorAdquisicion`, `valorResidual`, `vidaUtil`, `tasaDepreciacion`, `moneda`, `estadoActivo`

**¿Qué hace el backend automáticamente al crear?**
- Calcula `depreciacionAnual`, `depreciacionMensual`, `depreciacionAcumulada`, `valorEnLibros`
- Si no envías `ajusteValor` lo pone en 0
- Si no envías `activo` lo pone en `true`
- Si no envías `metodoDepreciacion` lo pone en `"linea_recta"`
- Si no envías `cantidad` lo pone en 1

### 🚀 Creación Masiva (Varios Activos Iguales)

Si tienes 50 sillas, 30 mesas o cualquier lote de activos idénticos, usa el campo `cantidad`:

```json
{
  "codigoActivo": "SILLA",
  "cantidad": 50,
  "descripcionActivo": "Silla ejecutiva negra",
  "marca": "Ofimax",
  "valorAdquisicion": 1500.00,
  "valorResidual": 75.00,
  "vidaUtil": 10,
  "proveedor": "507f1f77bcf86cd799439011",
  "area": "507f1f77bcf86cd799439022",
  "fechaCompra": "2024-06-01",
  "tasaDepreciacion": "507f1f77bcf86cd799439044",
  "moneda": "507f1f77bcf86cd799439055",
  "estadoActivo": "507f1f77bcf86cd799439088"
}
```

El backend genera códigos secuenciales automáticamente:
- `SILLA-001`, `SILLA-002`, `SILLA-003`, ..., `SILLA-050`

<details>
<summary>🔍 Ver response (creación masiva)</summary>

```json
{
  "creados": 50,
  "activos": [
    { "_id": "507f1f77bcf86cd799439aaa", "codigoActivo": "SILLA-001", "descripcionActivo": "Silla ejecutiva negra" },
    { "_id": "507f1f77bcf86cd799439aab", "codigoActivo": "SILLA-002", "descripcionActivo": "Silla ejecutiva negra" }
  ]
}
```

Cuando `cantidad` es 1, la respuesta es el objeto del activo individual (como siempre).  
Cuando `cantidad` es > 1, la respuesta es un objeto con `creados` (número) y `activos` (array resumido).
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigoActivo": "AF-001",
  "descripcionActivo": "Servidor Dell PowerEdge R740",
  "marca": "Dell",
  "modelo": "PowerEdge R740",
  "numeroSerie": "SN123456789",
  "proveedor": { "_id": "...", "nombre": "Dell Technologies Cuba" },
  "area": { "_id": "...", "nombre": "Oficina Central" },
  "grupoActivo": { "_id": "...", "nombre": "Equipos de Computación" },
  "fechaCompra": "2024-01-15T00:00:00.000Z",
  "fechaPuestaMarcha": "2024-02-01T00:00:00.000Z",
  "valorAdquisicion": 10000,
  "valorResidual": 500,
  "vidaUtil": 4,
  "tasaDepreciacion": { "_id": "...", "tasa_depreciacion": 25 },
  "metodoDepreciacion": "linea_recta",
  "depreciacionAnual": 2375,
  "depreciacionMensual": 197.92,
  "depreciacionAcumulada": 0,
  "valorEnLibros": 10000,
  "moneda": { "_id": "...", "nombre": "CUP" },
  "estadoActivo": { "_id": "...", "nombre": "Activo" },
  "activo": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

> **Nota:** Los campos que son IDs (`proveedor`, `area`, etc.) se devuelven como objetos completos (poblados/`populated`). El frontend recibe toda la info del objeto relacionado, no solo el ID.

### 2.2 Listar Activos Fijos

`GET /activofijo` — Todos los activos (vigentes y dados de baja)

`GET /activofijo/activos` — Solo activos vigentes (`activo: true`)

`GET /activofijo/area/:areaId` — Activos de un área específica

`GET /activofijo/estado/:estadoId` — Activos con un estado específico

Todos devuelven un array de activos con los objetos relacionados poblados.

### 2.3 Obtener un Activo por ID

`GET /activofijo/:id`

Devuelve el activo completo con todos los objetos relacionados poblados.

### 2.4 Actualizar un Activo

`PATCH /activofijo/:id`

Body: mismo formato que POST pero todos los campos son opcionales (solo envías lo que quieras cambiar).

Si modificas `valorAdquisicion`, `valorResidual`, `vidaUtil` o `fechaCompra`, el backend **recalcula automáticamente** la depreciación.

### 2.5 Eliminar un Activo

`DELETE /activofijo/:id`

Elimina el activo permanentemente de la BD.

```json
{ "deleted": true }
```

### 2.6 Cálculos de Depreciación

#### Depreciación Anual

`GET /activofijo/:id/depreciacion/anual`

Devuelve cuánto se deprecia el activo por año:

```json
{
  "activo": "AF-001",
  "descripcion": "Servidor Dell PowerEdge R740",
  "costoAdquisicion": 10000,
  "valorResidual": 500,
  "vidaUtilAnios": 4,
  "depreciacionAnual": 2375
}
```

#### Depreciación Mensual y Acumulada

`GET /activofijo/:id/depreciacion/mensual`

Devuelve la depreciación mensual, la acumulada desde la compra hasta hoy, y el valor en libros:

```json
{
  "activo": "AF-001",
  "descripcion": "Servidor Dell PowerEdge R740",
  "costoAdquisicion": 10000,
  "valorResidual": 500,
  "vidaUtilAnios": 4,
  "fechaCompra": "2024-01-15T00:00:00.000Z",
  "depreciacionAnual": 2375,
  "depreciacionMensual": 197.92,
  "depreciacionAcumulada": 197.92,
  "valorEnLibros": 9802.08
}
```

### 2.7 Recalcular Depreciación

#### Recalcular un activo específico

`POST /activofijo/:id/recalcular-depreciacion`

Actualiza la depreciación de ese activo a la fecha actual. Devuelve el activo actualizado.

#### Recalcular TODOS los activos (cierre mensual)

`POST /activofijo/recalcular-depreciacion-masiva`

Útil para el cierre contable mensual. Procesa todos los activos vigentes.

```json
{
  "modificados": 15
}
```

### 2.8 Baja de Activo

`POST /activofijo/:id/baja`

Da de baja un activo. Requiere:

```json
{
  "fechaBaja": "2024-06-15",
  "motivoBaja": "Venta del equipo por obsolescencia",
  "tipoBaja": "venta",
  "valorBaja": 2500.00,
  "documentoBaja": "FAC-2024-050"
}
```

**Tipos de baja disponibles:** `"venta"`, `"donacion"`, `"perdida"`, `"robo"`, `"obsolescencia"`, `"destruccion"`

**¿Qué hace el backend?**
- Marca el activo como inactivo (`activo: false`)
- Calcula ganancia/pérdida: `valorBaja - valorEnLibros`
  - Si el resultado es positivo → Ganancia
  - Si es negativo → Pérdida
- Guarda los datos de la baja en el expediente del activo

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigoActivo": "AF-001",
  "activo": false,
  "fechaBaja": "2024-06-15T00:00:00.000Z",
  "motivoBaja": "Venta del equipo por obsolescencia",
  "tipoBaja": "venta",
  "valorBaja": 2500,
  "documentoBaja": "FAC-2024-050",
  "gananciaPerdidaBaja": -800.00
}
```
</details>

### 2.9 Revaluación de Activo

`POST /activofijo/:id/revaluacion`

Registra un avalúo autorizado (Res. 83/2012 mod. Res. 128/2025):

```json
{
  "fechaRevaluacion": "2024-12-01",
  "valorAvaluo": 8500.00,
  "entidadAvaluadora": "Empresa de Avalúos y Tasaciones",
  "documentoRevaluacion": "AV-2024-001"
}
```

**¿Qué hace el backend?**
- Actualiza el `valorAdquisicion` al nuevo valor del avalúo
- Recalcula la depreciación completa con el nuevo valor
- Acumula la diferencia en `revaluacionAcumulada`

---

## 3. Reportes

### 3.1 Estadísticas Generales

`GET /activofijo/estadisticas`

```json
{
  "totalActivos": 15,
  "totalBajas": 2,
  "valorAdquisicionTotal": 250000.00,
  "depreciacionAcumuladaTotal": 45000.00,
  "valorEnLibrosTotal": 205000.00,
  "porEstado": [
    { "_id": "id_del_estado", "count": 12 },
    { "_id": "id_del_estado", "count": 3 }
  ],
  "porArea": [
    { "_id": "id_del_area", "count": 8, "totalValor": 120000 },
    { "_id": "id_del_area", "count": 7, "totalValor": 130000 }
  ]
}
```

### 3.2 Calendario de Depreciación

`GET /activofijo/depreciacion/schedule`

Proyección de depreciación de todos los activos:

```json
[
  {
    "codigoActivo": "AF-001",
    "descripcionActivo": "Servidor Dell",
    "valorAdquisicion": 10000,
    "valorResidual": 500,
    "vidaUtil": 4,
    "depreciacionAnual": 2375,
    "depreciacionMensual": 197.92,
    "depreciacionAcumulada": 197.92,
    "valorEnLibros": 9802.08,
    "fechaCompra": "2024-01-15T00:00:00.000Z",
    "anosTranscurridos": 0
  }
]
```

### 3.3 Activos por Estado

`GET /activofijo/reportes/estado`

Agrupa los activos por su estado y calcula totales:

```json
[
  {
    "_id": "id_estado_activo",
    "cantidad": 12,
    "valorAdquisicionTotal": 200000,
    "valorLibrosTotal": 160000,
    "depreciacionTotal": 40000
  }
]
```

### 3.4 Resumen Económico

`GET /activofijo/reportes/resumen-economico`

El reporte principal para el área económica:

```json
{
  "resumenGeneral": {
    "totalActivos": 17,
    "activosVigentes": 15,
    "activosBaja": 2,
    "porcentajeBaja": 11.76
  },
  "resumenValores": {
    "valorAdquisicionTotal": 250000,
    "valorResidualTotal": 12500,
    "depreciacionAcumuladaTotal": 45000,
    "valorLibrosTotal": 205000,
    "revaluacionAcumuladaTotal": 0,
    "porcentajeDepreciado": 18
  }
}
```

---

## 4. Movimientos

Los movimientos registran todo lo que le pasa a un activo durante su vida útil.

### 4.1 Tipos de Movimiento

`GET /movimiento/tipos` — Devuelve los tipos disponibles:

```json
["alta", "modificacion", "traslado", "baja_parcial", "baja_total", "revaluacion", "depreciacion", "reparacion"]
```

### 4.2 Registrar Movimiento

`POST /movimiento`

```json
{
  "activoFijo": "507f1f77bcf86cd799439aaa",
  "tipo": "traslado",
  "fechaMovimiento": "2024-03-01",
  "descripcion": "Traslado del servidor a la nueva oficina",
  "areaOrigen": "507f1f77bcf86cd799439022",
  "areaDestino": "507f1f77bcf86cd799439033",
  "documentoReferencia": "MEMO-2024-001"
}
```

**Campos según el tipo de movimiento:**

| Tipo | Campos útiles |
|---|---|
| `alta` | — |
| `modificacion` | `valorAnterior`, `valorNuevo`, `depreciacionAcumuladaAnterior`, `depreciacionAcumuladaNueva` |
| `traslado` | `areaOrigen`, `areaDestino` |
| `baja_parcial` | `valorBaja`, `motivoBaja` |
| `baja_total` | `valorBaja`, `motivoBaja` |
| `revaluacion` | `valorAnterior`, `valorNuevo` |
| `depreciacion` | `depreciacionAcumuladaAnterior`, `depreciacionAcumuladaNueva` |
| `reparacion` | `costoReparacion`, `proveedorReparacion` |

### 4.3 Consultar Movimientos

`GET /movimiento` — Todos los movimientos (ordenados del más reciente al más viejo)

`GET /movimiento/activo/:activoId` — Movimientos de un activo específico

`GET /movimiento/:id` — Un movimiento por ID

### 4.4 Actualizar/Eliminar Movimiento

`PATCH /movimiento/:id` — Actualizar

`DELETE /movimiento/:id` — Eliminar (devuelve `{ "deleted": true }`)

---

## 5. Conteo Físico

Los conteos físicos implementan la NEC No. 3 (Res. 20/2009) para registro de pérdidas, faltantes y sobrantes.

### Ciclo de vida de un conteo:

```
POST /conteo-fisico  (programado)
       ↓
POST /conteo-fisico/:id/iniciar  (en_proceso)
       ↓
POST /conteo-fisico/detalles  (se registran los resultados uno por uno)
       ↓
POST /conteo-fisico/:id/completar  (completado → calcula resultados automáticamente)
```

### 5.1 Programar Conteo

`POST /conteo-fisico`

```json
{
  "codigoConteo": "CF-2024-001",
  "fechaProgramada": "2024-12-01",
  "area": "507f1f77bcf86cd799439022",
  "observaciones": "Conteo anual de fin de año",
  "totalActivosSistema": 15,
  "realizadoPor": "Juan Pérez",
  "autorizadoPor": "María García"
}
```

### 5.2 Iniciar Conteo

`POST /conteo-fisico/:id/iniciar`

Cambia el estado de `"programado"` a `"en_proceso"`. Solo se puede iniciar si está programado.

### 5.3 Agregar Detalle (Resultado del Conteo por Activo)

`POST /conteo-fisico/detalles`

Se llama una vez por cada activo contado físicamente:

```json
{
  "conteoFisico": "507f1f77bcf86cd799439bbb",
  "activoFijo": "507f1f77bcf86cd799439aaa",
  "codigoActivoSistema": "AF-001",
  "descripcionActivoSistema": "Servidor Dell",
  "ubicacionSistema": "Oficina Central - Piso 1",
  "ubicacionReal": "Oficina Central - Piso 2",
  "resultado": "coincide",
  "observaciones": "Cambiado de piso recientemente",
  "cantidadSistema": 1,
  "cantidadReal": 1
}
```

**Valores de `resultado`:**

| Valor | Significado | ¿Discrepancia? |
|---|---|---|
| `"coincide"` | El activo está donde debe estar | ❌ No |
| `"sobrante"` | Apareció un activo no registrado | ✅ Sí |
| `"faltante"` | No se encuentra un activo registrado | ✅ Sí |
| `"danado"` | El activo está presente pero dañado | ✅ Sí |
| `"mal_ubicado"` | El activo está en otra ubicación | ✅ Sí |

### 5.4 Completar Conteo

`POST /conteo-fisico/:id/completar`

**¿Qué hace el backend?**
- Cambia el estado a `"completado"`
- Establece `fechaRealizacion` a la fecha/hora actual
- **Cuenta automáticamente** los resultados:
  - `totalActivosContados`: cuántos detalles se registraron
  - `totalCoincidentes`: cuántos tienen resultado "coincide"
  - `totalDiscrepancias`: sobrantes + faltantes + dañados
  - `totalSobrantes`, `totalFaltantes`

### 5.5 Consultas

`GET /conteo-fisico` — Lista todos los conteos

`GET /conteo-fisico/:id` — Un conteo específico

`GET /conteo-fisico/:id/detalles` — Los detalles (activos contados) de un conteo

`GET /conteo-fisico/discrepancias` — Resumen global de discrepancias de todos los conteos

### 5.6 Eliminar Conteo

`DELETE /conteo-fisico/:id` — Elimina el conteo y todos sus detalles asociados

---

## 6. Flujos Típicos para el Frontend

### Crear un Activo Fijo Nuevo

```
1. Cargar nomencladores:
   GET /grupo-activo/activos     → para el select "Grupo"
   GET /area                     → para el select "Área"
   GET /estado                   → para el select "Estado"
   GET /moneda                   → para el select "Moneda"
   GET /tasa-depreciacion        → para el select "Tasa Dep."
   
2. POST /activofijo              → enviar el formulario
```

### Calcular Depreciación y Mostrarla

```
1. GET /activofijo               → listar activos
2. GET /activofijo/:id/depreciacion/mensual  → para la ficha del activo
```

### Dar de Baja un Activo

```
1. GET /activofijo/:id           → ver datos actuales
2. POST /activofijo/:id/baja     → enviar datos de la baja
3. GET /activofijo/reportes/resumen-economico → ver el impacto
```

### Realizar un Conteo Físico

```
1. GET /activofijo/activos           → obtener activos vigentes
2. POST /conteo-fisico               → programar conteo
3. POST /conteo-fisico/:id/iniciar   → iniciar
4. POST /conteo-fisico/detalles      → por cada activo contado
5. POST /conteo-fisico/:id/completar → finalizar
6. GET /conteo-fisico/:id/detalles   → revisar resultados
```

---

## 7. Resumen por Módulo

| Módulo | Base URL | Endpoints |
|---|---|---|
| **Grupo Activo** | `/grupo-activo` | GET, POST, GET/activos, GET/:id, PATCH/:id, DELETE/:id |
| **Tasa Depreciación** | `/tasa-depreciacion` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| **Activo Fijo** | `/activofijo` | POST, GET, GET/activos, GET/estadisticas, GET/depreciacion/schedule, GET/area/:id, GET/estado/:id, POST/:id/baja, POST/:id/revaluacion, GET/reportes/estado, GET/reportes/resumen-economico, GET/:id, GET/:id/depreciacion/anual, GET/:id/depreciacion/mensual, POST/:id/recalcular-depreciacion, POST/recalcular-depreciacion-masiva, PATCH/:id, DELETE/:id |
| **Movimiento** | `/movimiento` | POST, GET, GET/tipos, GET/activo/:id, GET/:id, PATCH/:id, DELETE/:id |
| **Conteo Físico** | `/conteo-fisico` | POST, GET, GET/discrepancias, GET/:id, GET/:id/detalles, PATCH/:id, POST/:id/iniciar, POST/:id/completar, POST/detalles, DELETE/:id |

**Total: ~45 endpoints** para el módulo de Activos Fijos.
