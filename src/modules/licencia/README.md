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

## Frontend: especificación de UI

El backend ya tiene la separación de responsabilidades resuelta (endpoints públicos vs admin con JWT + rol `administrador`). El frontend debe implementar **dos conjuntos de pantallas independientes**.

### Regla de oro

El panel de administración (generar, renovar, revocar, auditoría) **es una aplicación frontend separada**. No se compila en el bundle del cliente, no comparte repositorio de frontend, no se despliega en el servidor del cliente. Corre en infraestructura de XILEF y se conecta al mismo backend que la app del cliente, pero usando solo los endpoints protegidos con JWT + rol `administrador`.

**¿Por qué separado?**
- El cliente nunca debe ver pantallas de generar/renovar/revocar licencias.
- Si la app del cliente tiene las rutas de admin (aunque ocultas), un cliente técnico puede inspeccionar el bundle, forzar las rutas y al menos ver la UI.
- Separado elimina esa superficie de ataque por completo: el binario del cliente simplemente no contiene ese código.
- El backend ya está blindado con `RolesGuard` — el frontend separado es defensa en profundidad, no el único mecanismo.
---

### A. Pantallas del cliente (van en la app que recibe la empresa)

Estas pantallas NO requieren login previo (el `LicenciaGuard` las deja pasar porque sus endpoints son públicos).

#### A1. Activación de licencia

**Cuándo se muestra:** el `LicenciaGuard` devuelve 403 `"No hay licencia activa para esta empresa"`. El frontend intercepta ese error y redirige a esta pantalla.

**Endpoint:** `POST /licencia/activar`

**Campos:**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| Clave de activación | texto | sí | formato `XILEF-XXXX-XXXX-XXXX-XXXX`, validar con `/licencia/validar-clave` en tiempo real |
| Nombre de empresa | texto | no | pre-rellenado si el backend ya lo conoce |
| ID de empresa | texto | no | RIF/CUIT, pre-rellenado si ya existe |
| Hardware ID | oculto/automático | no | fingerprint de la máquina, lo calcula el frontend |

**Validación en tiempo real:**
- Mientras el usuario escribe la clave, llamar a `POST /licencia/validar-clave` con debounce 300ms.
- Mostrar ícono verde/rojo al lado del campo según `formato_valido`.

**Flujo:**
1. Usuario pega la clave.
2. Validación de formato en tiempo real.
3. Al presionar "Activar", el frontend calcula opcionalmente un `hardware_id` (fingerprint del equipo) y lo envía.
4. **Éxito (200):** redirigir al dashboard principal. Guardar en localStorage la última clave usada.
5. **Error 400:** mostrar mensaje del backend textual (`"Licencia revocada"`, `"Licencia expirada"`, etc.).
6. **Error 404:** `"Clave no encontrada. Verifique que la haya copiado correctamente."`
7. Rate limit (5/15min): si el backend devuelve 429, mostrar contador regresivo.

**UI:** pantalla simple, centrada, sin menú lateral ni header de app. Solo logo de XILEF + formulario + botón. Fondo neutro.

---

#### A2. Estado de licencia

**Cuándo se muestra:** accesible desde un ícono/opción en el header o menú de configuración, solo si hay JWT válido.

**Endpoint:** `GET /licencia/estado`

**Respuesta a mostrar:**

| Dato | Cómo mostrarlo |
|------|---------------|
| Empresa | texto |
| Tipo | etiqueta: `Trial` (amarillo), `Suscripción mensual` (azul), `Suscripción anual` (verde), `Perpetua` (dorado) |
| Vigencia | barra de progreso con días restantes. Si < 7 días → naranja. Si < 3 días → rojo. |
| Perpetua | barra llena, texto "Vitalicia" |
| Vencimiento | fecha legible |
| Usuarios máx. | número, mostrar "X usuarios permitidos" |

**Acciones:** botón "Contactar a XILEF para renovar" (abre mail a ventas@xilef.com o lo que corresponda). **No hay botón de renovar** — eso lo hace el admin.

---

#### A3. Licencia vencida / bloqueo

**Cuándo se muestra:** el `LicenciaGuard` devuelve 403 con mensaje `"Licencia expirada hace X días"`. El frontend intercepta ese error en cualquier ruta protegida.

**UI:** pantalla de bloqueo full-screen. Misma estética que la activación pero con:
- Mensaje: "Su licencia ha expirado."
- Días desde el vencimiento (del mensaje de error).
- Período de gracia (7 días): si todavía está en gracia, mostrar "Período de gracia activo — X días restantes para renovar sin perder el acceso."
- Botón único: "Contactar a XILEF para renovar".
- Sin acceso a ninguna otra parte del sistema.

---

### B. Panel de administración (aplicación independiente, solo para XILEF)

Requiere JWT con `rol: 'administrador'`. Todo endpoint usa `RolesGuard` — el frontend puede confiar en que si el usuario no es admin, el backend rechaza.

#### B1. Dashboard / listado de licencias

**Endpoint:** `GET /licencia`

