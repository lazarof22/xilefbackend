# XILEF Backend — AGENTS.md

## Stack

- **NestJS 11** monolith, single package (no monorepo)
- **MongoDB 9** via `@nestjs/mongoose` (no SQL)
- **JWT auth** via `@nestjs/passport` + `passport-jwt` + `passport-local`
- **Swagger** at `/docs` (auto-generated via `@nestjs/swagger` plugin)
- **Validation** via `class-validator` + `class-transformer`
- **Rate limiting** via `@nestjs/throttler` (used by license module)
- **Compiler**: `@swc/cli` + `@swc/core` (fast builds), `ts-jest` for tests

## Commands

| Purpose | Command |
|---|---|
| Dev server (watch) | `npm run start:dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Unit tests | `npm test` |
| E2E tests | `npm run test:e2e` (requires MongoDB) |
| Test coverage | `npm run test:cov` |

Always run: `npm run lint` after editing, then `npm test` on affected modules.

## Architecture

### Modules (`src/modules/`)

- **auth/** — JWT register/login, Passport strategies, roles guard, employee schema
- **nomencladores/** — CRUD nomenclatures (Area, Categoria, Departamento, etc.) with `findOrCreate` pattern
- **configuracion/** — License (crypto, HMAC, rate-limited), users CRUD, company data, CSV import/export
- **clientes y provedores/** — Cliente, Empresa
- **inventario/** — Producto, Kardex
- **venta/** — Venta, Pago, ReportePlus, ReporteCaja
- **compra/** — Compra
- **contabilidad/** — ActivoFijo, Cuenta, Concepto, Movimiento, ConteoFisico
- **finanzas/** — Banco, Caja, Cheque, Combustible, Conciliacion, Credito, CuentaCobrar, CuentaPagar, Enzona, Transaccion

### Conventions

- **Employee schema** lives in `auth/schemas/empleado.schema.ts` — other modules (e.g. `configuracion/usuarios`) reuse it
- **Nomenclador modules** export `MongooseModule` so `NomencladorHelper` can inject their services
- **LicenseGuard** protects license admin routes; **RolesGuard** protects other admin routes
- Routes are in Spanish (e.g. `/licencia/validar-clave`, `/importar/csv`)

## Env (.env.example)

```
MONGODB_URI=mongodb://localhost:27017/xilef
PORT=3000
LICENSE_SECRET_KEY=<32+ chars>
LICENSE_SIGN_SECRET=<32+ chars>
```

## Stale tests

- `src/app.controller.spec.ts:19` and `test/app.e2e-spec.ts:23` expect `'Hello World!'` but the app returns `'XILEF'` — update or remove these.

## Gotchas

- JWT_SECRET is hardcoded as `'Chimuelo'` in `auth/constants/constants.ts` — do not treat it as an env var
- E2E tests (`test/licencia.e2e-spec.ts`) set `LICENSE_SECRET_KEY` and `LICENSE_SIGN_SECRET` via `process.env` in `beforeAll`
- Throttler config is in the license module; some endpoints have custom rate limits (5/15min for activation, 10/min for key validation)
- Prettier: single quotes, trailing commas
- ESLint: `@typescript-eslint/no-explicit-any: off` — avoid adding this rule back
- No CI/CD, no Docker, no Husky — all verification is manual
