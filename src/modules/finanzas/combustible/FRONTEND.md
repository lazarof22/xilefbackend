# Combustible (`/combustible`)

Control de vehículos, tarjetas prepagadas y cargas de combustible (Res. 60/2009 MFP, Decreto 110/2024).

---

## Vehículos

### Registrar Vehículo

`POST /combustible/vehiculo`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "VH-001",
  "placa": "C-123-456",
  "marca": "Hyundai",
  "modelo": "Santa Fe",
  "tipoCombustible": "diesel",
  "consumoPromedio": 10.5
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439fff",
  "codigo": "VH-001",
  "placa": "C-123-456",
  "marca": "Hyundai",
  "modelo": "Santa Fe",
  "tipoCombustible": "diesel",
  "consumoPromedio": 10.5,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

### Listar Vehículos

`GET /combustible/vehiculo`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439fff",
    "codigo": "VH-001",
    "placa": "C-123-456",
    "marca": "Hyundai",
    "modelo": "Santa Fe",
    "tipoCombustible": "diesel",
    "consumoPromedio": 10.5
  }
]
```
</details>

### Obtener Vehículo

`GET /combustible/vehiculo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439fff",
  "codigo": "VH-001",
  "placa": "C-123-456",
  "marca": "Hyundai",
  "modelo": "Santa Fe",
  "tipoCombustible": "diesel",
  "consumoPromedio": 10.5
}
```
</details>

### Eliminar Vehículo

`DELETE /combustible/vehiculo/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>

---

## Tarjetas Prepagadas

### Registrar Tarjeta

`POST /combustible/tarjeta`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "numeroTarjeta": "TCP-123456789",
  "vehiculo": "507f1f77bcf86cd799439fff",
  "estado": "activa"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a001",
  "numeroTarjeta": "TCP-123456789",
  "vehiculo": { "_id": "...", "placa": "C-123-456" },
  "estado": "activa",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

### Listar Tarjetas

`GET /combustible/tarjeta`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a001",
    "numeroTarjeta": "TCP-123456789",
    "vehiculo": { "_id": "...", "placa": "C-123-456" },
    "estado": "activa"
  }
]
```
</details>

---

## Cargas

### Registrar Carga

`POST /combustible/carga`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigo": "CGA-2024-001",
  "tarjeta": "507f1f77bcf86cd79943a001",
  "vehiculo": "507f1f77bcf86cd799439fff",
  "fecha": "2024-01-15",
  "litros": 45.5,
  "monto": 5450.00,
  "precioPorLitro": 120.00,
  "servicentro": "Servicentro CUPET Vía Blanca",
  "kilometraje": 15000
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd79943a002",
  "codigo": "CGA-2024-001",
  "tarjeta": { "_id": "...", "numeroTarjeta": "TCP-123456789" },
  "vehiculo": { "_id": "...", "placa": "C-123-456" },
  "fecha": "2024-01-15T00:00:00.000Z",
  "litros": 45.5,
  "monto": 5450.00,
  "precioPorLitro": 120.00,
  "servicentro": "Servicentro CUPET Vía Blanca",
  "kilometraje": 15000,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

### Listar Cargas

`GET /combustible/carga`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a002",
    "codigo": "CGA-2024-001",
    "vehiculo": { "_id": "...", "placa": "C-123-456" },
    "fecha": "2024-01-15T00:00:00.000Z",
    "litros": 45.5,
    "monto": 5450.00,
    "servicentro": "Servicentro CUPET Vía Blanca",
    "kilometraje": 15000
  }
]
```
</details>

### Cargas por Vehículo

`GET /combustible/carga/vehiculo/:vehiculoId`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd79943a002",
    "codigo": "CGA-2024-001",
    "fecha": "2024-01-15T00:00:00.000Z",
    "litros": 45.5,
    "monto": 5450.00,
    "kilometraje": 15000
  }
]
```
</details>

---

## Resumen de Consumo

`GET /combustible/consumo?vehiculoId=...`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "totalLitros": 450.5,
  "totalMonto": 54060.00,
  "cargas": 10,
  "consumoPromedio": 10.5,
  "porVehiculo": [
    {
      "vehiculo": { "_id": "...", "placa": "C-123-456" },
      "litros": 250.0,
      "monto": 30000.00,
      "cargas": 5
    }
  ]
}
```
</details>
