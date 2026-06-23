# Módulo Usuarios

CRUD de empleados para administración. Reutiliza el schema del módulo auth.

## Endpoints

Todos protegidos con JWT + rol `administrador`.

### `GET /usuarios` (admin)
Lista todos los usuarios. No incluye contraseñas.

**Response 200:**
```json
[
  {
    "_id": "60d5f9f8...",
    "ci_empleado": "12345678901",
    "nombre_empleado": "Juan Pérez",
    "correo_empleado": "juan@xilef.com",
    "departamento": "60d5f9f8...",
    "cargo": "60d5f9f8...",
    "salario": 2500,
    "rol": "empleado",
    "createdAt": "..."
  }
]
```

---

### `POST /usuarios` (admin)
Crea un nuevo empleado. La contraseña se hashea con bcrypt.

**Body:**
```json
{
  "ci_empleado": "12345678901",
  "nombre_empleado": "Juan Pérez",
  "correo_empleado": "juan@xilef.com",
  "contraseña": "Password123!",
  "departamento": "60d5f9f8e3b3c8b0f4e4d3a1",
  "cargo": "60d5f9f8e3b3c8b0f4e4d3a2",
  "salario": 2500,
  "rol": "empleado"
}
```

Validaciones:
- `ci_empleado`: exactamente 11 caracteres
- `correo_empleado`: email válido, único
- `contraseña`: mínimo 6 caracteres
- `departamento`, `cargo`: MongoDB ObjectId válido
- `rol`: `administrador` | `empleado` | `jefe` | `facturador` (default: `empleado`)

**Response 201:** El usuario creado.

Errores: `409` si correo o cédula ya existen.

---

### `DELETE /usuarios/:id` (admin)
Elimina un usuario por su `_id`.

**Response 200:** Sin body.

Error: `404` si no existe.

## Schema

Reutiliza `empleado.schema.ts` del módulo `auth`:

| Campo | Tipo | Requerido |
|-------|------|-----------|
| ci_empleado | string | ✅ (único) |
| nombre_empleado | string | ✅ |
| correo_empleado | string | ✅ (único) |
| contraseña | string | ✅ (select: false) |
| departamento | ObjectId (ref: Departamento) | ✅ |
| cargo | ObjectId (ref: CargoEmpleado) | ✅ |
| salario | number | ✅ |
| rol | enum UsuarioRol | (default: empleado) |
| createdAt | Date | auto |
