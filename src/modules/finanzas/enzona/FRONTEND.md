# Enzona — Pasarela de Pago (`/enzona`)

Webhook para procesar pagos desde la pasarela Enzona.

---

### Webhook

`POST /enzona/webhook`

El backend procesa el webhook y crea una transacción automáticamente.

<details>
<summary>🔍 Ver request</summary>

```json
{
  "evento": "pago_confirmado",
  "id_operacion": "ENZ-2024-001",
  "monto": 5000.00,
  "moneda": "CUP",
  "fecha": "2024-01-15T10:30:00.000Z",
  "referencia": "FAC-2024-001",
  "metadata": {}
}
```
</details>

<details>
<summary>🔍 Ver response</summary>

```json
{
  "recibido": true,
  "mensaje": "Webhook procesado exitosamente",
  "transaccionCreada": "507f1f77bcf86cd799439055"
}
```
</details>
