# Casa CR

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
- Busqueda por texto, provincia, canton, distrito, coordenadas, radio, bounds y poligono
- Mapa interactivo con pines, geolocalizacion y dibujo de zona
- Favoritos
- Busquedas guardadas
- Leads recibidos y enviados
- Dashboard para agente/propietario
- Panel admin con metricas, usuarios y moderacion
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
- `POST /api/leads`
- `GET /api/leads/received`
- `GET /api/admin/metrics`

## Notas de MVP

- La recuperacion de contrasena esta preparada a nivel de estructura y devuelve un token temporal en desarrollo. Falta conectar un proveedor de email.
- La aprobacion admin es simple: una propiedad publica solo entra a la exploracion publica si esta `published` e `isApproved`.
- El frontend esta listo para despliegue separado del backend.
- No se incluyeron tests automatizados en esta entrega.

## Siguientes mejoras recomendadas

- Alertas reales por email o WhatsApp para busquedas guardadas
- Normalizacion de catalogos de provincias, cantones y distritos desde fuente oficial
- Analytics de busqueda y conversion de leads
- Paginacion infinita o virtualizacion del listado
- Mejoras SEO y metadata por propiedad
