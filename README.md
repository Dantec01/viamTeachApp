# Guia App

**Guia App** es una App educativa diseñada específicamente para asistir a profesores que utilizan el **Método Montessori**. La aplicación facilita el seguimiento holístico del desarrollo del estudiante basado en las dimensiones: *Ser, Saber, Hacer y Decidir*.

## Características Principales

- **Gestión de Alumnos**: Visualización rápida de estudiantes de cada curso. Soporte planificado para escaneo de listas de asistencia mediante OCR.
- **Observaciones In-Situ (CaptureArea)**: Grabación de voz en vivo durante las clases para capturar observaciones de forma natural sin interrumpir la enseñanza.
- **Análisis con IA (Gemini)**: Las observaciones de voz son transcritas (Speech-to-Text) y analizadas mediante la Inteligencia Artificial de Google (Gemini 1.5 Flash) para extraer un análisis de sentimiento (Positivo, Neutral, Negativo) y generar etiquetas automáticas sobre las áreas del desarrollo Montessori que impactan.
- **Informes Holísticos Avanzados**: Visualización del progreso mediante gráficos y reportes estructurados para el seguimiento de cada alumno.

## Tecnologías Utilizadas

Esta aplicación sigue una arquitectura moderna dividida en Frontend y Backend:

### Frontend (PWA / Web Mobile-First)
- **Framework**: React 18 con TypeScript y Vite.
- **UI & Estilos**: Tailwind CSS, componentes de Shadcn UI (basado en Radix UI), y Framer Motion para transiciones fluidas e interactivas.
- **Gráficos**: Recharts.

### Backend (Node.js API)
- **Framework**: Node.js con Express y TypeScript.
- **Base de Datos**: SQLite con **Prisma ORM** para una gestión ágil de los datos.
- **Autenticación**: JSON Web Tokens (JWT) y encriptación de contraseñas con bcrypt.
- **Inteligencia Artificial (IA)**: Google Generative AI (`@google/generative-ai`) para el modelo Gemini 1.5 Flash, encargado de la transcripción de audios, análisis de sentimientos, descubrimiento de etiquetas y OCR en imágenes.

## Estructura del Proyecto

```text
viamTeachApp/
├── backend/            # Código fuente del Backend (Node.js + Express + Prisma)
│   ├── prisma/         # Esquema de la base de datos (schema.prisma)
│   └── src/            # Controladores, Rutas, Servicios de IA
├── src/                # Código fuente del Frontend (React + Vite)
│   ├── components/     # Componentes visuales y de UI
│   ├── pages/          # Vistas principales (Ej. Index.tsx)
│   └── ...
└── README.md
```

## Ejecución en Desarrollo

El proyecto requiere ejecutar tanto el servidor Frontend como el Backend simultáneamente.

### 1. Backend (Node.js)

Asegúrate de configurar tus variables de entorno creando un archivo `.env` dentro de la carpeta `backend` con la siguiente información:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_secreto_super_seguro"
PORT=3001
GEMINI_API_KEY="tu_clave_de_api_de_google_gemini"
```

Luego, en una terminal:
```sh
cd backend
npm install
# Sincronizar la base de datos Prisma (Opcional si ya existe dev.db)
npx prisma db push
# Iniciar servidor en modo desarrollo
npm run dev
```

### 2. Frontend (React)

En otra terminal, corre la interfaz de usuario:

```sh
# Instalar dependencias en la raíz
npm install
# Correr servidor de desarrollo
npm run dev
```
