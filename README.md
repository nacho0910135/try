# BienesRaicesCR

Plataforma inmobiliaria full stack para Costa Rica, orientada a publicacion, exploracion geoespacial, leads, analisis interactivo y operacion comercial para propietarios, agentes y administradores.

## Stack

- Backend: Node.js + Express + MongoDB + Mongoose
- Frontend: Next.js App Router + React + Tailwind CSS
- Auth: JWT
- Mapas: Mapbox
- Uploads: Cloudinary o almacenamiento local del backend
- Validacion: Zod
- Estado frontend: Zustand

## Funcionalidades principales

- Registro, login, perfil y recuperacion de contrasena
- Publicacion y edicion de propiedades
- Exploracion geoespacial con mapa y filtros avanzados
- Favoritos
- Busquedas guardadas
- Leads y ofertas
- Analisis interactivo y batalla comparativa
- Dashboard para propietarios/agentes
- Panel admin
- Rutas SEO por provincia, canton y distrito
- Alertas por email para nuevas coincidencias y bajadas de precio

## Lo que no incluye

- Hipotecas
- Preaprobaciones
- Aplicaciones transaccionales de renta
- Pagos productivos activados por defecto

## Estructura

```text
/
  backend/
    src/
      config/
      constants/
      controllers/
      jobs/
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
  ops/
  scripts/
```

## Variables de entorno

### Backend

Copia `backend/.env.example` a `backend/.env`.

Variables clave:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `TRUST_PROXY`
- `LOG_LEVEL`
- `MONITORING_WEBHOOK_URL`
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
- `ALERTS_AUTORUN`
- `ALERTS_INTERVAL_MINUTES`
- `BACKUP_DIR`
- `BACKUP_RETENTION_DAYS`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Frontend

Copia `frontend/.env.example` a `frontend/.env.local`.

Variables clave:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_MAPBOX_STYLE`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Instalacion

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables

- `backend/.env`
- `frontend/.env.local`

### 3. Configurar MongoDB

Usa una instancia local o Atlas y coloca la URL en `backend/.env`.

### 4. Seed opcional

```bash
npm run seed
```

### 5. Desarrollo local

```bash
npm run dev
```

Servicios esperados:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Frontend healthcheck: `http://localhost:3000/api/health`
- Backend healthcheck: `http://localhost:5000/api/health`
- Backend liveness: `http://localhost:5000/api/health/live`
- Backend readiness: `http://localhost:5000/api/health/ready`

## Scripts

Desde la raiz:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run seed
npm run seed:samples
npm run alerts:send
npm run backup:mongo
```

## Credenciales del seed local

- Admin: `admin@casacr.com` / `Admin12345`
- Agente: `laura@casacr.com` / `Laura12345`
- Propietario: `diego@casacr.com` / `Diego12345`
- Usuario: `sofia@casacr.com` / `Sofia12345`

No uses estas credenciales en produccion.

## Mapbox

1. Crea una cuenta en Mapbox.
2. Genera un token.
3. Colocalo en `frontend/.env.local` como `NEXT_PUBLIC_MAPBOX_TOKEN`.

## Cloudinary

1. Crea una cuenta en Cloudinary.
2. Copia `cloud_name`, `api_key` y `api_secret`.
3. Colocalos en `backend/.env`.

Si no configuras Cloudinary, el backend guarda imagenes en `backend/public/uploads`.

## DeepSeek

1. Coloca tu key en `backend/.env` como `DEEPSEEK_API_KEY`.
2. Mantén `DEEPSEEK_BASE_URL=https://api.deepseek.com`.
3. Ajusta `DEEPSEEK_MODEL` si quieres cambiar de modelo.

La integracion se hace desde backend para no exponer credenciales en el navegador.

## Legal y cookies

El frontend incluye paginas listas para produccion:

- `/legal/privacy`
- `/legal/terms`
- `/legal/cookies`
- `/contact`

Tambien incluye banner de consentimiento para cookies de analitica y un acceso permanente a preferencias desde el pie de pagina.

## Alertas automaticas

La app ya puede enviar alertas programadas de busquedas guardadas por:

