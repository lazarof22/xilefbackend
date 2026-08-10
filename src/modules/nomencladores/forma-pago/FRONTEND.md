# Formas de Pago (/forma-pago)

Gestión de formas de pago.

---

### Registrar Forma de Pago

`POST /forma-pago`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Transferencia Bancaria"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "nombre": "Transferencia Bancaria"
}
```
</details>

---

### Listar Formas de Pago

`GET /forma-pago`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "nombre": "Transferencia Bancaria"
  },
  {
    "_id": "507f1f77bcf86cd799439022",
    "nombre": "Efectivo"
  }
]
```
</details>

---

### Obtener Forma de Pago por ID

`GET /forma-pago/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "nombre": "Transferencia Bancaria"
}
```
</details>

---

### Actualizar Forma de Pago

`PATCH /forma-pago/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "nombre": "Transferencia Electrónica"
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "nombre": "Transferencia Electrónica"
}
```
</details>

---

### Eliminar Forma de Pago

`DELETE /forma-pago/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
