# Créditos Bancarios (`/credito`)

Gestión de solicitudes, aprobación, desembolso, amortización y seguimiento de créditos bancarios (Res. 90/2024 BCC, Inst. 34/2006 BCC).

**Ciclo de vida:** `solicitado` → `aprobado` → `desembolsado` → `en_pago` → `pagado` / `vencido` / `castigado`

---

### Solicitar Crédito

`POST /credito`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CR-2024-001",
  "banco": "507f1f77bcf86cd799439011",
  "tipo": "capital_trabajo",
  "montoSolicitado": 100000.00,
  "tasaInteres": 8.5,
  "plazoMeses": 12,
  "fechaSolicitud": "2024-01-15",
  "garantia": "Garantía hipotecaria",
  "metodoAmortizacion": "frances",
  "periodicidadCuota": "mensual"
}
```
</details>

**Tipos de crédito:** `"capital_trabajo"`, `"inversion"`
**Métodos de amortización:** `"frances"` (cuota fija), `"aleman"` (amortización constante)
**Periodicidad:** `"mensual"`, `"trimestral"`, `"semestral"`, `"anual"`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a005",
  "codigo": "CR-2024-001",
  "banco": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "tipo": "capital_trabajo",
  "montoSolicitado": 100000.00,
  "tasaInteres": 8.5,
  "plazoMeses": 12,
  "fechaSolicitud": "2024-01-15T00:00:00.000Z",
  "estado": "solicitado",
  "metodoAmortizacion": "frances",
  "periodicidadCuota": "mensual",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Créditos

`GET /credito`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a005",
    "codigo": "CR-2024-001",
    "banco": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
    "tipo": "capital_trabajo",
    "montoSolicitado": 100000.00,
    "tasaInteres": 8.5,
    "plazoMeses": 12,
    "estado": "solicitado"
  }
]
```
</details>

---

### Créditos Vencidos

`GET /credito/vencidos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a006",
    "codigo": "CR-2024-002",
    "montoSolicitado": 50000.00,
    "estado": "vencido",
    "diasVencido": 15
  }
]
```
</details>

---

### Clasificación de Riesgo

`GET /credito/clasificacion-riesgo`

Clasificación según Inst. 34/2006 BCC

<details>
<summary>🔍 Ver response</summary>

```json
[
  { "clasificacion": "normal", "cantidad": 5, "montoTotal": 200000.00, "porcentaje": 65 },
  { "clasificacion": "potencial", "cantidad": 2, "montoTotal": 50000.00, "porcentaje": 16 },
  { "clasificacion": "dudoso", "cantidad": 1, "montoTotal": 60000.00, "porcentaje": 19 }
]
```
</details>

---

### Resumen

`GET /credito/resumen`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalCreditos": 8,
  "montoTotalSolicitado": 310000.00,
  "montoTotalDesembolsado": 250000.00,
  "saldoPendiente": 210000.00,
  "porEstado": {
    "solicitado": 2,
    "aprobado": 1,
    "desembolsado": 1,
    "en_pago": 3,
    "vencido": 1
  }
}
```
</details>

---

### Obtener Crédito

`GET /credito/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a005",
  "codigo": "CR-2024-001",
  "banco": { "_id": "...", "nombreBanco": "Banco de Crédito y Comercio" },
  "tipo": "capital_trabajo",
  "montoSolicitado": 100000.00,
  "tasaInteres": 8.5,
  "plazoMeses": 12,
  "estado": "solicitado",
  "metodoAmortizacion": "frances",
  "periodicidadCuota": "mensual",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Actualizar Crédito

`PATCH /credito/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{ "tasaInteres": 9.0 }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a005", "tasaInteres": 9.0 }
```
</details>

---

### Eliminar Crédito

`DELETE /credito/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>

---

### Generar Plan de Amortización

`POST /credito/:id/amortizacion/generar`

<details>
<summary>🔍 Ver request</summary>

```json
{ "metodo": "frances", "forzar": false }
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "creditoId": "507f1f77bcf86cd79943a005",
  "metodo": "frances",
  "fechaInicio": "2024-02-01T00:00:00.000Z",
  "cuotas": [
    {
      "numero": 1,
      "fechaVencimiento": "2024-03-01T00:00:00.000Z",
      "capital": 8025.00,
      "interes": 708.33,
      "cuotaTotal": 8733.33,
      "saldoRestante": 91975.00
    }
  ]
}
```
</details>

---

### Obtener Plan de Amortización

`GET /credito/:id/amortizacion`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "creditoId": "507f1f77bcf86cd79943a005",
  "metodo": "frances",
  "cuotas": [
    {
      "numero": 1,
      "fechaVencimiento": "2024-03-01T00:00:00.000Z",
      "capital": 8025.00,
      "interes": 708.33,
      "cuotaTotal": 8733.33,
      "estado": "pendiente",
      "saldoRestante": 91975.00
    }
  ]
}
```
</details>

---

### Regenerar Plan

`POST /credito/:id/amortizacion/regenerar`

Elimina cuotas existentes y regenera completamente.

---

### Abonar a una Cuota

`POST /credito/cuotas/:cuotaId/abonar`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "monto": 9250.00,
  "capital": 8500.00,
  "interes": 750.00,
  "fechaPago": "2024-02-15",
  "referencia": "TRF-2024-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "cuotaId": "507f1f77bcf86cd79943a007",
  "numeroCuota": 1,
  "montoAbonado": 9250.00,
  "capital": 8500.00,
  "interes": 750.00,
  "saldoRestante": 0,
  "estadoCuota": "pagada",
  "estadoCredito": "en_pago"
}
```
</details>

---

### Transiciones de Estado

`POST /credito/:id/aprobar`

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a005", "estado": "aprobado", "mensaje": "Crédito aprobado exitosamente" }
```
</details>

`POST /credito/:id/desembolsar`

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a005", "estado": "desembolsado", "montoDesembolsado": 100000.00, "cuotasGeneradas": 12 }
```
</details>

`POST /credito/:id/castigar`

<details>
<summary>🔍 Ver response</summary>

```json
{ "_id": "507f1f77bcf86cd79943a005", "estado": "castigado", "saldoCastigado": 60000.00 }
```
</details>
