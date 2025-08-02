# SGCApp

SGCApp es una aplicación web desarrollada en Angular 16 para la gestión de clientes, usuarios y actividades administrativas. Utiliza Angular CLI y sigue una arquitectura modular, con autenticación, panel de control, gestión de clientes y perfil de usuario.

## Requisitos

- Node.js >= 16.x
- Angular CLI >= 16.x
- npm

## Instalación

1. Clona el repositorio:
   ```sh
   git clone <https://github.com/matiasmicchele09/SGC-App>
   cd SGC-App
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```

## Servidor de desarrollo

Ejecuta el servidor de desarrollo con:
```sh
ng serve
```
Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si modificas algún archivo fuente.

## Estructura principal del proyecto

- `src/app/auth/`: Módulo de autenticación (login, guards, servicios de usuario).
- `src/app/home/`: Módulo principal tras login (dashboard, clientes, perfil, sidebar).
- `src/app/shared/`: Componentes y servicios reutilizables (alertas, sidebar, utilidades).
- `src/app/utils/`: Funciones utilitarias.
- `src/environments/`: Configuración de entornos (dev/prod).

## Funcionalidades principales

- **Autenticación de usuarios** con guardas y manejo de sesión.
- **Gestión de clientes**: alta, baja, edición, filtrado y paginación local.
- **Dashboard**: KPIs, gráficos de clientes por ciudad y condición fiscal, últimos clientes.
- **Perfil de usuario**: edición de datos personales y de cuenta.
- **Alertas**: confirmaciones y notificaciones con SweetAlert2.
- **Sidebar**: navegación principal y cierre de sesión con loader visual.

## Variables de entorno

Configura la URL base de la API en `src/environments/environments.ts` y `src/environments/environments.prod.ts`.

## Construcción

Para compilar la aplicación para producción:
```sh
ng build
```
Los archivos generados estarán en el directorio `dist/`.

## Pruebas unitarias

Ejecuta las pruebas unitarias con:
```sh
ng test
```

## Pruebas end-to-end

Para pruebas E2E, primero instala un framework compatible y luego ejecuta:
```sh
ng e2e
```

## Notas

- El backend debe estar disponible y configurado en la variable `baseUrl` del entorno correspondiente.
- El proyecto utiliza Bootstrap 5 y Bootstrap Icons para el diseño visual.

## Ayuda adicional

Consulta la [documentación de Angular CLI](https://angular.io/cli) para más comandos y opciones.
