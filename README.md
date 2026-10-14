# Bizorbis - Plataforma de Prospección B2B e Inteligencia Comercial 🎯

Plataforma integral de prospección geográfica, auditoría de presencia digital y gestión de clientes potenciales (CRM) para agencias de desarrollo de software y servicios tecnológicos.

---

## 🚀 Características Principales

- **Radar Geográfico de Clientes:** Búsqueda en tiempo real por ciudad y rubro (OpenStreetMap / Google Maps Places).
- **Auditoría Digital Automática:** Detección de presencia web, redes sociales, teléfono verificado y cálculo de score comercial (0-100).
- **Generador de Propuestas con IA:** Redacción automática de mensajes para WhatsApp y correo adaptados a las debilidades digitales detectadas en cada negocio.
- **CRM Comercial & Pipeline de Ventas:** Tablero Kanban interactivo con drag & drop y vista de tabla con seguimiento por fechas.
- **Exportación Masiva:** Exportación directa a Microsoft Excel (.xlsx) y CSV.
- **100% Responsivo:** Adaptado tanto para computadoras de escritorio como para celulares con barra de navegación móvil nativa.

---

## 🛠️ Stack Tecnológico

- **Framework Fullstack:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript / React 18
- **Estilos:** Tailwind CSS
- **Base de Datos:** MySQL
- **ORM:** Prisma
- **Mapas:** Leaflet / React Leaflet

---

## 📦 Instalación y Despliegue Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Percy1606/MapsBizorbis.git
   cd MapsBizorbis
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Configura la conexión a tu base de datos MySQL en `DATABASE_URL`.

4. **Sincronizar base de datos con Prisma:**
   ```bash
   npm run db:push
   ```

5. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Despliegue en Producción (Servidor VPS / Linux)

1. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

2. **Iniciar con PM2 en segundo plano:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

---

## 🔒 Licencia y Autoría

Desarrollado para prospección comercial inteligente y captación de clientes B2B.
