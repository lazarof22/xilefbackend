# Tipos de Proveedor (/tipo-proveedor)

Gestión de tipos de proveedor.

---

### Registrar Tipo de Proveedor

`POST /tipo-proveedor`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Nacional"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439041",
  "nombre": "Nacional"
}
```
</details>

---

### Listar Tipos de Proveedor

`GET /tipo-proveedor`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439041",
    "nombre": "Nacional"
  },
  {
    "_id": "507f1f77bcf86cd799439042",
    "nombre": "Extranjero"
  }
]
```
</details>

---

### Obtener Tipo de Proveedor por ID

`GET /tipo-proveedor/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439041",
  "nombre": "Nacional"
}
```
</details>

---

### Actualizar Tipo de Proveedor

`PATCH /tipo-proveedor/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Proveedor Local"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439041",
  "nombre": "Proveedor Local"
}
```
</details>

---

### Eliminar Tipo de Proveedor

`DELETE /tipo-proveedor/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
