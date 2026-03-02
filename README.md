# Guia App 🍎

**Guia App** es una plataforma educativa de vanguardia diseñada para docentes que aplican el **Método Montessori**. Permite un seguimiento holístico y digital del desarrollo del estudiante en las dimensiones fundamentales: *Ser, Saber, Hacer y Decidir*.

## ✨ Características Principales

- **🎯 Gestión de Alumnos**: Administración de estudiantes y cursos con una interfaz intuitiva y rápida.
- **🎙️ Observaciones In-Situ (CaptureArea)**: Grabación de voz en tiempo real para capturar momentos pedagógicos sin interrumpir el flujo de la clase.
- **🤖 Inteligencia Artificial (Gemini 1.5 Flash)**: 
    - **Speech-to-Text**: Transcripción automática de observaciones de voz.
    - **Análisis de Sentimiento**: Clasificación automática (Positivo, Neutral, Negativo) de la interacción docente-alumno.
    - **Etiquetado Inteligente**: Generación de tags basados en el desarrollo Montessori (ej. "Autonomía", "Social", "Lógica").
    - **OCR Vision**: Extracción de datos desde fotos de registros físicos de asistencia.
- **📊 Dashboards Analíticos**: Visualización de progreso mediante gráficos dinámicos para una evaluación cualitativa precisa.

## 🛠️ Stack Tecnológico

### Frontend (Mobile-First / PWA)
- **Framework**: `React 18` + `TypeScript` + `Vite`.
- **UI/UX**: `Tailwind CSS` + `Shadcn UI`.
- **Animaciones**: `Framer Motion` para una experiencia fluida y premium.
- **Gestión de Estado**: `TanStack React Query` para sincronización eficiente de datos.
- **Gráficos**: `Recharts`.
- **Captura de Voz**: `react-speech-recognition` para procesamiento en cliente.

### Backend (Node.js API)
- **Entorno**: `Node.js` + `Express` + `TypeScript`.
- **Base de Datos**: `SQLite` gestionado mediante `Prisma ORM`.
- **Seguridad**: `JWT` (JSON Web Tokens) + `bcrypt` para encriptado de credenciales.
- **IA SDK**: `@google/generative-ai` (Integración directa con Google AI Studio).
- **Manejo de Media**: `Multer` para la gestión de archivos de audio subidos.

## 📂 Estructura del Proyecto

```text
viamTeachApp/
├── backend/            # Microservicio API (Node.js + Express)
│   ├── prisma/         # Esquema de BD y migraciones
│   ├── src/            # Controladores, Rutas y Servicios de IA
│   └── uploads/        # Almacenamiento temporal de audios
├── src/                # Frontend (React + Vite)
│   ├── components/     # Componentes de UI (UI atomics, CaptureArea, etc.)
│   ├── pages/          # Vistas principales (Index.tsx, Profile)
│   ├── hooks/          # Lógica personalizada y queries
│   └── lib/            # Configuraciones (utils, API base)
└── README.md
```

## 🚀 Guía de Instalación y Ejecución

El proyecto requiere la ejecución simultánea de ambos servicios.

### 1. Configuración del Backend

Dirígete a la carpeta `backend` y crea un archivo `.env`:
```env
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="genera_una_clave_aleatoria_y_segura"
GEMINI_API_KEY="TU_API_KEY_DE_GOOGLE_AI_STUDIO"
```

Instalación y arranque:
```sh
cd backend
npm install
npx prisma db push  # Sincroniza el esquema con la base de datos local
npm run dev
```

### 2. Configuración del Frontend

En la raíz del proyecto:
```sh
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

## 📄 Licencia y Derechos de Autor (Copyright)

Este proyecto, su arquitectura y todo su código fuente son propiedad exclusiva del equipo **VIAM** (© 2026). 

**Todos los derechos reservados.** Este repositorio NO es de código abierto (Open Source) para uso comercial. Queda estrictamente prohibida la copia, distribución, modificación, sublicencia o monetización de esta aplicación, su idea o su código sin el consentimiento explícito y por escrito de los autores.

Para más detalles legales, por favor consulta el archivo LICENSE en la raíz de este repositorio.

🤝 **¿Interesado en el proyecto?** Si representas a una institución educativa, eres un inversor, o deseas proponer una alianza comercial oficial, nos encantaría hablar contigo. Contáctanos en: **danmeroja@gmail.com**.
