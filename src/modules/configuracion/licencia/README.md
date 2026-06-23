# Módulo Licencias

Gestiona licencias de software con seguridad avanzada. Genera claves cifradas, valida integridad con HMAC, protege contra replay attacks y audita cada operación.

## Seguridad

- **AES-256-GCM**: claves de licencia cifradas en BD
- **HMAC-SHA256**: firma de integridad con comparación timing-safe
- **Nonce**: anti-replay attack (5 min TTL)
- **Rate limiting**: 5 intentos/15min en activación, 10/min en validar-clave
- **Hardware binding**: fingerprint opcional
- **Cron**: desactiva licencias vencidas diariamente @midnight
- **Fixed-time response**: 150ms mínimo en endpoint público (anti timing attack)

## Endpoints

### Públicos (sin autenticación)

#### `POST /licencia/validar-clave`
Valida el formato de una clave sin consultar BD.

**Body:**
```json
{ "clave": "XILEF-A1B2-C3D4-E5F6-F7A8" }
```

**Response 200:**
```json
{ "formato_valido": true }
```

Rate limit: 10 req/min

---

#### `POST /licencia/activar`
Activa una licencia. Busca la clave en BD, verifica integridad HMAC, vincula a empresa.

**Body:**
```json
{
  "clave_activacion": "XILEF-A1B2-C3D4-E5F6-F7A8",
  "empresa_nombre": "Mi Empresa S.A.",
  "empresa_id": "J-123456789-0",
  "nonce": "opcional-anti-replay",
  "hardware_id": "opcional-fingerprint"
}
```
`empresa_nombre` y `empresa_id` son opcionales. Si no se envían, se usan los del registro.

**Response 200:**
```json
{
  "mensaje": "Licencia activada exitosamente",
  "valida": true,
  "vigente": true,
  "dias_restantes": 30,
  "tipo": "suscripcion_mensual",
  "empresa": "Mi Empresa S.A.",
  "fecha_vencimiento": "2026-07-22T03:59:59.999Z"
}
```

Errores: `400` (formato inválido, revocada, expirada, integridad comprometida) · `404` (no encontrada)
Rate limit: 5 req/15min

---

#### `GET /licencia/public/estado?clave=XILEF-XXXX-XXXX-XXXX-XXXX`
Consulta el estado de una licencia por clave. No requiere auth.

**Response 200:**
```json
{
  "valida": true,
  "vigente": true,
  "dias_restantes": 30,
  "tipo": "suscripcion_mensual",
  "empresa": "Mi Empresa S.A.",
  "empresa_id": "J-123456789-0",
  "fecha_inicio": "2026-06-21T04:00:00Z",
  "fecha_vencimiento": "2026-07-22T03:59:59.999Z",
  "max_usuarios": 10,
  "activa": true,
  "revocada": false
}
```

Rate limit: 20 req/min · Fixed-time: 150ms mínimo

---

### Protegidos (JWT + rol admin)

#### `POST /licencia/generar`
Genera una nueva licencia.

**Body:**
```json
{
  "empresa_nombre": "Mi Empresa S.A.",
  "empresa_id": "J-123456789-0",
  "tipo": "suscripcion_mensual",
  "duracion_dias": 30,
  "max_usuarios": 10,
  "fecha_inicio": "2026-06-21",
  "fecha_vencimiento": "2026-07-21"
}
```

Tipos: `trial`, `suscripcion_mensual`, `suscripcion_anual`, `perpetua`

**Response 201:**
```json
{
  "mensaje": "Licencia generada exitosamente",
  "licencia": {
    "clave": "XILEF-A1B2-C3D4-E5F6-F7A8",
    "empresa": "Mi Empresa S.A.",
    "tipo": "suscripcion_mensual",
    "fecha_inicio": "2026-06-21T04:00:00Z",
    "fecha_vencimiento": "2026-07-22T03:59:59.999Z",
    "dias_restantes": 30,
    "max_usuarios": 10
  }
}
```

Validaciones: fecha_vencimiento > fecha_inicio, > hoy, max 30 días futuro (no-perpetua) · Error: `409` si empresa ya tiene licencia

---

#### `POST /licencia/renovar`
Renueva una licencia existente.

**Body (por empresa_id):**
```json
{ "empresa_id": "J-123456789-0", "dias": 30 }
```

**Body (por clave):**
```json
{ "clave_activacion": "XILEF-...", "fecha_vencimiento": "2026-08-21" }
```

**Response 200:**
```json
{
  "mensaje": "Licencia renovada exitosamente",
  "licencia": {
    "empresa": "Mi Empresa S.A.",
    "tipo": "suscripcion_mensual",
    "fecha_inicio": "2026-06-21T04:00:00Z",
    "fecha_vencimiento": "2026-07-22T03:59:59.999Z",
    "dias_restantes": 30
  }
}
```

Límite: no excede 30 días desde hoy para no-perpetua

---

#### `POST /licencia/revocar/:empresaId`
Revoca una licencia.

**Body:**
```json
{ "motivo": "Violación de términos" }
```

**Response 200:**
```json
{ "mensaje": "Licencia revocada exitosamente" }
```

---

#### `GET /licencia`
Lista todas las licencias (sin campos sensibles).

#### `GET /licencia/:empresaId`
Obtiene una licencia por empresa_id.

#### `GET /licencia/estado?empresa_id=X`
Verifica estado de licencia por empresa_id (requiere JWT).

#### `GET /licencia/admin/auditoria`
Registros de auditoría de todas las operaciones.

## Arquitectura

```
licencia/
├── constants/        Tipos, regex, config
├── dto/              Validación class-validator
├── guards/           LicenciaGuard (protege rutas)
├── schemas/          MongoDB (licencia + auditoría)
├── services/
│   ├── crypto        AES-256-GCM + HMAC-SHA256
│   ├── generator     Claves XILEF-XXXX-...
│   ├── validator     Formato, nonce, integridad, hardware
│   ├── audit         Log de operaciones
│   └── cron          Desactivación programada
├── types/            Interfaces compartidas + abstract class LicenciaValidator
├── licencia.module.ts
├── licencia.controller.ts
└── licencia.service.ts (fachada)
```

## SOLID

- **S**: 5 servicios con una sola responsabilidad
- **O**: `LicenciaValidator` abstract class → nuevas validaciones sin modificar código existente
- **D**: `LicenciaService` depende de la abstracción, no de la implementación concreta
