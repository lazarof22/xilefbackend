# Tipos de Contrato (/tipo-contrato)

Gestión de tipos de contrato.

---

### Registrar Tipo de Contrato

`POST /tipo-contrato`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Contrato Indefinido"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439061",
  "nombre": "Contrato Indefinido"
}
```
</details>

---

### Listar Tipos de Contrato

`GET /tipo-contrato`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439061",
    "nombre": "Contrato Indefinido"
  },
  {
    "_id": "507f1f77bcf86cd799439062",
    "nombre": "Contrato Temporal"
  }
]
```
</details>

---

### Obtener Tipo de Contrato por ID

`GET /tipo-contrato/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439061",
  "nombre": "Contrato Indefinido"
}
```
</details>

---

### Actualizar Tipo de Contrato

`PATCH /tipo-contrato/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Contrato por Tiempo Indefinido"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439061",
  "nombre": "Contrato por Tiempo Indefinido"
}
```
</details>

---

### Eliminar Tipo de Contrato

`DELETE /tipo-contrato/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
