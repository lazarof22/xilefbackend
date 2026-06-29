# Posición Monetaria (`/posicion-monetaria`)

Cálculo de la posición en cada moneda, combinando saldos de bancos y cajas, con valoración en moneda base.

---

### Generar Posición Monetaria

`POST /posicion-monetaria/generar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "PM-2024-001",
  "fecha": "2024-01-31",
  "observaciones": "Cierre mensual enero"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a021",
  "codigo": "PM-2024-001",
  "fecha": "2024-01-31T00:00:00.000Z",
  "items": [
    { "moneda": { "_id": "...", "nombre": "CUP" }, "saldoBancos": 50000.00, "saldoCajas": 15000.00, "saldoTotal": 65000.00, "valorEnMonedaBase": 65000.00, "tasaUsada": 1 },
    { "moneda": { "_id": "...", "nombre": "USD" }, "saldoBancos": 1000.00, "saldoCajas": 0, "saldoTotal": 1000.00, "valorEnMonedaBase": 120000.00, "tasaUsada": 120 }
  ],
  "observaciones": "Cierre mensual enero",
  "createdAt": "2024-01-31T17:00:00.000Z"
}
```
</details>

---

### Listar Posiciones

`GET /posicion-monetaria`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a021",
    "codigo": "PM-2024-001",
    "fecha": "2024-01-31T00:00:00.000Z",
    "items": [
      { "moneda": { "_id": "...", "nombre": "CUP" }, "saldoTotal": 65000.00 },
      { "moneda": { "_id": "...", "nombre": "USD" }, "saldoTotal": 1000.00 }
    ]
  }
]
```
</details>

---

### Comparativa entre Fechas

`GET /posicion-monetaria/comparativa?fecha1=2024-01-01&fecha2=2024-01-31`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "fecha1": "2024-01-01",
  "fecha2": "2024-01-31",
  "comparativa": [
    {
      "moneda": { "_id": "...", "nombre": "CUP" },
      "saldoInicial": 50000.00,
      "saldoFinal": 65000.00,
      "variacion": 15000.00,
      "variacionPorcentaje": 30.0
    }
  ]
}
```
</details>

---

### Histórico

`GET /posicion-monetaria/historico?desde=2024-01-01&hasta=2024-12-31`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "...",
    "codigo": "PM-2024-001",
    "fecha": "2024-01-31T00:00:00.000Z",
    "items": [
      { "moneda": { "nombre": "CUP" }, "saldoTotal": 65000.00 }
    ]
  }
]
```
</details>

---

### Obtener por ID

`GET /posicion-monetaria/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a021",
  "codigo": "PM-2024-001",
  "fecha": "2024-01-31T00:00:00.000Z",
  "items": [
    { "moneda": { "_id": "...", "nombre": "CUP" }, "saldoBancos": 50000.00, "saldoCajas": 15000.00, "saldoTotal": 65000.00, "valorEnMonedaBase": 65000.00, "tasaUsada": 1 },
    { "moneda": { "_id": "...", "nombre": "USD" }, "saldoBancos": 1000.00, "saldoCajas": 0, "saldoTotal": 1000.00, "valorEnMonedaBase": 120000.00, "tasaUsada": 120 }
  ],
  "observaciones": "Cierre mensual enero"
}
```
</details>

---

### Actualizar

`PATCH /posicion-monetaria/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "observaciones": "Actualizado" }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a021", "observaciones": "Actualizado" }
```
</details>

---

### Eliminar

`DELETE /posicion-monetaria/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
