# Cuentas Bancarias (`/banco`)

Gestión de cuentas bancarias (Res. 248/2008 BCC).

**Tipos de cuenta:** `"corriente"`, `"ahorro"`, `"mlc"`

---

### Registrar Cuenta Bancaria

`POST /banco`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "codigoBanco": "BFA-CUP-001",
  "nombreBanco": "Banco de Crédito y Comercio",
  "numeroCuenta": "123-456-789-012",
  "tipoCuenta": "corriente",
  "moneda": "507f1f77bcf86cd799439011",
  "saldoInicial": 0,
  "fechaApertura": "2024-01-15",
  "titular": "Empresa XILEF S.A."
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigoBanco": "BFA-CUP-001",
  "nombreBanco": "Banco de Crédito y Comercio",
  "numeroCuenta": "123-456-789-012",
  "tipoCuenta": "corriente",
  "moneda": { "_id": "...", "nombre": "CUP" },
  "saldoInicial": 0,
  "saldoActual": 0,
  "fechaApertura": "2024-01-15T00:00:00.000Z",
  "titular": "Empresa XILEF S.A.",
  "activo": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```
</details>

---

### Listar Cuentas Bancarias

`GET /banco`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "_id": "507f1f77bcf86cd799439aaa",
    "codigoBanco": "BFA-CUP-001",
    "nombreBanco": "Banco de Crédito y Comercio",
    "numeroCuenta": "123-456-789-012",
    "tipoCuenta": "corriente",
    "moneda": { "_id": "...", "nombre": "CUP" },
    "saldoInicial": 0,
    "saldoActual": 15000.00,
    "fechaApertura": "2024-01-15T00:00:00.000Z",
    "titular": "Empresa XILEF S.A.",
    "activo": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-02-01T10:00:00.000Z"
  }
]
```
</details>

---

### Saldos Actuales

`GET /banco/saldos`

<details>
<summary>🔍 Ver response</summary>

```json
[
  {
    "cuentaId": "507f1f77bcf86cd799439aaa",
    "numeroCuenta": "123-456-789-012",
    "nombreBanco": "Banco de Crédito y Comercio",
    "tipoCuenta": "corriente",
    "saldoActual": 15000.00
  }
]
```
</details>

---

### Obtener Cuenta por ID

`GET /banco/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigoBanco": "BFA-CUP-001",
  "nombreBanco": "Banco de Crédito y Comercio",
  "numeroCuenta": "123-456-789-012",
  "tipoCuenta": "corriente",
  "moneda": { "_id": "...", "nombre": "CUP" },
  "saldoInicial": 0,
  "saldoActual": 15000.00,
  "fechaApertura": "2024-01-15T00:00:00.000Z",
  "titular": "Empresa XILEF S.A.",
  "activo": true
}
```
</details>

---

### Actualizar Cuenta

`PATCH /banco/:id`

<details>
<summary>🔍 Ver request</summary>

```json
{
  "titular": "Empresa XILEF S.A. (Actualizado)",
  "activo": true
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "_id": "507f1f77bcf86cd799439aaa",
  "codigoBanco": "BFA-CUP-001",
  "titular": "Empresa XILEF S.A. (Actualizado)",
  "activo": true
}
```
</details>

---

### Eliminar Cuenta

`DELETE /banco/:id`

<details>
<summary>🔍 Ver response</summary>

```json
{ "deleted": true }
```
</details>
