# AlquiVentasCR

Plataforma inmobiliaria full stack estilo portal moderno para Costa Rica, enfocada en publicacion, exploracion y contacto de propiedades con mapa interactivo, filtros avanzados y busqueda geoespacial.

## Stack

- Backend: Node.js + Express + MongoDB + Mongoose
- Frontend: Next.js App Router + React + Tailwind CSS
- Auth: JWT
- Uploads: Cloudinary con fallback a placeholders cuando no hay credenciales
- Mapas: Mapbox
- Validacion: Zod
- Estado frontend: Zustand

## Por que Next.js

Se eligio Next.js sobre React + Vite porque encaja bien con un frontend de producto real, permite crecer hacia SSR o SEO mas adelante y mantiene una DX limpia en un monorepo separado del backend Express.

## Lo que incluye este MVP

- Registro, login, logout y perfil
- Estructura de recuperacion de contrasena con token temporal en desarrollo
- Roles: `user`, `agent`, `owner`, `admin`
- CRUD de propiedades
- Estados de propiedad: `draft`, `published`, `paused`, `sold`, `rented`
- Estado de mercado independiente: `available`, `reserved`, `sold`, `rented`, `inactive`
- Busqueda por texto, provincia, canton, distrito, coordenadas, radio, bounds y poligono
- Home geografica con selector visual de provincias
- Mapa interactivo con marcadores enriquecidos, preview expandido, geolocalizacion y dibujo de zona
- Favoritos
- Batalla comparativa entre 2 favoritos con analisis AI sanitizado
- Busquedas guardadas
- Leads recibidos y enviados
- Dashboard para agente/propietario
- Panel admin con metricas, usuarios, moderacion e inteligencia de mercado base
- Pestaña `Analisis Interactivo` con dashboards, proyecciones heuristicas y chat protegido
- Seed con propiedades de ejemplo de Costa Rica

## Lo que no incluye

- Hipotecas
- Preaprobaciones
- Pagos
- Aplicaciones transaccionales de renta
- Notificaciones reales por email o alertas automáticas

## Estructura

```text
/
  backend/
    src/
      config/
      constants/
      controllers/
      middlewares/
      models/
      routes/
      services/
      seeds/
      utils/
      validators/
  frontend/
    app/
    components/
    lib/
    store/
```

## Variables de entorno

### Backend

Copia `backend/.env.example` a `backend/.env`.

Variables principales:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`
- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Frontend

Copia `frontend/.env.example` a `frontend/.env.local`.

Variables principales:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_MAPBOX_STYLE`

## Instalacion

### 1. Instalar dependencias

Desde la raiz:

```bash
npm install
```

### 2. Configurar MongoDB

Usa una instancia local o Atlas y coloca la URL en `backend/.env`.

### 3. Configurar variables

- `backend/.env`
- `frontend/.env.local`

### 4. Cargar seed opcional

```bash
npm run seed
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Servicios esperados:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Healthcheck: `http://localhost:5000/api/health`

## Scripts

Desde la raiz:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run seed
npm run alerts:send
```

## Credenciales demo del seed

- Admin: `admin@casacr.com` / `Admin12345`
- Agente: `laura@casacr.com` / `Laura12345`
- Propietario: `diego@casacr.com` / `Diego12345`
- Usuario: `sofia@casacr.com` / `Sofia12345`

## Mapbox

Para habilitar el mapa interactivo:

1. Crea una cuenta en Mapbox.
2. Genera un access token.
3. Coloca el token en `frontend/.env.local` como `NEXT_PUBLIC_MAPBOX_TOKEN`.

Si no configuras Mapbox, la app sigue funcionando pero muestra paneles fallback donde iria el mapa.

## Cloudinary

Para uploads reales:

1. Crea una cuenta en Cloudinary.
2. Copia `cloud_name`, `api_key` y `api_secret`.
3. Colocalos en `backend/.env`.

Si no configuras Cloudinary, el backend devuelve URLs placeholder para mantener el flujo del MVP utilizable.

## DeepSeek

Para habilitar la comparacion AI y el chat de `Analisis Interactivo`:

1. Coloca tu key en `backend/.env` como `DEEPSEEK_API_KEY`.
2. Mantén `DEEPSEEK_BASE_URL=https://api.deepseek.com`.
3. Ajusta `DEEPSEEK_MODEL` si quieres cambiar de modelo.

La integracion se hace solo desde backend para no exponer la key al navegador. El contexto enviado al modelo excluye datos sensibles del propietario y solo comparte senales de inventario como precio, ubicacion general, cuartos, banos, area, score de mercado y distancias opcionales.

## Stripe Checkout

Para habilitar checkout real de planes:

1. Coloca `STRIPE_SECRET_KEY` en `backend/.env`.
2. Crea y escucha webhooks locales con Stripe CLI.
3. Usa `STRIPE_WEBHOOK_SECRET` con el valor que te entregue `stripe listen`.
4. El endpoint local del webhook es `http://localhost:5000/api/billing/webhook`.

La app ya incluye:

- Checkout Session para planes pagos
- Customer Portal para gestionar suscripcion
- Webhook para activar, actualizar o degradar el plan automaticamente

## Modelo geoespacial

El backend usa GeoJSON y `2dsphere` en propiedades:

- `location` como `Point`
- busqueda por `nearby`
- busqueda por `geoWithin`
- busqueda por `bounds`
- busqueda por `polygon`

## API principal

Rutas destacadas:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/properties`
- `GET /api/properties/featured`
- `GET /api/properties/slug/:slug`
- `POST /api/properties`
- `PATCH /api/properties/:propertyId`
- `GET /api/favorites`
- `POST /api/favorites/:propertyId`
- `GET /api/saved-searches`
- `POST /api/billing/checkout-session`
- `POST /api/billing/portal-session`
- `POST /api/billing/webhook`
- `POST /api/leads`
- `GET /api/leads/received`
- `GET /api/admin/metrics`
- `GET /api/admin/analytics/overview`
- `GET /api/admin/analytics/properties/:propertyId`
- `GET /api/analysis/overview`
- `POST /api/analysis/compare`
- `POST /api/analysis/chat`

## Notas de MVP

- La recuperacion de contrasena esta preparada a nivel de estructura y devuelve un token temporal en desarrollo. Falta conectar un proveedor de email.
- La aprobacion admin es simple: una propiedad publica solo entra a la exploracion publica si esta `published` e `isApproved`.
- El frontend esta listo para despliegue separado del backend.
- No se incluyeron tests automatizados en esta entrega.
- La carga real de video quedo preparada a nivel de schema/UI; para produccion falta conectar almacenamiento externo.
- La proximidad a hospital, escuela y colegio usa stubs controlados listos para reemplazar via `backend/src/services/proximityService.js`.
- El analisis interactivo usa regresion lineal simple sobre cierres historicos por zona/moneda y heuristicas de oportunidad. No es una tasacion oficial ni reemplaza criterio profesional.

## Siguientes mejoras recomendadas

- Alertas reales por email o WhatsApp para busquedas guardadas
- Normalizacion de catalogos de provincias, cantones y distritos desde fuente oficial
- Analytics de busqueda y conversion de leads
- Paginacion infinita o virtualizacion del listado
- Mejoras SEO y metadata por propiedad
