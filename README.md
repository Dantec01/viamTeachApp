# viamTeachApp

**viamTeachApp** es una Progressive Web App (PWA) educativa diseñada específicamente para asistir a profesores que utilizan el **Método Montessori**. La aplicación facilita el seguimiento holístico del desarrollo del estudiante basado en las dimensiones: *Ser, Saber, Hacer y Decidir*.

## Características Principales

- **Gestión de Alumnos**: Visualización rápida de estudiantes. Soporte planificado para escaneo de listas de asistencia mediante OCR.
- **Observaciones In-Situ (CaptureArea)**: Grabación de voz en vivo durante las clases para capturar observaciones de forma natural sin interrumpir la enseñanza.
- **Análisis con IA Local**: Las observaciones de voz son transcritas (Speech-to-Text) y analizadas mediante Inteligencia Artificial local (modelos NLP) para evaluar automáticamente en qué áreas del desarrollo Montessori impactan, sin depender de internet.
- **Informes Holísticos Avanzados**: Visualización del progreso mediante gráficos de radar (Recharts) y recomendaciones cualitativas impulsadas por IA.

## Tecnologías Utilizadas

Esta aplicación sigue una arquitectura moderna dividida en Frontend y Backend de IA:

### Frontend (PWA / Web Mobile-First)
- **Framework**: React 18 con TypeScript y Vite.
- **UI & Estilos**: Tailwind CSS, componentes de Shadcn UI (basado en Radix UI), y Framer Motion para transiciones fluidas.
- **Gráficos**: Recharts.

### Backend IA (En Desarrollo - `ai-backend`)
- **Framework**: Python con FastAPI para máxima velocidad.
- **Transcripción de Audio**: OpenAI Whisper (Ejecución 100% Local).
- **Análisis de Texto y Recomendaciones**: Ollama (Ejecución 100% Local con modelos locales).

## Estructura del Proyecto

```
viamTeachApp/
├── src/                # Código fuente del Frontend (React + Vite)
│   ├── components/     # Componentes visuales y de UI
│   ├── pages/          # Vistas principales (Ej. Index)
│   └── ...
├── ai-backend/         # (Nuevo) Microservicio de Inteligencia Artificial en Python
└── README.md
```

## Ejecución en Desarrollo (Frontend)

Para correr la interfaz de usuario de React:

```sh
# Instalar dependencias
npm install

# Correr servidor de desarrollo
npm run dev
```
