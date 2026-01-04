# 🎵 BeatMarket - Plataforma de Venta de Beats

## 📋 Descripción

BeatMarket es una plataforma profesional de venta de beats online diseñada para productores musicales que desean monetizar su trabajo. Ofrece un catálogo completo de beats, sistema de licencias flexible, reproductor de audio integrado y panel de administración.

## ✨ Características Actuales (Frontend Completo)

### 🏠 Landing Page
- Hero section con copy persuasivo orientado a resultados
- Estadísticas de confianza (100+ beats, 500+ artistas, descarga 24h)
- Beats destacados con preview
- Propuesta de valor clara (licencias, descarga inmediata, monetización)
- CTA potentes y diseño urbano moderno (rojo/negro)

### 🎧 Catálogo de Beats
- Grid responsive con 8 beats de ejemplo
- Búsqueda por nombre o género
- Filtros por género (Trap, Reggaeton, R&B, Hip Hop, Drill, Lo-Fi, Afrobeat)
- Ordenamiento (recientes, populares, precio)
- Cards con hover effects y preview rápido
- Información: BPM, tonalidad, plays, precio

### 🎵 Detalle de Beat
- Reproductor de audio MP3 personalizado
- 3 tipos de licencias (Básica, Premium, Exclusiva)
- Selección visual de licencia
- Información completa del beat (BPM, key, mood, duración)
- Sistema de compra simulado (toast notifications)
- Tags y etiquetas
- Diseño inmersivo con imagen de portada

### 📄 Página de Licencias
- Comparación visual de 3 tipos de licencias
- Features y restricciones detalladas
- FAQ completo (descarga, Spotify, exclusiva, reembolsos, pagos)
- Precios variables por beat

### 🛠️ Dashboard Admin
- Estadísticas de ventas y reproducciones
- Formulario de subida de beats con drag & drop
- Gestión de catálogo (tabla con editar/eliminar)
- Historial de ventas recientes
- Campos: nombre, género, BPM, tonalidad, mood, precios por licencia

### 🎨 Diseño
- Esquema de colores: Rojo (#DC2626) y Negro (#0A0A0A)
- Estilo urbano/musical moderno
- Componentes Shadcn UI
- Animaciones suaves en hover
- Scrollbar personalizado
- Responsive design completo

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Framework UI
- **React Router Dom** - Navegación
- **Tailwind CSS** - Estilos
- **Shadcn UI** - Componentes
- **Lucide React** - Iconos
- **Sonner** - Toast notifications

### Backend (Pendiente de integración)
- **FastAPI** - Framework Python
- **MongoDB** - Base de datos
- **Motor** - Driver async de MongoDB

### Integraciones Terceros (Pendiente)
- **Stripe** - Pagos con tarjeta
- **PayPal** - Pagos con cuenta PayPal
- **Mercado Pago** - Pagos LATAM
- **SendGrid** - Envío de emails
- **AWS S3 / Google Cloud Storage** - Almacenamiento de archivos

## 📁 Estructura del Proyecto

```
/app
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Componentes Shadcn
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── AudioPlayer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Catalogo.jsx
│   │   │   ├── BeatDetail.jsx
│   │   │   ├── Licencias.jsx
│   │   │   └── Admin.jsx
│   │   ├── mock.js          # Datos simulados
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── server.py
│   └── requirements.txt
└── contracts.md              # Contratos de integración
```

## 🚀 Instalación y Uso

### Frontend
```bash
cd /app/frontend
yarn install
yarn start
```

El frontend estará disponible en: `http://localhost:3000`

### Backend (Actualmente básico)
```bash
cd /app/backend
pip install -r requirements.txt
# Se ejecuta automáticamente con supervisor
```

## 🎯 Funcionalidad Actual

### ✅ Completamente Funcional (Mock)
- Navegación entre páginas
- Búsqueda y filtrado de beats
- Reproductor de audio (con URLs de ejemplo)
- Selección de licencias
- Simulación de compra (toast)
- Formulario de subida de beats (visual)
- Dashboard con estadísticas

### 🔄 Pendiente (Requiere Backend)
- Pagos reales (Stripe, PayPal, Mercado Pago)
- Upload de archivos de audio reales
- Envío de beats por email
- Generación de PDFs de licencia
- Autenticación de admin
- Base de datos real
- Almacenamiento en cloud

## 📝 Copywriting y Mensajes Clave

### Propuesta de Valor
- **Headline**: "Beats que te hacen ganar dinero"
- **Enfoque**: Resultados, monetización, crecimiento de carrera
- **Beneficios**: Calidad profesional, licencias claras, descarga inmediata

### Tonos del Copy
- Urbano y profesional
- Directo y sin rodeos
- Inspirador pero comercial
- Enfocado en ROI para artistas

## 🎨 Paleta de Colores

```css
/* Rojos */
--red-600: #DC2626
--red-700: #B91C1C
--red-800: #991B1B
--red-950: #450A0A

/* Negros */
--black: #000000
--zinc-900: #18181B
--zinc-950: #09090B

/* Grises */
--gray-400: #9CA3AF
--gray-300: #D1D5DB
```

## 📋 Checklist de Integración Backend

- [ ] Configurar API keys de payment processors
- [ ] Configurar SendGrid para emails
- [ ] Configurar almacenamiento cloud (S3/GCS)
- [ ] Implementar endpoints de API (ver contracts.md)
- [ ] Implementar modelos de MongoDB
- [ ] Integrar Stripe payment flow
- [ ] Integrar PayPal payment flow
- [ ] Integrar Mercado Pago payment flow
- [ ] Implementar generación de PDFs
- [ ] Implementar envío de emails con beats
- [ ] Agregar autenticación JWT para admin
- [ ] Testing completo del flujo de compra

## 🔐 Seguridad

### Frontend
- Validación de formularios
- Sanitización de inputs
- Manejo de errores con toasts

### Backend (A implementar)
- Rate limiting
- JWT authentication
- Webhook verification
- Input validation
- CORS configurado

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1280px-1920px)
- ✅ Tablet (768px-1280px)
- ✅ Mobile (320px-768px)

## 🌐 Rutas de la Aplicación

- `/` - Landing page
- `/catalogo` - Catálogo completo de beats
- `/beat/:id` - Detalle de beat individual
- `/licencias` - Información de licencias
- `/admin` - Panel de administración

## 📧 Contacto y Soporte

Para soporte técnico o consultas sobre la plataforma:
- Email: contacto@beatmarket.com (simulado)
- Respuesta: 24-48 horas

## 📄 Licencia

Todos los derechos reservados © 2025 BeatMarket

---

**Estado del Proyecto**: ✅ Frontend completo y funcional con datos mock. Listo para integración backend con APIs reales.

**Próximo paso**: Obtener API keys y credentials para integrar procesadores de pago, email service y almacenamiento de archivos.
