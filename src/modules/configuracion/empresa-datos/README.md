# Módulo Empresa-Datos

Gestiona los datos de la empresa que usa XILEF. Un solo registro con upsert.

## Endpoints

### `GET /empresa` (público)
Obtiene los datos actuales de la empresa.

**Response 200:**
```json
{
  "_id": "60d5f9f8...",
  "nombre": "XILEF C.A.",
  "eslogan": "Innovación y calidad",
  "direccion": "Av. Principal 123",
  "telefono": "+58 212 5550000",
  "email": "info@xilef.com",
  "ruc_nit": "J-987654321-0",
  "ciudad": "Caracas",
  "pais": "Venezuela",
  "logo": "data:image/png;base64,...",
  "createdAt": "...",
  "updatedAt": "..."
}
```
Si no hay datos, retorna `null`.

---

### `PUT /empresa` (admin)
Guarda o actualiza los datos. Todos los campos son opcionales.

**Body:**
```json
{
  "nombre": "XILEF C.A.",
  "eslogan": "Innovación y calidad",
  "direccion": "Av. Principal 123",
  "telefono": "+58 212 5550000",
  "email": "info@xilef.com",
  "ruc_nit": "J-987654321-0",
  "ciudad": "Caracas",
  "pais": "Venezuela"
}
```

**Response 200:** El documento creado/actualizado completo.

---

### `POST /empresa/logo` (admin)
Sube o actualiza el logo de la empresa.

**Body:**
```json
{ "logo": "data:image/png;base64,iVBORw0KGgo=..." }
```

**Response 200:** El documento con el logo actualizado.

Si no existe registro previo, crea uno con `nombre: "Sin nombre"`.

## Schema

| Campo | Tipo | Requerido |
|-------|------|-----------|
| nombre | string | ✅ |
| eslogan | string | |
| direccion | string | |
| telefono | string | |
| email | string | |
| ruc_nit | string | |
| ciudad | string | |
| pais | string | |
| logo | string | (base64) |
| createdAt | Date | auto |
| updatedAt | Date | auto |

## Lógica

- **Upsert**: Si existe un registro, lo actualiza. Si no, lo crea.
- **Logo**: Misma lógica. Si no hay registro, crea uno temporal.
- **Colección**: `empresa_datos` (un solo documento).