**Tabla con columnas:**
| Columna | Dato |
|---------|------|
| Empresa | `empresa_nombre` |
| RIF/ID | `empresa_id` |
| Clave | `clave` (enmascarada: `XILEF-XXXX-XXXX-****-****` salvo al hacer clic para copiar) |
| Tipo | etiqueta de color (igual que A2) |
| Vencimiento | fecha |
| Estado | chip: `Activa` (verde), `Vencida` (rojo), `Revocada` (gris), `Trial` (amarillo) |
| Acciones | botones: Ver detalle, Renovar, Revocar |

**Filtros:** búsqueda por empresa o RIF, filtro por tipo, filtro por estado.

---

#### B2. Detalle de licencia

**Endpoint:** `GET /licencia/:empresaId`

Misma info que el listado pero completa:
- Datos completos de la licencia.
- Clave completa con botón "Copiar" (para enviar al cliente).
- Fechas de inicio, vencimiento, sincronización.
- Estado de `hardware_id`.
- Auditoría reciente de esa licencia.

**Acciones:** botones Renovar y Revocar (con confirmación).

---

#### B3. Generar nueva licencia

**Endpoint:** `POST /licencia/generar`

**Formulario:**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| Nombre de empresa | texto | sí | |
| ID de empresa (RIF) | texto | sí | validar que no exista ya (`409 Conflict`) |
| Tipo de licencia | select | sí | Trial / Suscripción mensual / Suscripción anual / Perpetua |
| Duración (días) | número | condicional | solo si no es perpetua. Máx 30 en generación inicial |
| Fecha de inicio | date | sí | default: hoy |
| Máx. usuarios | número | sí | default: 10 |
| Fecha de vencimiento | date | automático | calculado a partir de inicio + duración |

**Flujo:**
1. Llenar formulario.
2. Validar campos.
3. Al generar, el backend devuelve la clave `XILEF-XXXX-...`.
4. **Mostrar la clave en grande**, con botón "Copiar" y mensaje: "Entregue esta clave al cliente. No se volverá a mostrar completa."
5. La clave se enmascara automáticamente al salir de esta pantalla.

---

#### B4. Renovar licencia

**Endpoint:** `POST /licencia/renovar`

Dos modos:

**Por empresa (desde listado/detalle):**
- Select/search de empresa.
- Campo `dias`: número, máximo 30 para no-perpetua.
- Botón "Renovar".

**Por clave (si el cliente ya la tiene):**
- Campo `clave_activacion`.
- Campo `fecha_vencimiento` (fecha).

**Respuesta:** confirmación con los nuevos datos de vigencia.

---

#### B5. Revocar licencia

**Endpoint:** `POST /licencia/revocar/:empresaId`

**Flujo:**
1. Desde listado o detalle → botón "Revocar".
2. Modal de confirmación con:
   - Texto de advertencia: "Al revocar esta licencia, el cliente perderá el acceso inmediatamente."
   - Campo `motivo` (requerido, texto libre).
   - Checkbox: "Entiendo que esta acción no se puede deshacer."
3. Confirmar → se envía la solicitud.
4. Éxito → la licencia aparece como `Revocada` en el listado.

---

#### B6. Auditoría

**Endpoint:** `GET /licencia/admin/auditoria`

**Tabla con columnas:**
| Columna | Dato |
|---------|------|
| Fecha/hora | timestamp |
| Empresa | `empresa_nombre` |
| Acción | `activacion`, `renovacion`, `revocacion`, `generacion`, `verificacion` |
| IP | dirección IP |
| User agent | navegador/SO (colapsado o en tooltip) |
| Detalle | datos relevantes de la operación |

**Filtros:** por empresa, por acción, por rango de fechas.

**Paginación:** usar `limit` y `offset` del endpoint (máx 100 por página).

---

### C. Separación de aplicaciones

| Aplicación | Quién la usa | Qué contiene |
|------------|-------------|--------------|
| **App cliente** | La empresa que compró XILEF | Solo pantallas de tipo A (activación, estado, bloqueo). Nada de admin. |
| **Panel XILEF** | El equipo de XILEF (administradores) | Solo pantallas de tipo B (dashboard, generar, renovar, revocar, auditoría). |

**Reglas:**
- La app cliente **no incluye rutas, componentes ni endpoints de admin**. Si el JWT tiene `rol: 'administrador'`, la app cliente lo ignora — el admin usa el panel separado.
- El panel XILEF **no incluye pantallas de activación** — eso lo hace el cliente solo.
- Ambas aplicaciones comparten el mismo backend, pero cada una consume solo sus endpoints.
- Los mensajes de error del backend vienen en español, listos para mostrar sin traducción.
- Interceptar 401/403 y redirigir a login o bloqueo según corresponda.

---

### D. Manejo de rate limiting

| Endpoint | Límite | UI cuando se excede |
|----------|--------|---------------------|
| `activar` | 5/15min | Mostrar contador regresivo, deshabilitar botón |
| `validar-clave` | 10/min | Silencioso (el debounce de 300ms evita el problema) |
| `public/estado` | 20/min | No aplica (es consulta ocasional) |
| Sin límite explícito | - | Si el backend devuelve 429 igual, mostrar "Demasiadas solicitudes. Intente en un momento." |

---

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