- nuevas coincidencias
- bajadas de precio

Claves relevantes:

- `ALERTS_AUTORUN=true`
- `ALERTS_INTERVAL_MINUTES=60`

Para entrega real de correos debes configurar SMTP.

## Analitica de producto

La app ya puede medir eventos clave del producto con GA4, PostHog o ambos, siempre que exista consentimiento:

- page views
- property views
- favoritos agregados o retirados
- leads enviados
- ofertas enviadas
- publicaciones creadas o actualizadas

Configura en `frontend/.env.local`:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Infraestructura de produccion

El repo incluye base operativa para despliegue real:

- `ecosystem.config.cjs` para PM2
- `ops/Caddyfile` para reverse proxy y HTTPS automatico con Caddy
- `scripts/mongo-backup.mjs` para respaldos de Mongo usando `mongodump`

### Despliegue recomendado

1. Configura el frontend en `www.bienesraicescr.com`.
2. Configura el backend en `api.bienesraicescr.com`.
3. Ajusta `FRONTEND_URL` con tus dominios reales.
4. Activa `TRUST_PROXY=true` si la API va detras de un proxy.
5. Levanta ambos procesos con `pm2 start ecosystem.config.cjs`.

### Backups

Para backup manual:

```bash
npm run backup:mongo
```

Requiere `mongodump` instalado en el servidor.

## Monitoreo y observabilidad

La app ya incluye:

- health endpoints de frontend y backend
- readiness real de MongoDB
- request IDs en cada respuesta
- logs JSON estructurados listos para centralizar
- captura de errores del frontend hacia la API
- envio opcional de incidentes a `MONITORING_WEBHOOK_URL`

Para uptime checks y alertas de caida, apunta un servicio externo como Better Stack o UptimeRobot a:

- `https://www.bienesraicescr.com/api/health`
- `https://api.bienesraicescr.com/api/health/ready`

## Seguridad

La app ya incluye:

- `helmet`
- sanitizacion Mongo
- CORS por origen permitido
- rate limits generales y especificos para auth, leads, busquedas, uploads y analisis
- validacion mas estricta de `JWT_SECRET` en produccion
- advertencia si el secreto sigue debil en desarrollo

Antes de lanzar:

1. Rota `JWT_SECRET`, `DEEPSEEK_API_KEY`, `Mapbox`, `SMTP`, `Cloudinary` y cualquier otra credencial usada en desarrollo.
2. No cargues seeds de desarrollo en produccion.
3. Verifica que `FRONTEND_URL` solo contenga dominios finales.
4. Revisa que `MONITORING_WEBHOOK_URL` apunte a tu canal real de incidentes.
5. Programa backups de Mongo y monitorea que terminen correctamente.

## Checkout y pagos

La base de checkout ya existe, pero la pasarela final debe configurarse antes de usarla en produccion.

## API principal

Rutas destacadas:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/auth/me`
- `GET /api/properties`
- `GET /api/properties/featured`
- `GET /api/properties/slug/:slug`
- `GET /api/properties/seo/zone`
- `POST /api/properties`
- `PATCH /api/properties/:propertyId`
- `GET /api/favorites`
- `POST /api/favorites/:propertyId`
- `GET /api/saved-searches`
- `POST /api/saved-searches/:searchId/send-alert`
- `POST /api/leads`
- `GET /api/leads/received`
- `GET /api/analysis/overview`
- `POST /api/analysis/compare`
- `POST /api/analysis/chat`
- `POST /api/monitoring/frontend-error`
- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`

## Notas operativas

- La recuperacion de contrasena requiere SMTP para enviar el enlace.
- Una propiedad solo entra al catalogo publico si esta `published`, aprobada y en un estado de mercado visible.
- Los videos se agregan por URL desde el formulario.
- El analisis interactivo usa heuristicas y no reemplaza criterio profesional.

## Validacion recomendada antes del lanzamiento

- Probar registro, login y reset password
- Probar publicar, editar y aprobar propiedades
- Probar favoritos, leads, ofertas y alertas
- Probar mapa y filtros en movil
- Probar `npm run build --workspace frontend`
- Probar healthchecks y backup real en el servidor
