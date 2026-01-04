# Contratos de Integración - BeatMarket

## Resumen
Este documento define los contratos entre frontend y backend para la plataforma de venta de beats.

## Estado Actual
✅ **Frontend completado** - Todas las vistas funcionando con datos mock
🔄 **Backend pendiente** - Requiere API keys de terceros

---

## 1. Datos Mock (Actuales en /frontend/src/mock.js)

### Beats
- 8 beats de ejemplo con información completa
- Campos: id, name, producer, bpm, key, mood, genre, duration, audioPreviewUrl, coverImage, tags, prices, plays, sales

### Licencias
- 3 tipos: básica, premium, exclusiva
- Cada una con features y restrictions definidas

### Ventas
- 3 ventas de ejemplo con información de compra

### Dashboard Stats
- Estadísticas simuladas para el panel admin

---

## 2. API Endpoints a Implementar

### 2.1 Beats Management

#### GET /api/beats
Obtener todos los beats
```json
Response: [
  {
    "id": "string",
    "name": "string",
    "producer": "string",
    "bpm": number,
    "key": "string",
    "mood": "string",
    "genre": "string",
    "duration": "string",
    "audioPreviewUrl": "string",
    "audioFullUrl": "string",
    "coverImage": "string",
    "tags": ["string"],
    "prices": {
      "basica": number,
      "premium": number,
      "exclusiva": number
    },
    "plays": number,
    "sales": number,
    "isExclusive": boolean,
    "createdAt": "date"
  }
]
```

#### GET /api/beats/:id
Obtener un beat específico

#### POST /api/beats
Crear nuevo beat (Admin)
```json
Request: {
  "name": "string",
  "bpm": number,
  "key": "string",
  "mood": "string",
  "genre": "string",
  "audioFile": "file",
  "coverImage": "file",
  "prices": {
    "basica": number,
    "premium": number,
    "exclusiva": number
  }
}
```

#### PUT /api/beats/:id
Actualizar beat existente

#### DELETE /api/beats/:id
Eliminar beat

#### POST /api/beats/:id/increment-play
Incrementar contador de reproducciones

---

### 2.2 Purchase Flow

#### POST /api/purchase/create-payment
Crear intención de pago
```json
Request: {
  "beatId": "string",
  "licenseType": "basica" | "premium" | "exclusiva",
  "paymentMethod": "stripe" | "paypal" | "mercadopago",
  "buyerEmail": "string",
  "buyerName": "string"
}

Response: {
  "paymentId": "string",
  "clientSecret": "string",
  "amount": number
}
```

#### POST /api/purchase/confirm
Confirmar pago y procesar orden
```json
Request: {
  "paymentId": "string",
  "beatId": "string",
  "licenseType": "string",
  "buyerEmail": "string"
}

Response: {
  "orderId": "string",
  "downloadUrl": "string",
  "licenseUrl": "string"
}
```

---

### 2.3 Email & File Delivery

#### POST /api/email/send-purchase
Enviar email con beat y licencia
```json
Request: {
  "orderId": "string",
  "buyerEmail": "string",
  "beatName": "string",
  "licenseType": "string"
}
```

---

### 2.4 Admin Dashboard

#### GET /api/admin/stats
Obtener estadísticas del dashboard
```json
Response: {
  "totalSales": number,
  "totalBeats": number,
  "totalPlays": number,
  "totalPurchases": number,
  "monthlyRevenue": number,
  "topGenre": "string",
  "averagePrice": number
}
```

#### GET /api/admin/sales
Obtener ventas recientes
```json
Response: [
  {
    "id": "string",
    "beatId": "string",
    "beatName": "string",
    "buyerEmail": "string",
    "licenseType": "string",
    "amount": number,
    "paymentMethod": "string",
    "date": "date",
    "status": "completed" | "pending" | "failed"
  }
]
```

---

## 3. Integraciones de Terceros Requeridas

### 3.1 Procesadores de Pago
- **Stripe**: Para tarjetas de crédito/débito
- **PayPal**: Para cuentas PayPal
- **Mercado Pago**: Para mercado latinoamericano

