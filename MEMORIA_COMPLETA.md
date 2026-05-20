# SMARTBOOKING — Memoria del Proyecto Final de Ciclo

**Autor:** Daniel Aguado  
**Ciclo Formativo:** Desarrollo de Aplicaciones Web (DAW)  
**Centro:** Florida Centre de Formació Coop. V.  
**Fecha:** Mayo 2026  

---

## Índice

1. [Introducción](#1-introducción)
2. [Objetivos del proyecto](#2-objetivos-del-proyecto)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura del sistema](#4-arquitectura-del-sistema)
5. [Modelo de datos](#5-modelo-de-datos)
6. [API REST](#6-api-rest)
7. [Frontend Angular (SPA)](#7-frontend-angular-spa)
8. [Funcionalidades implementadas](#8-funcionalidades-implementadas)
9. [Seguridad y autenticación](#9-seguridad-y-autenticación)
10. [Interfaz de usuario](#10-interfaz-de-usuario)
11. [Despliegue con Docker](#11-despliegue-con-docker)
12. [Conclusiones](#12-conclusiones)

---

## 1. Introducción

**SmartBooking** es una aplicación web completa para la gestión de reservas de recursos (salas de reuniones, espacios de coworking, equipos, etc.). El proyecto permite a empresas y particulares consultar la disponibilidad de recursos, realizar reservas online y gestionar todo el ciclo de vida de dichas reservas, desde su creación hasta su confirmación o cancelación.

La aplicación está orientada a entornos empresariales donde múltiples usuarios, tanto personas físicas como empresas, necesitan reservar espacios o recursos compartidos de forma ordenada y sin conflictos de horario.

El sistema distingue tres tipos de usuarios:

- **Persona** (ROLE_PERSONA): usuario particular que hace reservas para uso propio.
- **Empresa** (ROLE_EMPRESA): organización que recibe reservas a su nombre y puede consultarlas.
- **Administrador** (ROLE_ADMIN): gestiona todos los recursos, categorías, reservas y usuarios del sistema.

El proyecto ha sido desarrollado íntegramente como Proyecto Final de Ciclo del Grado Superior de Desarrollo de Aplicaciones Web, aplicando los conocimientos adquiridos durante el ciclo formativo en una aplicación real y funcional.

---

## 2. Objetivos del proyecto

### Objetivo general

Desarrollar una aplicación web full-stack funcional para la gestión de reservas de recursos, que sirva como demostración de las competencias adquiridas durante el ciclo formativo DAW.

### Objetivos específicos

1. **Implementar un backend robusto** con Symfony 7 y PHP 8.2 que exponga una API REST completa para todas las operaciones de negocio.

2. **Desarrollar un frontend moderno** como Single Page Application (SPA) con Angular 17, consumiendo la API REST del backend.

3. **Modelar correctamente la base de datos** con entidades bien definidas y relaciones entre ellas mediante Doctrine ORM.

4. **Gestionar la autenticación y autorización** con roles diferenciados (Persona, Empresa, Admin) y protección de rutas tanto en el backend como en el frontend.

5. **Garantizar la integridad de los datos** evitando conflictos de reserva mediante validaciones en el servidor.

6. **Ofrecer una experiencia de usuario (UX) moderna** con diseño responsive, dark mode, y retroalimentación visual inmediata.

7. **Contenedorizar la aplicación** con Docker Compose para facilitar su despliegue en cualquier entorno.

8. **Aplicar buenas prácticas de desarrollo**: separación de responsabilidades, validación de datos, mensajes de error claros, y código mantenible.

---

## 3. Stack tecnológico

### Backend

| Tecnología | Versión | Justificación |
|---|---|---|
| PHP | 8.2 | Versión estable LTS con mejoras de rendimiento y tipado estricto |
| Symfony | 7.x | Framework PHP maduro, con inyección de dependencias, seguridad y ORM integrados |
| Doctrine ORM | 3.x | Mapeo objeto-relacional robusto, migraciones y repositorios personalizados |
| Doctrine Migrations | 3.3 | Control de versiones del esquema de base de datos |
| MySQL | 8.0 | SGBD relacional ampliamente utilizado, compatible con el entorno de producción |
| Symfony Security | 7.x | Gestión de sesiones, roles y hashing de contraseñas (bcrypt) |
| Symfony Validator | 7.x | Validación declarativa de entidades con anotaciones/atributos PHP 8 |
| Twig | 3.x | Motor de plantillas para el punto de entrada HTML de la SPA |

### Frontend

| Tecnología | Versión | Justificación |
|---|---|---|
| Angular | 17.x | Framework SPA completo con inyección de dependencias, routing, formularios reactivos y HttpClient |
| TypeScript | 5.2 | Tipado estático que mejora la mantenibilidad y detecta errores en tiempo de compilación |
| RxJS | 7.8 | Programación reactiva para gestión de peticiones HTTP asíncronas y eventos |
| Bootstrap | 5.3 | Framework CSS responsive con componentes listos para producción |
| FullCalendar | — | Integración de calendario visual (vistas mes/semana/día/lista) |
| Google Fonts (Inter) | — | Tipografía moderna, limpia y legible para la UI |

### Infraestructura y herramientas

| Herramienta | Versión | Uso |
|---|---|---|
| Docker | 20+ | Contenedorización de todos los servicios |
| Docker Compose | 3.8 | Orquestación multi-contenedor |
| Node.js | 20-alpine | Compilación del bundle Angular |
| phpMyAdmin | 5.2 | Administración visual de la base de datos en desarrollo |
| Symfony Maker Bundle | 1.x | Generación de código (entidades, controladores, migraciones) |
| Symfony Web Profiler | 7.x | Depuración en entorno de desarrollo |

---

## 4. Arquitectura del sistema

### Arquitectura híbrida: API REST + SPA Angular

SmartBooking utiliza una arquitectura en dos capas completamente desacopladas:

```
┌─────────────────────────────────────────────────────────┐
│                      NAVEGADOR                          │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │          Angular SPA (Puerto :4200 / :8080)     │   │
│   │                                                 │   │
│   │  LoginComponent       DashboardComponent        │   │
│   │  RegisterComponent    BookingsListComponent     │   │
│   │  BookingFormComponent BookingDetailComponent    │   │
│   │  ResourcesListComponent CategoriesListComponent │   │
│   │  EmpresasComponent    PerfilComponent           │   │
│   │  MiEmpresaComponent   NavbarComponent           │   │
│   │  CalendarComponent                              │   │
│   │                                                 │   │
│   │  Servicios: AuthService, BookingService,        │   │
│   │             ResourceService, CategoryService,   │   │
│   │             UserService, ApiService             │   │
│   │                                                 │   │
│   │  Guards: AuthGuard (protección de rutas)        │   │
│   └────────────────┬────────────────────────────────┘   │
│                    │ HTTP / JSON (CORS)                  │
└────────────────────┼────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              BACKEND SYMFONY (Puerto :8080)              │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  API REST                        │   │
│  │                                                  │   │
│  │  ApiAuthController   ApiBookingController        │   │
│  │  ApiDashboardController ApiResourceController    │   │
│  │  ApiCategoryController UserController            │   │
│  │  SpaController (entrypoint HTML)                 │   │
│  └────────────────┬─────────────────────────────────┘   │
│                   │ Doctrine ORM                         │
│  ┌────────────────▼─────────────────────────────────┐   │
│  │             Modelo de Datos                      │   │
│  │                                                  │   │
│  │  User  ──────►  Booking  ◄──────  Resource       │   │
│  │                             │                    │   │
│  │                             └─────►  Category    │   │
│  └────────────────┬─────────────────────────────────┘   │
└───────────────────┼─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│               MySQL 8.0 (Puerto :3307)                   │
│         Base de datos: smartbooking                      │
└─────────────────────────────────────────────────────────┘
```

### Flujo de una petición típica

1. El usuario interactúa con la SPA Angular en el navegador.
2. Angular llama a un **servicio** (e.g., `BookingService.create()`).
3. El servicio ejecuta una petición **HTTP/JSON** a la API REST de Symfony (`POST /api/bookings`).
4. El controlador de Symfony valida la sesión (AuthGuard en Symfony Security), valida los datos y ejecuta la lógica de negocio.
5. Doctrine ORM persiste o consulta los datos en MySQL.
6. La API devuelve un **JSON** al Angular.
7. Angular actualiza la interfaz con los nuevos datos.

### Modo de arranque (SPA dentro de Symfony)

Symfony sirve el `index.html` de Angular en todas las rutas bajo `/app/*` mediante el `SpaController`. El bundle compilado de Angular se coloca en `public/app/` y es servido como contenido estático. Esto simplifica el despliegue al tener un único dominio y puerto para toda la aplicación.

---

## 5. Modelo de datos

El modelo de datos consta de cuatro entidades principales con las siguientes relaciones:

```
User (1) ──────────── (N) Booking (N) ──────────── (1) Resource (N) ──────────── (1) Category
```

### Entidad: User

Representa tanto a personas físicas como a empresas registradas en el sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int (PK, autoincrementado) | Identificador único |
| `email` | varchar(180), único | Credencial de acceso |
| `password` | varchar | Contraseña hasheada (bcrypt) |
| `roles` | json | Array de roles: ROLE_USER, ROLE_PERSONA, ROLE_EMPRESA, ROLE_ADMIN |
| `userType` | varchar(10) | `'persona'` o `'empresa'` |
| `nombre` | varchar(100), nullable | Nombre (solo Persona) |
| `apellidos` | varchar(150), nullable | Apellidos (solo Persona) |
| `dni` | varchar(20), nullable | DNI con formato 8 dígitos + letra (solo Persona) |
| `telefono` | varchar(20), nullable | Teléfono personal (solo Persona) |
| `nombreEmpresa` | varchar(150), nullable | Razón social (solo Empresa) |
| `cif` | varchar(20), nullable | CIF fiscal (solo Empresa) |
| `sector` | varchar(100), nullable | Sector de actividad (solo Empresa) |
| `telefonoEmpresa` | varchar(20), nullable | Teléfono empresa (solo Empresa) |
| `createdAt` | datetime | Fecha de registro (auto via PrePersist) |
| `isActive` | boolean | Activación de cuenta (admin puede desactivar) |

**Validaciones especiales:**
- El DNI debe coincidir con el patrón `/^\d{8}[A-Za-z]$/`
- La contraseña mínimo 8 caracteres
- El email debe ser único en el sistema
- Validación condicional: campos de Persona solo son obligatorios si `userType = 'persona'`, y viceversa para Empresa

### Entidad: Resource

Representa los recursos reservables del sistema (salas, equipos, espacios, etc.).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int (PK) | Identificador único |
| `nombre` | varchar(150) | Nombre del recurso |
| `descripcion` | text, nullable | Descripción detallada |
| `capacidad` | int | Número máximo de personas |
| `ubicacion` | varchar(200), nullable | Localización física |
| `precioHora` | decimal(8,2) | Tarifa por hora en euros |
| `isActive` | boolean | Estado activo/inactivo |
| `category` | FK → Category (nullable) | Categoría a la que pertenece |

### Entidad: Category

Organiza los recursos en grupos lógicos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int (PK) | Identificador único |
| `nombre` | varchar(100) | Nombre de la categoría |
| `descripcion` | text, nullable | Descripción de la categoría |
| `color` | varchar(7), nullable | Color hexadecimal para representación visual |

### Entidad: Booking

Representa una reserva realizada por un usuario sobre un recurso.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int (PK) | Identificador único |
| `user` | FK → User | Usuario que creó la reserva |
| `resource` | FK → Resource | Recurso reservado |
| `fechaInicio` | datetime | Inicio de la reserva |
| `fechaFin` | datetime | Fin de la reserva |
| `asistentes` | int | Número de asistentes (mínimo 1) |
| `motivo` | text, nullable | Descripción o motivo de la reserva |
| `clienteNombre` | varchar(200), nullable | Nombre de la empresa cliente |
| `estado` | varchar(20) | `pendiente`, `confirmada` o `cancelada` |
| `precioTotal` | decimal(10,2), nullable | Calculado automáticamente al persistir/actualizar |
| `createdAt` | datetime | Fecha de creación (auto) |

**Lógica de negocio integrada:**
- El `precioTotal` se calcula automáticamente en los eventos `@PrePersist` y `@PreUpdate`: `horas * precioHora`
- El estado inicial siempre es `pendiente` para usuarios no administradores
- Solo el administrador puede confirmar reservas

---

## 6. API REST

La API REST de SmartBooking expone **21 endpoints** agrupados por recurso. Todos devuelven JSON y requieren sesión autenticada (excepto `/api/login` y `/api/register`).

### Autenticación y perfil

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/login` | Autenticación con email y contraseña. Devuelve datos del usuario y establece sesión. | Público |
| `POST` | `/api/logout` | Cierre de sesión. Invalida la sesión activa. | Autenticado |
| `POST` | `/api/register` | Registro de nuevo usuario (Persona o Empresa). Validaciones completas. | Público |
| `GET` | `/api/me` | Devuelve los datos del usuario actualmente autenticado. | Autenticado |
| `PUT` | `/api/profile` | Actualiza datos del perfil, email y/o contraseña del usuario autenticado. | Autenticado |
| `GET` | `/api/check-email` | Comprueba si un email ya está registrado. Usado para validación async. | Público |

### Reservas (`/api/bookings`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/bookings` | Lista reservas. Admin: todas; Empresa: las suyas; Persona: las propias. Soporta filtros (estado, recurso, fechas). | Autenticado |
| `POST` | `/api/bookings` | Crea una nueva reserva. Detecta conflictos de horario antes de persistir. | Autenticado |
| `GET` | `/api/bookings/{id}` | Detalle de una reserva concreta. | Propietario o Admin |
| `PUT` | `/api/bookings/{id}` | Edita una reserva existente. Re-valida conflictos. | Propietario o Admin |
| `DELETE` | `/api/bookings/{id}` | Elimina una reserva. | Solo Admin |
| `POST` | `/api/bookings/{id}/confirmar` | Cambia el estado a `confirmada`. | Solo Admin |
| `POST` | `/api/bookings/{id}/cancelar` | Cambia el estado a `cancelada`. | Propietario o Admin |

### Recursos (`/api/resources`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/resources` | Lista todos los recursos activos. | Autenticado |
| `POST` | `/api/resources` | Crea un nuevo recurso. | Solo Admin |
| `GET` | `/api/resources/{id}` | Detalle de un recurso. | Autenticado |
| `PUT` | `/api/resources/{id}` | Actualiza un recurso. | Solo Admin |
| `DELETE` | `/api/resources/{id}` | Desactiva un recurso (borrado lógico). | Solo Admin |

### Categorías (`/api/categories`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/categories` | Lista todas las categorías. | Autenticado |
| `POST` | `/api/categories` | Crea una nueva categoría. | Solo Admin |
| `PUT` | `/api/categories/{id}` | Actualiza una categoría. | Solo Admin |
| `DELETE` | `/api/categories/{id}` | Elimina una categoría. | Solo Admin |

### Dashboard y usuarios

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/dashboard` | KPIs y estadísticas diferenciadas por rol (Admin / Empresa / Persona). | Autenticado |
| `GET` | `/users/search-empresas` | Búsqueda de empresas por nombre para el buscador en tiempo real. | Autenticado |

### Control de acceso en la API

La autorización se implementa a nivel de controlador con el atributo `#[IsGranted]` de Symfony Security:

- `ROLE_ADMIN`: acceso total a todas las operaciones.
- `ROLE_EMPRESA`: ve sus reservas (donde figura como `clienteNombre`), puede cancelar.
- `ROLE_PERSONA`: ve y gestiona sus propias reservas.
- Las reservas nuevas siempre empiezan en estado `pendiente` para usuarios no admin.

---

## 7. Frontend Angular (SPA)

### Estructura del proyecto

```
angular/src/app/
├── app.module.ts          # Módulo principal, rutas, bootstrap manual
├── app.component.ts       # Componente raíz con <router-outlet>
│
├── pages/                 # Vistas principales (rutas)
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── bookings/          # list, form, detail
│   ├── resources/
│   ├── categories/
│   ├── empresas/
│   ├── perfil/
│   └── mi-empresa/
│
├── components/            # Componentes reutilizables
│   ├── navbar/
│   ├── toast/
│   ├── form-validator/
│   ├── booking-filter/
│   └── resource-filter/
│
├── services/              # Capa de acceso a la API
│   ├── api.service.ts     # Servicio base con HttpClient
│   ├── auth.service.ts    # Login, logout, estado de sesión
│   ├── booking.service.ts
│   ├── resource.service.ts
│   ├── category.service.ts
│   └── user.service.ts
│
└── guards/
    └── auth.guard.ts      # Protección de rutas privadas
```

### Rutas definidas

| Ruta | Componente | Protegida |
|---|---|---|
| `/app/login` | LoginComponent | No |
| `/app/register` | RegisterComponent | No |
| `/app/dashboard` | DashboardComponent | Sí |
| `/app/bookings` | BookingsListComponent | Sí |
| `/app/bookings/new` | BookingFormComponent | Sí |
| `/app/bookings/:id` | BookingDetailComponent | Sí |
| `/app/bookings/:id/edit` | BookingFormComponent | Sí |
| `/app/resources` | ResourcesListComponent | Sí |
| `/app/categories` | CategoriesListComponent | Sí |
| `/app/empresas` | EmpresasComponent | Sí |
| `/app/mi-empresa` | MiEmpresaComponent | Sí |
| `/app/perfil` | PerfilComponent | Sí |

### Servicios Angular

**`AuthService`**
- Gestiona el estado de autenticación con un `BehaviorSubject<User | null>`
- Métodos: `login()`, `logout()`, `register()`, `getMe()`, `isLoggedIn()`, `currentUser$`
- Persiste el usuario en `sessionStorage` para sobrevivir a la recarga de página

**`BookingService`**
- Métodos CRUD: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- Acciones: `confirmar()`, `cancelar()`
- Soporta parámetros de filtro: estado, recurso, fechas

**`ResourceService`**
- Métodos CRUD completos para la gestión de recursos
- `getActive()` para obtener solo recursos disponibles en formularios

**`CategoryService`**
- Métodos CRUD para la gestión de categorías
- Usado en formularios de recursos y filtros

**`UserService`**
- `searchEmpresas(query)`: búsqueda de empresas en tiempo real
- `updateProfile()`: actualización de datos de perfil

**`ApiService`** (base)
- Centraliza la URL base de la API
- Gestión de headers y manejo de errores HTTP

### AuthGuard

El `AuthGuard` protege todas las rutas que requieren autenticación. Implementa `CanActivate`:

1. Comprueba si hay usuario autenticado en el `AuthService`
2. Si no hay sesión, llama a `GET /api/me` para verificar si existe sesión en el servidor
3. Si no hay sesión válida, redirige a `/app/login`
4. Si la sesión es válida, permite el acceso

### Arquitectura híbrida: SPA + Web Components

Una característica especial del proyecto es que el módulo Angular realiza un arranque dual mediante `ngDoBootstrap()`:

1. **SPA completa**: arranca el `AppComponent` como Single Page Application con router.
2. **Web Components**: registra cuatro componentes Angular como Custom Elements (`<app-booking-filter>`, `<app-resource-filter>`, `<app-form-validator>`, `<app-toast>`) que pueden usarse en plantillas Twig de Symfony de forma aislada.

---

## 8. Funcionalidades implementadas

### 8.1 Registro y autenticación

**Registro diferenciado (RegisterComponent)**

El formulario de registro ofrece dos modos de registro mediante un selector visual:

- **Persona física**: solicita nombre, apellidos, DNI (formato validado: 8 dígitos + letra), teléfono opcional, email y contraseña.
- **Empresa**: solicita nombre de empresa, CIF, sector, teléfono empresa, email y contraseña.

Características del formulario:
- Formulario reactivo de Angular (`ReactiveFormsModule`)
- Validación asíncrona del email: comprueba en tiempo real contra `/api/check-email` si el email ya está registrado
- Indicador visual de fuerza de contraseña (débil / media / fuerte)
- Mensajes de error específicos por campo
- Diseño split-screen con imagen corporativa a la izquierda

**Inicio de sesión (LoginComponent)**

- Formulario reactivo con validación de campos
- Diseño split-screen coherente con el registro
- Mensaje de error claro si las credenciales son incorrectas
- Redirige al dashboard tras el login exitoso

### 8.2 Dashboard

El `DashboardComponent` muestra KPIs diferentes según el rol del usuario:

**Admin:**
- Total de reservas del sistema
- Reservas confirmadas / pendientes / canceladas
- Total de recursos activos
- Total de usuarios registrados
- Próximas reservas (5 más próximas de todo el sistema)

**Empresa:**
- Total de reservas recibidas a nombre de la empresa
- Reservas confirmadas / pendientes / canceladas
- Últimas reservas recibidas (5 más recientes)
- Datos de la empresa: nombre, CIF, sector, teléfono

**Persona:**
- Total de mis reservas
- Mis reservas confirmadas / pendientes / canceladas
- Mis próximas reservas (5 más próximas)

### 8.3 Gestión de reservas

**Lista de reservas (BookingsListComponent)**

- Tabla con todas las reservas accesibles según el rol
- Columnas: ID, Recurso, Fecha inicio, Fecha fin, Duración, Asistentes, Estado, Precio, Acciones
- Filtros: por estado (pendiente/confirmada/cancelada), por recurso, por rango de fechas
- Botones de acción por fila:
  - **Ver detalle**: navega a BookingDetailComponent
  - **Editar**: navega a BookingFormComponent en modo edición
  - **Confirmar**: disponible solo para Admin, cambia estado a `confirmada`
  - **Cancelar**: disponible para propietario y Admin
  - **Eliminar**: disponible solo para Admin
- Badges de colores para los estados: ámbar (pendiente), verde (confirmada), rojo (cancelada)

**Formulario de reserva (BookingFormComponent)**

Utilizado tanto para crear nuevas reservas como para editar existentes:

- Selector de recurso con información de capacidad y precio/hora
- Selectores de fecha y hora de inicio y fin
- Campo de número de asistentes con validación mínimo 1
- Campo de motivo (texto libre)
- Campo de nombre de empresa cliente (`clienteNombre`): si el usuario es de tipo Empresa, se rellena automáticamente con su nombre
- **Detección de conflictos en tiempo real**: al seleccionar recurso y fechas, comprueba contra la API si existe solapamiento con reservas confirmadas o pendientes
- Cálculo automático del precio estimado (duración × precio/hora del recurso)
- Modo creación vs. modo edición: carga los datos existentes en edición

**Detalle de reserva (BookingDetailComponent)**

- Muestra todos los campos de la reserva
- Duración calculada en horas y minutos
- Precio total destacado
- Información completa del recurso (nombre, ubicación, categoría, capacidad)
- Información del usuario que la creó
- Botones de acción según estado y permisos

### 8.4 Gestión de recursos (solo Admin)

**Lista de recursos (ResourcesListComponent)**

- Tarjetas (cards) para cada recurso con imagen representativa
- Datos visibles: nombre, categoría, capacidad, ubicación, precio/hora, estado
- Edición inline directamente en la tarjeta (solo Admin): campos editables sin necesidad de navegar a otra página
- Botón de activar/desactivar recurso (borrado lógico)
- Formulario de nuevo recurso integrado en la vista

### 8.5 Gestión de categorías (solo Admin)

**Lista de categorías (CategoriesListComponent)**

- Grid de tarjetas con color visual por categoría
- Formulario inline para crear/editar categorías
- Selector de color hexadecimal con previsualización
- Eliminación con confirmación

### 8.6 Directorio de empresas

**EmpresasComponent**

- Búsqueda de empresas registradas en tiempo real mientras se escribe
- La búsqueda llama a `/users/search-empresas` con debounce para no saturar la API
- Resultados en cards con: nombre empresa, sector, CIF, teléfono
- Botón **"Hacer reserva"** en cada empresa que navega a `BookingFormComponent` con `clienteNombre` preseleccionado

### 8.7 Perfil de usuario (Persona)

**PerfilComponent**

- Formulario para actualizar: nombre, apellidos, DNI, teléfono, email
- Sección separada para cambio de contraseña: contraseña actual + nueva contraseña + confirmación
- Validaciones completas con mensajes de error inline
- Mensaje de éxito al guardar

### 8.8 Panel de empresa

**MiEmpresaComponent**

- Formulario para gestionar los datos de la empresa: nombre, CIF, sector, teléfono empresa
- Vista de las reservas recibidas a nombre de la empresa
- Posibilidad de cancelar reservas desde este panel

### 8.9 Calendario

**CalendarComponent**

- Integración con **FullCalendar** (library JavaScript para calendarios interactivos)
- Vistas disponibles: mes, semana, día, lista/agenda
- Las reservas se muestran como eventos en el calendario
- Color de eventos según el estado (pendiente/confirmada/cancelada)
- Click en un evento navega al detalle de la reserva
- Filtro por recurso integrado

### 8.10 Barra de navegación

**NavbarComponent**

- Menú diferenciado según el rol del usuario:
  - **Admin**: Dashboard, Reservas, Recursos, Categorías, Empresas
  - **Empresa**: Dashboard, Mis Reservas, Mi Empresa
  - **Persona**: Dashboard, Mis Reservas, Empresas, Perfil
- Buscador de empresas integrado en la navbar (solo visible para Personas)
- Avatar con iniciales del usuario (generado dinámicamente)
- Toggle de **Dark Mode** con icono sol/luna
- Botón de cerrar sesión
- Indicador visual del rol actual

---

## 9. Seguridad y autenticación

### Sistema de autenticación

SmartBooking utiliza el sistema de sesiones nativo de **Symfony Security** sin tokens JWT, aprovechando las cookies de sesión HTTP:

1. El usuario envía credenciales a `POST /api/login`
2. Symfony verifica la contraseña con `UserPasswordHasherInterface` (bcrypt)
3. Se crea un `UsernamePasswordToken` y se serializa en la sesión PHP
4. La sesión se mantiene mediante cookies de sesión estándar
5. Symfony verifica la sesión en cada petición a endpoints protegidos

### Contraseñas

- Almacenadas con el algoritmo **bcrypt** a través de `UserPasswordHasher` de Symfony
- Longitud mínima de 8 caracteres (validada en frontend y backend)
- El frontend muestra un indicador visual de fuerza de contraseña
- El cambio de contraseña requiere introducir la contraseña actual como verificación

### Roles y autorización

El sistema implementa un modelo de roles jerárquico:

```
ROLE_ADMIN
    └── acceso total a todos los endpoints y funcionalidades
    
ROLE_EMPRESA
    └── ver y gestionar reservas recibidas a su nombre
    └── ver directorio de recursos
    └── gestionar su propio perfil
    
ROLE_PERSONA
    └── crear y gestionar sus propias reservas
    └── buscar empresas
    └── gestionar su propio perfil
    
ROLE_USER (base para todos)
```

### Protección de rutas en Angular (AuthGuard)

El `AuthGuard` implementa `CanActivate` y protege todas las rutas bajo `/app/*` excepto `/app/login` y `/app/register`:

- Si no hay usuario en el `AuthService`, llama a `GET /api/me` para verificar sesión activa
- Si no hay sesión válida en el servidor, redirige a `/app/login`
- En cada respuesta 401 de la API, el servicio de autenticación borra el estado local y redirige al login

### Protección CSRF

Symfony genera automáticamente tokens CSRF para los formularios del lado servidor. Los formularios de login y registro incluyen protección CSRF nativa de Symfony.

### Validación de conflictos de reserva

El endpoint `POST /api/bookings` comprueba mediante una query Doctrine si existe alguna reserva activa (no cancelada) para el mismo recurso que se solape con el intervalo solicitado:

```sql
-- Lógica equivalente de detección de conflictos
WHERE resource = :resource
  AND estado != 'cancelada'
  AND id != :excludeId  (solo en edición)
  AND fechaInicio < :fechaFin
  AND fechaFin > :fechaInicio
```

Si existe conflicto, la API devuelve `HTTP 422 Unprocessable Entity` con mensaje descriptivo, y el formulario Angular muestra el error al usuario.

### Validación de entrada en el backend

Todas las entidades utilizan atributos PHP 8 de Symfony Validator:

- `@Assert\NotBlank`, `@Assert\Email`, `@Assert\Length`
- `@Assert\Positive`, `@Assert\PositiveOrZero`
- `@Assert\GreaterThan` (fechaFin > fechaInicio)
- `@Assert\Callback` para validaciones condicionales (campos Persona vs. Empresa)
- `@UniqueEntity` para el email único en la tabla `user`

---

## 10. Interfaz de usuario

### Diseño general

La interfaz sigue los principios de **Material Design** adaptados con **Bootstrap 5.3**, con un estilo moderno, limpio y funcional orientado a entornos profesionales.

### Paleta de colores

| Color | Código HEX | Uso |
|---|---|---|
| Índigo | `#6366f1` | Color primario, botones principales, acciones |
| Esmeralda | `#10b981` | Éxito, reservas confirmadas, botones secundarios |
| Ámbar | `#f59e0b` | Advertencia, reservas pendientes |
| Rojo | `#ef4444` | Error, reservas canceladas, eliminación |
| Gris oscuro | `#1e293b` | Fondo dark mode, textos principales |

### Tipografía

La fuente principal es **Inter** (Google Fonts), una tipografía sans-serif diseñada específicamente para interfaces digitales. Se carga a través de CDN con los pesos 300, 400, 500, 600 y 700.

### Dark Mode

El dark mode está implementado completamente en CSS mediante variables CSS y la clase `.dark-mode` aplicada al elemento `<body>`:

- El `ThemeService` de Angular gestiona el toggle
- La preferencia se persiste en `localStorage` (clave `darkMode: 'true'|'false'`)
- Al cargar la aplicación, se lee la preferencia guardada y se aplica inmediatamente
- El toggle en la navbar cambia entre icono de sol (modo claro) y luna (modo oscuro)
- Todos los componentes tienen estilos dark mode en el archivo `public/css/smartbooking.css`

### Diseño responsive

Bootstrap 5.3 proporciona el sistema de rejilla (grid) de 12 columnas con breakpoints:
- `xs` (< 576px): móvil
- `sm` (≥ 576px): móvil grande
- `md` (≥ 768px): tablet
- `lg` (≥ 992px): escritorio
- `xl` (≥ 1200px): escritorio grande

Todos los componentes están adaptados para funcionar correctamente en dispositivos móviles (navegación colapsable, tablas con scroll horizontal, formularios apilados).

### Feedback visual

- **Toast notifications**: mensajes flotantes de éxito/error/información usando el `ToastComponent` (Web Component Angular)
- **Badges de estado**: colores diferenciados para pendiente (ámbar), confirmada (verde) y cancelada (rojo)
- **Loading states**: indicadores de carga durante las peticiones HTTP
- **Validación inline**: mensajes de error aparecen debajo de cada campo incorrecto en tiempo real
- **Confirmaciones**: diálogos de confirmación antes de acciones destructivas (cancelar, eliminar)

### Estilos personalizados

El archivo `public/css/smartbooking.css` contiene:
- Variables CSS para la paleta de colores (`--primary`, `--success`, `--warning`, etc.)
- Estilos personalizados para cards, badges, tablas y formularios
- Todos los estilos dark mode mediante selector `.dark-mode`
- Animaciones de transición suaves para hover y focus
- Estilos para el split-screen del login/registro

---

## 11. Despliegue con Docker

### Servicios en Docker Compose

El archivo `docker-compose.yml` define cuatro servicios orquestados:

| Servicio | Imagen | Puerto | Descripción |
|---|---|---|---|
| `php` | Custom (PHP 8.2 + Apache) | `8080:80` | Backend Symfony + archivos estáticos Angular |
| `db` | `mysql:8.0` | `3307:3306` | Base de datos MySQL |
| `phpmyadmin` | `phpmyadmin:5.2` | `8081:80` | Administración visual de la BBDD |
| `node` | `node:20-alpine` | — | Compilación del bundle Angular |

### Red interna

Todos los servicios se comunican a través de la red interna `smartbooking_net` (bridge). El servicio `php` se conecta a `db` usando el hostname `db:3306` internamente, aunque el puerto externo es `3307`.

### Volúmenes

- `mysql_data`: volumen persistente para los datos de MySQL (sobrevive a reinicios de contenedor)
- `./symfony:/var/www/html`: montaje del código Symfony en el contenedor PHP
- `./:/workspace`: montaje del proyecto completo en el contenedor Node para compilar Angular

### Arranque del proyecto

```bash
# 1. Clonar el repositorio
git clone <url-repositorio>
cd SmartBookingg

# 2. Levantar todos los servicios
docker compose up -d

# 3. Esperar a que MySQL esté listo (healthcheck automático)
# El servicio PHP espera a que db esté healthy

# 4. Ejecutar migraciones de base de datos
docker exec smartbooking_php php bin/console doctrine:migrations:migrate --no-interaction

# 5. (Opcional) Cargar datos de prueba
docker exec smartbooking_php php bin/console doctrine:fixtures:load --no-interaction
```

### URLs de acceso

| Servicio | URL |
|---|---|
| Aplicación web (Angular SPA) | http://localhost:8080/app |
| API REST | http://localhost:8080/api |
| phpMyAdmin | http://localhost:8081 |
| MySQL (externo) | localhost:3307 |

### Variables de entorno

El servicio PHP lee la configuración del entorno de forma automática. Para producción, se debe crear un archivo `.env.local` con los valores correspondientes:

```env
APP_ENV=prod
APP_SECRET=<clave-secreta-aleatoria-32-chars>
DATABASE_URL="mysql://usuario:password@db:3306/smartbooking?serverVersion=8.0&charset=utf8mb4"
```

---

## 12. Conclusiones

### Logros alcanzados

El proyecto SmartBooking ha cumplido con todos los objetivos planteados inicialmente, resultando en una aplicación web full-stack completa y funcional:

1. **Arquitectura moderna y escalable**: la separación entre API REST (Symfony) y SPA (Angular) permite escalar o modificar cada capa de forma independiente.

2. **API REST completa con 21 endpoints**: cubre todas las operaciones necesarias con control de acceso granular por rol.

3. **Frontend profesional**: la SPA Angular ofrece una experiencia de usuario fluida, sin recargas de página, con formularios reactivos y validación en tiempo real.

4. **Sistema de roles robusto**: la distinción entre Persona, Empresa y Administrador, con validaciones específicas para cada tipo, aporta valor real al sistema.

5. **Integridad de datos**: la detección de conflictos de reserva garantiza que no se produzcan solapamientos, que es el requisito más crítico de cualquier sistema de reservas.

6. **Diseño UX/UI cuidado**: dark mode, diseño responsive, feedback visual inmediato y tipografía cuidada hacen que la aplicación sea agradable y usable.

7. **Despliegue simplificado**: Docker Compose permite arrancar toda la aplicación con un único comando en cualquier máquina con Docker instalado.

### Competencias aplicadas

- Desarrollo backend con PHP 8.2 y Symfony 7 (MVC, ORM, seguridad, API REST)
- Desarrollo frontend con Angular 17 y TypeScript (SPA, reactive forms, HTTP, routing, guards)
- Diseño de bases de datos relacionales y modelado con Doctrine ORM
- Contenedorización con Docker y Docker Compose
- Control de versiones con Git
- Buenas prácticas: separación de responsabilidades, validación en múltiples capas, mensajes de error claros

### Posibles mejoras futuras

1. **Notificaciones por email**: enviar confirmación de reserva y recordatorios mediante Symfony Mailer + SMTP.

2. **Tests automatizados**: implementar tests unitarios (PHPUnit para Symfony, Jasmine/Jest para Angular) y tests de integración para la API.

3. **Sistema de valoraciones**: permitir que los usuarios valoren los recursos tras una reserva.

4. **Panel de estadísticas avanzado**: gráficas de ocupación, ingresos por recurso y periodo, exportación a PDF/Excel.

5. **Autenticación OAuth2**: integrar login con Google o Microsoft para mayor comodidad.

6. **Notificaciones en tiempo real**: WebSockets (Symfony Mercure) para notificar al admin cuando llega una nueva reserva.

7. **Gestión de imágenes**: permitir subir imágenes para los recursos.

8. **App móvil**: desarrollar una app nativa (Ionic/Angular) o PWA reutilizando la misma API REST.

9. **Internacionalización (i18n)**: soporte multi-idioma en Angular y Symfony.

10. **HTTPS y seguridad en producción**: configurar SSL/TLS con Let's Encrypt, cabeceras de seguridad HTTP y rate limiting en la API.

---

*Memoria elaborada por Daniel Aguado — Proyecto Final de Ciclo DAW — Florida Centre de Formació Coop. V. — Mayo 2026*
