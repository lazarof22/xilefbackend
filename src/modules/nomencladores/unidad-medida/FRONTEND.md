# Unidades de Medida (/unidad-medida)

Gestión de unidades de medida.

---

### Registrar Unidad de Medida

`POST /unidad-medida`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Kilogramo",
  "abreviatura": "kg"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439051",
  "nombre": "Kilogramo",
  "abreviatura": "kg"
}
```
</details>

---

### Listar Unidades de Medida

`GET /unidad-medida`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439051",
    "nombre": "Kilogramo",
    "abreviatura": "kg"
  },
  {
    "_id": "507f1f77bcf86cd799439052",
    "nombre": "Litro",
    "abreviatura": "L"
  }
]
```
</details>

---

### Obtener Unidad de Medida por ID

`GET /unidad-medida/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439051",
  "nombre": "Kilogramo",
  "abreviatura": "kg"
}
```
</details>

---

### Actualizar Unidad de Medida

`PATCH /unidad-medida/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Gramo",
  "abreviatura": "g"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439051",
  "nombre": "Gramo",
  "abreviatura": "g"
}
```
</details>

---

### Eliminar Unidad de Medida

`DELETE /unidad-medida/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
