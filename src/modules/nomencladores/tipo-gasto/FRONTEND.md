# Tipos de Gasto (/tipo-gasto)

Gestión de tipos de gasto.

---

### Registrar Tipo de Gasto

`POST /tipo-gasto`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Servicios Profesionales",
  "codigo": "TG-001"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Servicios Profesionales",
  "codigo": "TG-001"
}
```
</details>

---

### Listar Tipos de Gasto

`GET /tipo-gasto`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Servicios Profesionales",
    "codigo": "TG-001"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Materiales de Oficina",
    "codigo": "TG-002"
  }
]
```
</details>

---

### Obtener Tipo de Gasto por ID

`GET /tipo-gasto/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Servicios Profesionales",
  "codigo": "TG-001"
}
```
</details>

---

### Actualizar Tipo de Gasto

`PATCH /tipo-gasto/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Servicios Profesionales y Consultoría",
  "codigo": "TG-001-A"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Servicios Profesionales y Consultoría",
  "codigo": "TG-001-A"
}
```
</details>

---

### Eliminar Tipo de Gasto

`DELETE /tipo-gasto/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
