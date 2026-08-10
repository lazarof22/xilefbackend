# Naturalezas de Cuenta (/naturaleza-cuenta)

Gestión de naturalezas de cuenta.

---

### Registrar Naturaleza de Cuenta

`POST /naturaleza-cuenta`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Deudora"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439031",
  "nombre": "Deudora"
}
```
</details>

---

### Listar Naturalezas de Cuenta

`GET /naturaleza-cuenta`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439031",
    "nombre": "Deudora"
  },
  {
    "_id": "507f1f77bcf86cd799439032",
    "nombre": "Acreedora"
  }
]
```
</details>

---

### Obtener Naturaleza de Cuenta por ID

`GET /naturaleza-cuenta/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439031",
  "nombre": "Deudora"
}
```
</details>

---

### Actualizar Naturaleza de Cuenta

`PATCH /naturaleza-cuenta/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Deudora Corriente"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439031",
  "nombre": "Deudora Corriente"
}
```
</details>

---

### Eliminar Naturaleza de Cuenta

`DELETE /naturaleza-cuenta/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
