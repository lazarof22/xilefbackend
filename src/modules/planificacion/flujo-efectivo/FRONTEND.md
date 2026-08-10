# Flujo de Efectivo (`/flujo-efectivo`)

Proyecciones de flujo de efectivo con seguimiento vs real.

**Tipos de periodo:** `"diario"`, `"semanal"`, `"mensual"`

---

### Crear Proyección

`POST /flujo-efectivo`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "FLE-2024-001",
  "fecha": "2024-01-01",
  "periodo": "2024-01",
  "tipoPeriodo": "mensual",
  "saldoInicial": 50000.00
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a017",
  "codigo": "FLE-2024-001",
  "fecha": "2024-01-01T00:00:00.000Z",
  "periodo": "2024-01",
  "tipoPeriodo": "mensual",
  "saldoInicial": 50000.00,
  "ingresosProyectados": 0,
  "egresosProyectados": 0,
  "estado": "proyectado",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Proyecciones

`GET /flujo-efectivo`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a017",
    "codigo": "FLE-2024-001",
    "periodo": "2024-01",
    "tipoPeriodo": "mensual",
    "saldoInicial": 50000.00,
    "estado": "proyectado"
  }
]
```
</details>

---

### Histórico

`GET /flujo-efectivo/historico?desde=2024-01-01&hasta=2024-12-31`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "...",
    "periodo": "2024-01",
    "saldoInicial": 50000.00,
    "ingresos": 120000.00,
    "egresos": 95000.00,
    "flujoNeto": 25000.00,
    "saldoFinal": 75000.00,
    "estado": "cerrado"
  }
]
```
</details>

---

### Resumen

`GET /flujo-efectivo/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalProyecciones": 12,
  "enEjecucion": 3,
  "cerradas": 8,
  "proyectadas": 1,
  "saldoActualTotal": 25000.00
}
```
</details>

---

### Obtener por ID

`GET /flujo-efectivo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a017",
  "codigo": "FLE-2024-001",
  "fecha": "2024-01-01T00:00:00.000Z",
  "periodo": "2024-01",
  "tipoPeriodo": "mensual",
  "saldoInicial": 50000.00,
  "ingresosProyectados": 0,
  "egresosProyectados": 0,
  "ingresosReales": 0,
  "egresosReales": 0,
  "estado": "proyectado"
}
```
</details>

---

### Actualizar

`PATCH /flujo-efectivo/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "saldoInicial": 55000.00 }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a017", "saldoInicial": 55000.00 }
```
</details>

---

### Generar Proyecciones Automáticas

`POST /flujo-efectivo/generar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "fechaInicio": "2024-01-01",
  "fechaFin": "2024-12-31",
  "tipoPeriodo": "mensual",
  "saldoInicial": 50000.00
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "generadas": 12,
  "proyecciones": [
    { "_id": "...", "periodo": "2024-01", "saldoInicial": 50000.00 },
    { "_id": "...", "periodo": "2024-02", "saldoInicial": 0 }
  ]
}
```
</details>

---

### Cerrar Proyección

`POST /flujo-efectivo/:id/cerrar`

Permite comparar lo proyectado vs lo real.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "ingresosReales": 120000.00,
  "egresosReales": 95000.00,
  "observaciones": "Cierre mensual enero"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a017",
  "estado": "cerrado",
  "ingresosReales": 120000.00,
  "egresosReales": 95000.00,
  "flujoNeto": 25000.00,
  "saldoFinal": 75000.00
}
```
</details>

---

### Comparar Proyectado vs Real

`GET /flujo-efectivo/:id/comparar`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "periodo": "2024-01",
  "saldoInicial": 50000.00,
  "ingresos": { "proyectado": 100000.00, "real": 120000.00, "desviacion": 20000.00, "desviacionPorcentaje": 20.0 },
  "egresos": { "proyectado": 80000.00, "real": 95000.00, "desviacion": 15000.00, "desviacionPorcentaje": 18.75 },
  "flujoNeto": { "proyectado": 20000.00, "real": 25000.00, "desviacion": 5000.00, "desviacionPorcentaje": 25.0 },
  "saldoFinal": { "proyectado": 70000.00, "real": 75000.00, "desviacion": 5000.00 }
}
```
</details>

---

### Eliminar

`DELETE /flujo-efectivo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
