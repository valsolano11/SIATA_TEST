# Auth System SPA

## Descripción del Proyecto
**Auth System** es una **Single Page Application (SPA)** desarrollada con **React y Next.js**, que incluye un sistema de autenticación simulado, persistencia de datos y operaciones CRUD sobre estaciones.  

El proyecto está diseñado con un **estilo moderno, intuitivo y compacto**, enfocado en:

- Interfaz **responsive** que se adapta a cualquier tamaño de pantalla.
- Experiencia de usuario (**UX**) clara y fácil de usar.
- Visualización de datos mediante **tablas** y un **dashboard** funcional.
- Componentes **reutilizables** para mantener consistencia y escalabilidad.
- Navegación rápida sin recargar la página (SPA).

El **dashboard** y la **tabla de estaciones** permiten una gestión clara y organizada de la información.

---

## Tecnologías y Dependencias

**Dependencias principales:**
- React 19.1.0
- Next.js 15.4.7
- Lucide React (iconos) 0.540.0

**Dependencias de desarrollo:**
- TypeScript 5
- Tailwind CSS 4
- ESLint 9 y configuración de Next.js
- Tipos para Node y React

## Instalación y Ejecución Paso a Paso
Sigue estos pasos para tener el proyecto corriendo en tu entorno local:

1. Clonar el repositorio
git clone https://github.com/valsolano11/SIATA_TEST.git

2. Entrar al directorio del proyecto
cd auth-system

3. Instalar las dependencias
npm install

4. Ejecutar el proyecto en modo desarrollo
npm run dev
La aplicación estará disponible en http://localhost:3000

5. Construir para producción (opcional)
npm run build
npm start
Esto compilará la aplicación y la dejará lista para ejecutarse en un entorno de producción.

## Decisiones de Diseño
- SPA con React y Next.js: Navegación rápida y fluida sin recargar la página.
- Context API: Manejo simple de estado global y autenticación.
- Tailwind CSS: Diseño moderno, responsivo y fácil de mantener.
- Dashboard y tablas: Mejora la visualización de datos de estaciones y usuarios.
- Componentes reutilizables: Formularios, alertas y modales mantienen consistencia y escalabilidad.
- Responsive y UX optimizado: La interfaz se adapta a cualquier dispositivo y prioriza la experiencia del usuario.
- Control de Versiones

## El proyecto se gestiona mediante Git, con un historial de commits claro y descriptivo:

chore: configuraciones y archivos base.
feat: nuevas funcionalidades y componentes.
style: cambios de diseño y estilos.
fix: correcciones de errores.
## Despliegue
https://siata.netlify.app/
https://siata-test.onrender.com/

## Proyecto desarrollado por Valentina Solano Cárdenas, enfocado en prácticas de React, Next.js, desarrollo moderno de SPA, experiencia de usuario, diseño responsivo y buenas prácticas de control de versiones.

**Archivo `package.json`:**
```json
{
  "name": "auth-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "lucide-react": "^0.540.0",
    "next": "15.4.7",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.4.7",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}