### 3.2 Email Service
- **SendGrid**: Para envío de beats post-compra
- Plan gratuito: 100 emails/día

### 3.3 Almacenamiento de Archivos
- **Opción recomendada**: Amazon S3, Google Cloud Storage o Cloudflare R2
- Almacenar: 
  - MP3 con tag (previews)
  - MP3/WAV sin tag (versión completa)
  - Imágenes de portada

### 3.4 PDF Generation
- **pdfkit** o **puppeteer**: Para generar contratos de licencia PDF

---

## 4. Modelos de Base de Datos (MongoDB)

### Beat Model
```javascript
{
  _id: ObjectId,
  name: String,
  producer: String,
  bpm: Number,
  key: String,
  mood: String,
  genre: String,
  duration: String,
  audioPreviewUrl: String,
  audioFullUrl: String,
  coverImageUrl: String,
  tags: [String],
  prices: {
    basica: Number,
    premium: Number,
    exclusiva: Number
  },
  plays: Number,
  sales: Number,
  isExclusive: Boolean,
  exclusiveBuyer: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderId: String,
  beatId: ObjectId,
  beatName: String,
  buyerEmail: String,
  buyerName: String,
  licenseType: String,
  amount: Number,
  paymentMethod: String,
  paymentId: String,
  status: String,
  downloadUrl: String,
  licenseUrl: String,
  createdAt: Date
}
```

---

## 5. Frontend Changes Post-Integration

### Archivos a modificar:
1. **/frontend/src/pages/Catalogo.jsx**
   - Reemplazar `mockBeats` con llamadas a API
   - Agregar loading states y error handling

2. **/frontend/src/pages/BeatDetail.jsx**
   - Fetch beat individual desde API
   - Integrar flujo de pago real con Stripe/PayPal/MercadoPago

3. **/frontend/src/pages/Admin.jsx**
   - Conectar formulario de upload con backend
   - Implementar upload de archivos (audio + imagen)
   - Fetch stats y sales desde API

4. **/frontend/src/components/AudioPlayer.jsx**
   - Incrementar contador de plays en backend al reproducir

### Crear nuevo archivo:
- **/frontend/src/services/api.js** - Centralizar llamadas a API

---

## 6. Seguridad

### Frontend
- Validación de formularios con zod
- Sanitización de inputs
- Manejo de errores con toast notifications

### Backend
- Rate limiting en endpoints de pago
- Validación de emails
- Verificación de pagos con webhooks
- Autenticación JWT para panel admin
- CORS configurado correctamente

---

## 7. Testing Post-Integration

### Backend Testing
- Test de endpoints con curl
- Validar webhooks de payment processors
- Test de envío de emails
- Test de upload de archivos

### Frontend Testing
- Test flujo de compra completo
- Test reproductor de audio
- Test formulario de admin
- Test responsive en mobile

---

## 8. Environment Variables Requeridas

### Backend (.env)
```
# Existing
MONGO_URL=...
DB_NAME=...

# New - Payment Processors
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
MERCADOPAGO_ACCESS_TOKEN=...

# Email
SENDGRID_API_KEY=...
FROM_EMAIL=...

# File Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=...

# App
JWT_SECRET=...
ADMIN_PASSWORD=...
```

---

## Notas Importantes

1. **Todas las compras actualmente son simuladas** - El botón "Comprar Ahora" muestra un toast pero no procesa pagos reales
2. **Los archivos de audio son URLs de ejemplo** - Reemplazar con archivos reales subidos al almacenamiento cloud
3. **No hay autenticación en admin** - Implementar login antes de producción
4. **Los precios son variables por beat** - Confirmado por el usuario
5. **Envío de beats por email** - No descarga directa desde la web
6. **Tags en previews** - Los usuarios suben archivos MP3 que ya tienen el tag de voz

---

## Próximos Pasos

1. ✅ Frontend completado y funcional
2. 🔄 Usuario obtiene API keys de servicios terceros
3. 🔄 Implementar backend con integraciones
4. 🔄 Testing completo de flujo de compra
5. 🔄 Deploy a producción
