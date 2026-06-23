# Módulo Import/Export

Importación CSV de productos y respaldo/restauración JSON de toda la base de datos.

## Endpoints

Todos protegidos con JWT + rol `administrador`.

### `POST /importar/csv` (admin)
Importa productos desde un string CSV. Si el producto ya existe (por código), lo actualiza.

**Body:**
```json
{
  "csv": "codigo,nombre,precio_compra,precio_venta,stock_inicial,stock_minimo\nP001,Producto 1,100,150,50,10\nP002,Producto 2,200,300,30,5"
}
```

Formato CSV requerido:
```
codigo,nombre,precio_compra,precio_venta,stock_inicial,stock_minimo
```

**Response 200:**
```json
{
  "imported": 2,
  "errors": []
}
```

Lógica:
- Primera línea = headers
- Busca por `codigo_producto`. Si existe → actualiza. Si no → crea.
- Errores por fila se acumulan en `errors[]`, no detienen la importación.

---

### `GET /respaldo/exportar` (admin)
Exporta todas las colecciones de MongoDB como JSON.

**Response 200:**
```json
{
  "productos": [
    { "codigo_producto": "P001", "nombre_producto": "Producto 1", ... }
  ],
  "clientes": [ ... ],
  "licencias": [ ... ],
  ...
}
```

- Itera todas las colecciones de la BD
- Excluye `_id` y `__v` de cada documento

---

### `POST /respaldo/importar` (admin)
Restaura datos desde un JSON (formato de exportación).

**Body:**
```json
{
  "productos": [ { "codigo_producto": "P001", ... } ],
  "clientes": [ ... ]
}
```

**Response 200:**
```json
{
  "imported": 150,
  "errors": []
}
```

- Inserta documentos en cada colección
- Errores por documento se acumulan, no detienen la importación
