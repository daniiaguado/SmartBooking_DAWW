// crear_memoria_v2.js — Genera Memoria_PFC_DanielAguado_v2.docx
"use strict";

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, PageNumber, Header, Footer,
  NumberingBulletType, LevelFormat, convertInchesToTwip, ShadingType,
  TableLayoutType, VerticalAlign, PageBreak, LineRuleType, Tab,
  ExternalHyperlink, UnderlineType,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
  });
}

function p(...runs) {
  const children = runs.map((r) => {
    if (typeof r === "string") return new TextRun({ text: r, size: 24 });
    return r;
  });
  return new Paragraph({
    children,
    spacing: { before: 120, after: 120 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 24 });
}

function italic(text) {
  return new TextRun({ text, italics: true, size: 24 });
}

function run(text) {
  return new TextRun({ text, size: 24 });
}

function bullet(text, level = 0) {
  return new Paragraph({
    text,
    bullet: { level },
    spacing: { before: 80, after: 80 },
  });
}

function caption(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20, color: "555555" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Table helpers ────────────────────────────────────────────────────────────

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
};

function cell(text, { header = false, width = null, shade = false } = {}) {
  const shading = shade
    ? { type: ShadingType.CLEAR, color: "auto", fill: "2B579A" }
    : header
    ? { type: ShadingType.CLEAR, color: "auto", fill: "E8EDF4" }
    : {};
  const color = shade ? "FFFFFF" : header ? "1F3864" : "000000";
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text), bold: header || shade, size: 22, color })],
        spacing: { before: 60, after: 60 },
        alignment: AlignmentType.LEFT,
      }),
    ],
    borders: BORDER,
    shading: Object.keys(shading).length ? shading : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    ...(width ? { width: { size: width, type: WidthType.PERCENTAGE } } : {}),
  });
}

function headerRow(cols) {
  return new TableRow({
    children: cols.map((c) => cell(c, { header: true })),
    tableHeader: true,
  });
}

function dataRow(cols) {
  return new TableRow({ children: cols.map((c) => cell(c)) });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow(headers), ...rows.map((r) => dataRow(r))],
    layout: TableLayoutType.FIXED,
  });
}

// ─── CODE BLOCK helper ────────────────────────────────────────────────────────
function codeParagraph(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 20, color: "1E4D78" })],
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "F0F4FA" },
    spacing: { before: 80, after: 80 },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const children = [];

// ── PORTADA ──────────────────────────────────────────────────────────────────
children.push(
  new Paragraph({
    children: [new TextRun({ text: "CFGS DESARROLLO DE APLICACIONES WEB", bold: true, size: 36, color: "2B579A" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Proyecto Final de Ciclo — Curso 2025-2026", size: 28, italics: true, color: "444444" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 800 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "SmartBooking", bold: true, size: 48, color: "1F3864" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Plataforma web de gestión de reservas de recursos", size: 26, italics: true, color: "555555" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 1200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Autor: Aguado, Daniel", size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Centro: Florida Centre de Formació Coop. V.", size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Fecha de entrega: Mayo 2026", size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 800 },
  }),
  pageBreak()
);

// ── 1. RESUMEN ────────────────────────────────────────────────────────────────
children.push(h1("1. Resumen del Proyecto"));
children.push(
  p("SmartBooking es una aplicación web de gestión de reservas de recursos desarrollada como Proyecto Final de Ciclo del CFGS Desarrollo de Aplicaciones Web. La plataforma distingue dos tipos de usuario — persona y empresa — con roles, campos y paneles diferenciados, permitiendo que las personas reserven servicios de empresas y que estas consulten las reservas recibidas en su nombre."),
  p("La arquitectura del sistema se articula en tres bloques principales:"),
  bullet("Backend con Symfony 7 y PHP 8.2: gestiona la lógica de negocio, autenticación, plantillas Twig y una API REST con 24 endpoints bajo /api/*, con persistencia mediante Doctrine ORM sobre MySQL 8."),
  bullet("Frontend con Angular 17: actúa como SPA en /app/* (login, registro, dashboard, reservas, empresas, perfiles) y, en paralelo, como Web Components embebidos en vistas Twig."),
  bullet("Infraestructura Docker: entorno de desarrollo con docker-compose y despliegue en producción mediante Dockerfile multi-stage orientado a Render.com, con integración continua en GitHub Actions."),
  p("La interfaz utiliza Bootstrap 5.3 con modo oscuro configurable (ThemeService), navbar horizontal en la SPA y calendario visual FullCalendar en la capa Twig. Las rutas /booking (Twig) y /app/bookings (Angular) coexisten para ofrecer la misma funcionalidad según el canal de acceso.")
);

// ── 2. JUSTIFICACIÓN Y OBJETIVOS ─────────────────────────────────────────────
children.push(h1("2. Justificación y Objetivos del Proyecto"));

children.push(h2("2.1. Justificación"));
children.push(
  p("En la actualidad, la gestión de citas y reservas constituye un proceso fundamental en numerosos sectores: clínicas, centros de formación, consultas médicas, asesorías y servicios profesionales en general. A pesar de la progresiva digitalización empresarial, un porcentaje significativo de organizaciones continúa gestionando sus reservas de forma manual o mediante hojas de cálculo, lo que genera errores humanos, pérdidas de tiempo y una experiencia de usuario deficiente."),
  p("SmartBooking se concibe con el objetivo de cubrir esta necesidad, ofreciendo una solución open source, de configuración sencilla y altamente personalizable, que cualquier organización pueda desplegar y adaptar a sus requerimientos operativos sin incurrir en costes de licenciamiento por usuario.")
);

children.push(h2("2.2. A quién se dirige"));
children.push(
  p("El sistema está dirigido principalmente a los siguientes perfiles:"),
  bullet("Personas que reservan servicios en empresas (clínicas, academias, asesorías) mediante búsqueda de empresas y selección de recursos."),
  bullet("Empresas que reciben y consultan reservas donde aparecen como cliente (nombre comercial), con panel de reservas recibidas."),
  bullet("Administradores que gestionan recursos, categorías y confirmación de reservas del sistema."),
  p("Para los usuarios finales, SmartBooking ofrece una plataforma intuitiva desde /app/* o vistas Twig, con consulta de disponibilidad, calendario visual, perfiles editables y gestión de reservas según el rol asignado.")
);

children.push(h2("2.3. Objetivos del Proyecto"));
children.push(
  p("El objetivo principal del proyecto consiste en desarrollar una plataforma web denominada SmartBooking que facilite la reserva de recursos y la gestión de servicios, aplicando el patrón MVC (Model-View-Controller), principios REST y buenas prácticas de desarrollo web, con un diseño responsive construido sobre Bootstrap 5."),
  p("Los objetivos específicos son:"),
  bullet("Implementar autenticación segura con distinción Persona/Empresa (userType, ROLE_PERSONA, ROLE_EMPRESA, ROLE_ADMIN) y dashboards adaptados a cada rol."),
  bullet("Desarrollar un CRUD de reservas con validación de conflictos mediante BookingRepository::findConflictingBookings() y filtrado por clienteNombre para empresas."),
  bullet("Gestionar un catálogo de recursos compartidos con categorización, búsqueda de empresas y perfiles editables (/app/perfil, /app/mi-empresa)."),
  bullet("Desplegar Angular 17 como SPA con API REST (/api/*), AuthGuard y navbar horizontal, manteniendo Web Components en Twig para vistas híbridas."),
  bullet("Contenerizar el entorno con Docker y preparar despliegue en Render.com mediante Dockerfile multi-stage."),
  bullet("Automatizar la integración continua con GitHub Actions (build Symfony + Angular)."),
  bullet("Aplicar metodologías ágiles (Kanban adaptado) y control de versiones con Git a lo largo del ciclo de desarrollo.")
);

// ── 3. DESARROLLO ─────────────────────────────────────────────────────────────
children.push(h1("3. Desarrollo del Proyecto"));

children.push(h2("3.1. Análisis del Mercado y Posible Modelo de Negocio"));
children.push(h3("Propuestas similares existentes"));
children.push(
  p("A continuación se analizan las principales herramientas del mercado que ofrecen funcionalidades similares a SmartBooking (Tabla 1):")
);
children.push(
  makeTable(
    ["Herramienta", "Descripción", "Limitación"],
    [
      ["Google Calendar", "Gestión de calendarios con salas de Google Workspace", "Solo para ecosistema Google; sin gestión de recursos propios"],
      ["Microsoft Bookings", "Reservas integradas en Microsoft 365", "Requiere suscripción empresarial; personalización limitada"],
      ["Skedda", "Plataforma SaaS de reserva de espacios", "De pago; sin posibilidad de autoalojamiento"],
      ["MRBS", "Aplicación open source de reservas", "Interfaz anticuada; difícil mantenimiento"],
      ["Robin", "Herramienta de gestión de oficinas híbridas", "Orientada a grandes empresas; precio elevado"],
    ]
  )
);
children.push(caption("Tabla 1. Comparativa de herramientas de gestión de reservas existentes. Elaboración propia."));

children.push(h3("Valor añadido de SmartBooking"));
children.push(
  bullet("Autoalojable: se despliega en cualquier servidor con Docker, sin dependencias de servicios externos."),
  bullet("Código abierto y personalizable: construido con tecnologías estándar del sector (PHP/Symfony, Angular), cualquier desarrollador puede adaptarlo."),
  bullet("Sin cuotas por usuario: a diferencia de las soluciones SaaS, el coste es fijo (infraestructura)."),
  bullet("Interfaz moderna: diseño responsive con Bootstrap 5, accesible desde móvil y escritorio."),
  bullet("Detección automática de conflictos: el sistema impide reservar un recurso ya ocupado en el intervalo solicitado.")
);

children.push(h3("Posible modelo de negocio"));
children.push(
  p("El proyecto se podría explotar bajo tres modalidades:"),
  bullet("Plataforma SaaS con modelo freemium: despliegue en dominio propio con plan gratuito de uso limitado y planes de pago escalables en función del número de usuarios y reservas."),
  bullet("SaaS por nichos verticales: servicio en la nube dirigido específicamente a centros educativos o academias, con planes diferenciados por número de recursos y administradores (básico, profesional, empresarial)."),
  bullet("Open source con servicios asociados: publicación del código en GitHub y monetización mediante instalaciones gestionadas, soporte técnico por horas y hosting mensual para clientes que prefieran no gestionar la infraestructura.")
);

children.push(h2("3.2. Metodologías Utilizadas"));
children.push(h3("Metodología de desarrollo: Kanban adaptado"));
children.push(
  p("El desarrollo se organizó siguiendo una metodología ágil ligera basada en Kanban, con columnas de trabajo: Pendiente, En progreso, Revisión y Hecho. Esta aproximación permitió iterar rápidamente sobre las funcionalidades y adaptarse a los cambios de requisitos sin incurrir en la rigidez de una planificación por sprints.")
);

children.push(h3("Patrón arquitectónico MVC y principios REST"));
children.push(
  p(
    "La arquitectura del backend sigue el patrón MVC (Model-View-Controller), donde Doctrine ORM actúa como capa de modelo, los controladores Symfony gestionan la lógica de aplicación y las plantillas Twig conforman la capa de vista. Adicionalmente, se han expuesto endpoints siguiendo los principios REST ",
    italic("(Fielding, 2000)"),
    run(", permitiendo la comunicación entre el frontend Angular y el servidor mediante peticiones HTTP estándar con respuestas en formato JSON.")
  )
);

children.push(h3("Single Page Application (SPA)"));
children.push(
  p(
    "Las Single Page Applications mejoran la experiencia de usuario al eliminar las recargas de página completa ",
    italic("(Mozilla Developer Network, 2024)"),
    run(". En SmartBooking, Angular 17 opera como SPA bajo el prefijo /app/*, consumiendo la API REST de Symfony mediante HttpClient con credenciales de sesión. Las rutas protegidas utilizan AuthGuard; el login y registro se realizan en /app/login y /app/register. En paralelo, Angular Elements siguen embebiéndose en plantillas Twig para filtros y validación sin abandonar el renderizado servidor.")
  )
);

children.push(h3("Control de versiones"));
children.push(
  p("Se utilizó Git para el control de versiones del código fuente, con commits atómicos por funcionalidad. La integración continua se automatizó mediante GitHub Actions con dos workflows: CI (construcción y validación) y Deploy Info (información de despliegue).")
);

children.push(h3("Diseño guiado por entidades"));
children.push(
  p("El diseño del sistema partió de la identificación de las entidades principales del dominio (User con userType persona/empresa, Resource, Category, Booking con clienteNombre) y sus relaciones, previo al inicio del desarrollo. El flujo de reserva persona→empresa se documenta en diagramas/flujo.png.")
);

children.push(h3("Entorno reproducible con Docker"));
children.push(
  p("Todo el entorno de desarrollo y producción opera con los mismos contenedores Docker, eliminando el problema de incompatibilidades entre entornos. El archivo docker-compose.yml define todos los servicios necesarios de forma declarativa.")
);

children.push(h2("3.3. Descripción de los Componentes de la Aplicación"));
children.push(h3("3.3.1. Arquitectura general"));
children.push(
  p(
    "Como se puede observar en la Figura 1 (Diagrama de Arquitectura), el sistema se compone de tres capas diferenciadas: la capa de presentación (Angular 17 + Bootstrap 5), la capa de lógica de negocio (Symfony 7 + Doctrine ORM) y la capa de persistencia (MySQL 8.0). ",
    italic("Symfony es un framework PHP de código abierto (Symfony, 2024)"),
    run(" que proporciona componentes desacoplados y una arquitectura basada en convención sobre configuración, reduciendo significativamente el tiempo de desarrollo.")
  ),
  p("SmartBooking sigue una arquitectura de capas en la que Symfony actúa como núcleo (controladores MVC, controladores API, entidades, repositorios y Twig), Angular 17 como SPA en /app/* servida por SpaController, y Web Components para enriquecer vistas Twig. Los diagramas de arquitectura, ERD y flujo de reserva se encuentran en diagramas/arquitectura.png, diagramas/erd.png y diagramas/flujo.png.")
);
children.push(caption("Figura 1. Diagrama de arquitectura del sistema SmartBooking (diagramas/arquitectura.png). Elaboración propia."));

children.push(h3("3.3.2. Modelo de Base de Datos"));
children.push(
  p("El Diagrama ERD (Figura 2) ilustra las relaciones entre las entidades del sistema. La base de datos MySQL consta de cuatro tablas principales cuyas relaciones se describen en la Tabla 2:")
);
children.push(
  makeTable(
    ["Tabla", "Campos principales", "Relaciones"],
    [
      ["user", "id, email, roles, password, user_type, nombre, apellidos, dni, telefono, nombre_empresa, cif, sector, telefono_empresa, created_at, is_active", "1:N con booking"],
      ["resource", "id, category_id, nombre, descripcion, capacidad, ubicacion, precio_hora, is_active", "N:1 con category; 1:N con booking"],
      ["category", "id, nombre, descripcion, color", "1:N con resource"],
      ["booking", "id, user_id, resource_id, fecha_inicio, fecha_fin, asistentes, motivo, cliente_nombre, estado, precio_total, created_at", "N:1 con user; N:1 con resource"],
    ]
  )
);
children.push(caption("Tabla 2. Modelo de datos del sistema SmartBooking. Elaboración propia."));
children.push(caption("Figura 2. Diagrama ERD del sistema SmartBooking (diagramas/erd.png). Elaboración propia."));

children.push(h3("3.3.3. Backend: Symfony 7"));
children.push(
  p("Los controladores principales implementados son:"),
  makeTable(
    ["Controlador", "Ruta base", "Funcionalidad"],
    [
      ["SecurityController", "/login, /logout, /register", "Autenticación y registro Twig"],
      ["SpaController", "/app, /app/{path}", "Entrada a la SPA Angular"],
      ["DashboardController", "/, /dashboard", "Home pública y panel Twig por rol"],
      ["BookingController", "/booking", "CRUD de reservas (Twig); detalle en /booking/{id}"],
      ["CalendarController", "/calendar", "Calendario FullCalendar y eventos JSON"],
      ["UserController", "/empresas, /users/search-empresas", "Listado y búsqueda de empresas"],
      ["ApiAuthController", "/api", "Login, registro, perfil y sesión JSON"],
      ["ApiBookingController", "/api/bookings", "CRUD REST de reservas"],
      ["ApiDashboardController", "/api/dashboard", "Estadísticas diferenciadas por rol"],
      ["ApiResourceController", "/api/resources", "CRUD REST de recursos"],
      ["ApiCategoryController", "/api/categories", "CRUD REST de categorías"],
    ]
  )
);
children.push(caption("Tabla 3. Controladores del backend Symfony. Elaboración propia."));
children.push(
  p("El sistema de seguridad utiliza form_login en Twig y sesión con credenciales en la API REST. Las contraseñas se almacenan con hash bcrypt. El control de acceso combina access_control en security.yaml y #[IsGranted] por acción."),
  p("La entidad User define userType (persona | empresa) y asigna ROLE_PERSONA o ROLE_EMPRESA en el registro. Las empresas visualizan reservas donde booking.clienteNombre coincide con su nombreEmpresa (no las que crearon como usuario), mediante findByClienteNombre(). El acceso al detalle de reserva para empresas se corrigió: denyIfNotOwnerOrAdmin() permite consulta sin edición/cancelación cuando la empresa es cliente de la reserva."),
  p("La validación de conflictos utiliza BookingRepository::findConflictingBookings(), que devuelve reservas pendientes o confirmadas que solapan el intervalo solicitado; se invoca en create() y update() de la API y del controlador Twig. El precio total se calcula automáticamente en PrePersist según duración y tarifa del recurso.")
);

children.push(h3("3.3.4. Frontend: Angular 17 SPA y Angular Elements"));
children.push(
  p(
    "Angular 17 cumple un doble rol ",
    italic("(Angular, 2024)"),
    run(": como SPA bajo /app/* (bootstrap manual en AppModule.ngDoBootstrap) y como Web Components en vistas Twig. La SPA incluye navbar horizontal fija (sb-topnav), ThemeService para modo oscuro (persistencia en localStorage, clave sb-theme) y AuthGuard en rutas protegidas.")
  ),
  makeTable(
    ["Ruta SPA", "Componente", "Función"],
    [
      ["/app/login", "LoginComponent", "Autenticación vía POST /api/login"],
      ["/app/register", "RegisterComponent", "Registro con selección userType"],
      ["/app/dashboard", "DashboardComponent", "Panel KPIs por rol (persona/empresa/admin)"],
      ["/app/bookings", "BookingsListComponent", "Listado de reservas (propias o recibidas)"],
      ["/app/bookings/:id", "BookingDetailComponent", "Detalle de reserva (consulta; empresa sin editar)"],
      ["/app/bookings/new", "BookingFormComponent", "Alta de reserva con validación de conflictos"],
      ["/app/empresas", "EmpresasComponent", "Búsqueda y selección de empresas para reservar"],
      ["/app/perfil", "PerfilComponent", "Edición de perfil persona (PUT /api/profile)"],
      ["/app/mi-empresa", "MiEmpresaComponent", "Edición de datos empresa"],
      ["/app/resources", "ResourcesListComponent", "Catálogo de recursos (admin)"],
      ["/app/categories", "CategoriesListComponent", "Gestión de categorías (admin)"],
    ]
  )
);
children.push(caption("Tabla 4. Rutas principales de la SPA Angular. Elaboración propia."));
children.push(
  p("Los Web Components embebidos en Twig son: <app-booking-filter>, <app-resource-filter>, <app-form-validator> y <app-toast>. El calendario FullCalendar 6 se implementa en Twig (/calendar) con eventos en /calendar/events; desde la SPA el usuario accede al mismo calendario mediante enlace al módulo Twig. La coexistencia de /booking/{id} (Twig) y /app/bookings/:id (Angular) permite consultar el detalle en ambos canales con la misma lógica de permisos en backend.")
);

children.push(h3("3.3.5. Infraestructura Docker y despliegue"));
children.push(
  p("El entorno de desarrollo se define en docker-compose.yml con cuatro servicios. Para producción en Render.com se utiliza un Dockerfile multi-stage: etapa Node 20 compila Angular hacia symfony/public/build/ y etapa PHP 8.3-Apache ejecuta Symfony en modo prod."),
  makeTable(
    ["Servicio / Artefacto", "Imagen / destino", "Puerto", "Función"],
    [
      ["php (dev)", "Imagen custom PHP 8.3 + Apache", "8080", "Symfony + assets compilados"],
      ["db", "mysql:8.0", "3307", "Base de datos relacional"],
      ["phpmyadmin", "phpmyadmin:5.2", "8081", "Administración visual de MySQL"],
      ["node (dev)", "node:20-alpine", "—", "Compilación del bundle Angular"],
      ["Dockerfile (prod)", "node:20 + php:8.3-apache", "80", "Build Angular + despliegue Render.com"],
    ]
  )
);
children.push(caption("Tabla 5. Servicios Docker y artefacto de producción. Elaboración propia."));
children.push(
  p("GitHub Actions ejecuta el workflow ci.yml en cada push/PR a main: job build-symfony (PHP 8.2, composer install, lint Twig/YAML) y job build-angular (Node 20, npm ci, npm run build). Un segundo workflow deploy-info.yml documenta el despliegue con docker-compose.")
);

children.push(h3("3.3.6. Mockups e Interfaz de Usuario"));
children.push(
  p("La SPA utiliza navbar horizontal superior fija; las vistas Twig conservan sidebar lateral. Bootstrap 5.3 y Bootstrap Icons unifican el estilo. Modo oscuro alternable desde la navbar (ThemeService). Las principales vistas son:"),
  bullet("Página pública (/) y acceso SPA (/app/login, /app/register): formularios centrados; registro con tipo persona o empresa."),
  bullet("Dashboard (/app/dashboard): KPIs diferenciados — persona ve sus reservas; empresa ve reservas recibidas (clienteNombre); admin ve estadísticas globales."),
  bullet("Reservas (/app/bookings, /app/bookings/:id): listado con filtros; detalle con permisos según rol; empresa solo consulta."),
  bullet("Empresas (/app/empresas): listado y buscador inline en navbar para reservar con empresa seleccionada."),
  bullet("Perfiles (/app/perfil, /app/mi-empresa): edición de datos personales o corporativos vía API."),
  bullet("Calendario (/calendar): FullCalendar con vistas mes/semana/día; clic en evento abre detalle Twig /booking/{id}."),
  bullet("Recursos y categorías: grid de tarjetas en Twig; gestión completa en SPA para administradores.")
);

children.push(h2("3.4. Problemas y Dificultades Encontradas"));

children.push(h3("Problema 1: Error autoload_runtime.php al iniciar el servidor"));
children.push(
  p("Síntoma: Al acceder a la aplicación, PHP mostraba el error Failed to open stream: No such file or directory para vendor/autoload_runtime.php."),
  p("Causa: El error superficial ocultaba el problema real: una opción de configuración collect_serializer_trace en config/packages/web_profiler.yaml que no existe en Symfony 7 (renombrada a collect_serializer_data)."),
  p("Solución: Se actualizó el archivo de configuración con la denominación correcta de la opción y se limpió la caché de Symfony.")
);

children.push(h3("Problema 2: Página principal redirigía al login"));
children.push(
  p("Síntoma: Al acceder a /, el sistema redirigía automáticamente a /login."),
  p("Causa: Doble restricción — la regla access_control en security.yaml requería ROLE_USER para cualquier ruta (^/) y el DashboardController tenía #[IsGranted('ROLE_USER')] a nivel de clase."),
  p("Solución: Se añadió una regla específica { path: ^/$, roles: PUBLIC_ACCESS } antes de la regla general y se eliminó la anotación de clase del controlador, añadiendo #[IsGranted] únicamente al método del dashboard.")
);

children.push(h3("Problema 3: Registro de usuarios fallaba silenciosamente"));
children.push(
  p("Síntoma: El formulario de registro se volvía a renderizar sin mostrar ningún error."),
  p("Causas: El archivo .env contenía entradas duplicadas (APP_SECRET vacío que sobrescribía el valor correcto); la configuración CSRF utilizaba tokens stateless basados en la cabecera Origin, que pueden fallar en entornos Docker; los errores globales del formulario no se mostraban en la plantilla."),
  p("Solución: Se limpió el archivo .env, se simplificó la configuración CSRF a sesión estándar, se añadió el bloque de errores globales en la plantilla de registro y se configuró el tema Bootstrap 5 para formularios Symfony.")
);

children.push(h3("Problema 4: Ruta /resource/new devolvía 404"));
children.push(
  p("Síntoma: Al intentar crear un nuevo recurso, el servidor devolvía un error 404."),
  p("Causa: Conflicto de rutas en ResourceController. La ruta /{id} estaba declarada antes que /new. Symfony evalúa las rutas en orden de declaración, por lo que intentaba buscar un recurso con id = \"new\" en la base de datos."),
  p("Solución: Se reordenaron los métodos del controlador para que /new quede declarada antes que /{id}.")
);

children.push(h3("Problema 5: Integración Angular, API REST y permisos de empresa"));
children.push(
  p("Dificultad de diseño: Evolucionar de Web Components embebidos a una SPA completa exigió exponer 24 endpoints REST sin duplicar reglas de negocio. Paralelamente, las empresas recibían error 403 al consultar reservas donde figuraban como clienteNombre pero no como user propietario."),
  p("Solución: Se implementó una capa API (ApiBookingController, ApiAuthController, etc.) reutilizando BookingRepository y la misma validación findConflictingBookings(). Se unificó denyIfNotOwnerOrAdmin() para permitir a ROLE_EMPRESA leer reservas cuyo clienteNombre coincide con nombreEmpresa, restringiendo edición y cancelación al propietario o admin. La SPA y Twig comparten esta lógica.")
);

children.push(h2("3.5. Resultados Obtenidos"));
children.push(
  p("Al concluir el desarrollo, SmartBooking cumple los objetivos funcionales y técnicos planteados. Los resultados principales son:"),
  bullet("24 endpoints REST en 5 controladores API (/api/login, /api/bookings, /api/dashboard, /api/resources, /api/categories, /api/profile, etc.)."),
  bullet("SPA Angular con 12 componentes de página, AuthGuard, navbar horizontal, modo oscuro (ThemeService) y rutas /app/* (login, register, dashboard, bookings, empresas, perfil, mi-empresa)."),
  bullet("Distinción Persona/Empresa con userType, ROLE_PERSONA/ROLE_EMPRESA y dashboards adaptados; empresas filtran reservas por clienteNombre = nombreEmpresa."),
  bullet("Validación de conflictos con findConflictingBookings(); perfiles editables; búsqueda de empresas; detalle en /app/bookings/:id y /booking/{id}."),
  bullet("Calendario FullCalendar en /calendar; coexistencia de rutas Twig y Angular; Web Components activos en vistas servidor."),
  bullet("Docker Compose (4 servicios) + Dockerfile Render.com; CI en GitHub Actions (build Symfony y Angular)."),
  bullet("Corrección de acceso 403 para empresas en detalle de reserva; usuarios de prueba documentados (persona@test.com, empresa@test.com, empresa@gmail.com para SAD)."),
  bullet("Diagramas de arquitectura, ERD y flujo en diagramas/*.png; interfaz responsive Bootstrap 5.3.")
);

// ── 4. CONCLUSIONES ──────────────────────────────────────────────────────────
children.push(h1("4. Conclusiones"));

children.push(h2("4.1. Conclusiones técnicas"));
children.push(
  p("El desarrollo de SmartBooking ha permitido aplicar de forma integrada los conocimientos del ciclo formativo. Symfony 7 con Doctrine ORM ha sido adecuado para modelar la distinción persona/empresa, la API REST y las plantillas Twig en un mismo proyecto."),
  p("La arquitectura híbrida —SPA Angular + Web Components + Twig— demuestra que se pueden combinar enfoques según la necesidad: la SPA aporta fluidez en gestión diaria; Twig y FullCalendar mantienen vistas servidor eficientes; la API unifica la lógica de permisos y conflictos."),
  p("Docker y GitHub Actions han garantizado entornos reproducibles y validación automática del build. El Dockerfile para Render.com cierra el ciclo hacia un despliegue cloud realista.")
);

children.push(h2("4.2. Conclusiones personales"));
children.push(
  p("Este proyecto ha supuesto un salto cualitativo en la madurez como desarrollador. Afrontar problemas reales de integración entre tecnologías (Symfony + Angular + Docker + MySQL) ha reforzado la capacidad de consultar documentación oficial, interpretar mensajes de error y plantear soluciones creativas ante situaciones imprevistas."),
  p("Asimismo, ha reafirmado la importancia de la planificación previa: el tiempo invertido en el diseño del modelo de datos y la arquitectura antes de escribir código se recuperó con creces al evitar refactorizaciones costosas."),
  p("A nivel profesional, el dominio de este stack tecnológico (Symfony/PHP, Angular, Docker, MySQL) es altamente demandado en el mercado laboral actual, especialmente en el ámbito del desarrollo de aplicaciones de gestión empresarial.")
);

// ── 5. LÍNEAS FUTURAS ────────────────────────────────────────────────────────
children.push(h1("5. Líneas Futuras de Trabajo"));
children.push(
  p("El proyecto sienta unas bases sólidas sobre las que se pueden construir múltiples mejoras en el futuro:"),
  bullet("API REST con API Platform: exposición de los datos como API para permitir el consumo desde aplicaciones móviles nativas (iOS/Android) o integraciones con terceros."),
  bullet("Notificaciones por correo electrónico: confirmaciones de reserva, recordatorios y notificaciones de cancelación mediante Symfony Mailer con un proveedor SMTP (SendGrid, Mailgun)."),
  bullet("Calendario en la SPA: migrar FullCalendar a /app/calendar para unificar la experiencia sin salir del prefijo Angular."),
  bullet("Flujo de aprobación de reservas: implementación de un proceso de aprobación donde las reservas permanezcan en estado \"pendiente\" hasta confirmación explícita del administrador, con notificación automática al usuario."),
  bullet("Gestión de usuarios desde el panel admin: sección de administración de usuarios donde el administrador pueda activar/desactivar cuentas, cambiar roles y consultar el historial de reservas."),
  bullet("Despliegue en producción: configuración de un pipeline CI/CD para despliegue automático en infraestructura cloud (AWS, DigitalOcean) con certificado SSL y base de datos gestionada.")
);

// ── 6. BIBLIOGRAFÍA ──────────────────────────────────────────────────────────
children.push(h1("6. Bibliografía"));
children.push(
  p("Las siguientes referencias, en formato APA 7, han sido consultadas durante el desarrollo del proyecto:"),
  new Paragraph({
    children: [
      new TextRun({ text: "Angular. (2024). ", size: 24 }),
      new TextRun({ text: "Angular v17 Documentation", italics: true, size: 24 }),
      new TextRun({ text: ". Recuperado de https://angular.io/docs", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Bootstrap. (2023). ", size: 24 }),
      new TextRun({ text: "Bootstrap 5.3 Documentation", italics: true, size: 24 }),
      new TextRun({ text: ". Recuperado de https://getbootstrap.com/docs/5.3/", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Docker Inc. (2024). ", size: 24 }),
      new TextRun({ text: "Docker Documentation", italics: true, size: 24 }),
      new TextRun({ text: ". Recuperado de https://docs.docker.com/", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Fielding, R. T. (2000). ", size: 24 }),
      new TextRun({ text: "Architectural Styles and the Design of Network-based Software Architectures", italics: true, size: 24 }),
      new TextRun({ text: " [Doctoral dissertation, University of California]. https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "FullCalendar. (2024). ", size: 24 }),
      new TextRun({ text: "FullCalendar v6 Documentation", italics: true, size: 24 }),
      new TextRun({ text: ". Recuperado de https://fullcalendar.io/docs", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Mozilla Developer Network. (2024). ", size: 24 }),
      new TextRun({ text: "Single-page application (SPA)", italics: true, size: 24 }),
      new TextRun({ text: ". MDN Web Docs. https://developer.mozilla.org/en-US/docs/Glossary/SPA", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Oracle. (2024). ", size: 24 }),
      new TextRun({ text: "MySQL 8.0 Reference Manual", italics: true, size: 24 }),
      new TextRun({ text: ". Recuperado de https://dev.mysql.com/doc/refman/8.0/en/", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Symfony. (2024). ", size: 24 }),
      new TextRun({ text: "Symfony 7.0 Documentation", italics: true, size: 24 }),
      new TextRun({ text: ". Recuperado de https://symfony.com/doc/7.0/", size: 24 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
  })
);

// ─── ANEXOS ───────────────────────────────────────────────────────────────────
children.push(pageBreak());
children.push(
  new Paragraph({
    children: [new TextRun({ text: "ANEXOS", bold: true, size: 32, color: "2B579A" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
  })
);

// ── ANEXO A — Endpoints API REST ──────────────────────────────────────────────
children.push(h1("Anexo A — Endpoints de la API REST"));
children.push(
  p("La Tabla A.1 recoge los endpoints REST implementados en SmartBooking, con indicación del método HTTP, la ruta, la descripción funcional y el nivel de acceso requerido.")
);
children.push(
  makeTable(
    ["Método", "Ruta", "Descripción", "Acceso"],
    [
      ["POST", "/api/login", "Autenticación de usuario", "Público"],
      ["POST", "/api/register", "Registro (persona o empresa)", "Público"],
      ["GET", "/api/me", "Datos del usuario autenticado", "ROLE_USER"],
      ["POST", "/api/logout", "Cierre de sesión", "ROLE_USER"],
      ["PUT", "/api/profile", "Actualizar perfil (persona/empresa)", "ROLE_USER"],
      ["GET", "/api/check-email", "Comprobar disponibilidad de email", "Público"],
      ["GET", "/api/dashboard", "Estadísticas por rol", "ROLE_USER"],
      ["GET", "/api/bookings", "Listado (filtrado por rol)", "ROLE_USER"],
      ["GET", "/api/bookings/{id}", "Detalle de reserva", "ROLE_USER"],
      ["POST", "/api/bookings", "Crear reserva", "ROLE_PERSONA / ADMIN"],
      ["PUT", "/api/bookings/{id}", "Editar reserva", "Propietario / ADMIN"],
      ["DELETE", "/api/bookings/{id}", "Eliminar reserva", "Propietario / ADMIN"],
      ["POST", "/api/bookings/{id}/confirmar", "Confirmar reserva", "ROLE_ADMIN"],
      ["POST", "/api/bookings/{id}/cancelar", "Cancelar reserva", "Propietario / ADMIN"],
      ["GET", "/api/resources", "Listado de recursos", "ROLE_USER"],
      ["GET", "/api/resources/{id}", "Detalle de recurso", "ROLE_USER"],
      ["POST", "/api/resources", "Crear recurso", "ROLE_ADMIN"],
      ["PUT", "/api/resources/{id}", "Editar recurso", "ROLE_ADMIN"],
      ["DELETE", "/api/resources/{id}", "Eliminar recurso", "ROLE_ADMIN"],
      ["GET", "/api/categories", "Listado de categorías", "ROLE_USER"],
      ["GET", "/api/categories/{id}", "Detalle de categoría", "ROLE_USER"],
      ["POST", "/api/categories", "Crear categoría", "ROLE_ADMIN"],
      ["PUT", "/api/categories/{id}", "Editar categoría", "ROLE_ADMIN"],
      ["DELETE", "/api/categories/{id}", "Eliminar categoría", "ROLE_ADMIN"],
    ]
  )
);
children.push(caption("Tabla A.1. Endpoints de la API REST de SmartBooking (24 rutas). Elaboración propia."));

// ── ANEXO B — Instrucciones de despliegue local ───────────────────────────────
children.push(h1("Anexo B — Instrucciones de Despliegue Local"));
children.push(p("Para desplegar SmartBooking en un entorno local, se deben seguir los pasos indicados a continuación. Requisito previo: tener Docker Desktop instalado y en ejecución."));

const deploySteps = [
  ["1.", "Clonar el repositorio:", "git clone https://github.com/daniiaguado/SmartBooking_DAWW.git"],
  ["2.", "Acceder al directorio del proyecto:", "cd SmartBooking_DAWW"],
  ["3.", "Arrancar los contenedores Docker:", "docker compose up -d"],
  ["4.", "Instalar dependencias PHP:", "docker exec smartbooking_php composer install"],
  ["5.", "Crear el esquema de base de datos:", "docker exec smartbooking_php php bin/console doctrine:schema:update --force"],
  ["6.", "Instalar dependencias Angular y compilar:", "cd angular && npm install && npm run build"],
  ["7.", "Acceder a la aplicación en el navegador:", "http://localhost:8080/app/login"],
];

for (const [num, desc, cmd] of deploySteps) {
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: num + " ", bold: true, size: 24 }),
        new TextRun({ text: desc, size: 24 }),
      ],
      spacing: { before: 120, after: 40 },
    })
  );
  children.push(codeParagraph(cmd));
}

children.push(
  p("Usuarios de prueba disponibles tras la inicialización (crear vía registro o manualmente):"),
  bullet("Usuario tipo persona: persona@test.com / password123"),
  bullet("Usuario tipo empresa: empresa@test.com / password123"),
  bullet("Usuario empresa SAD (demostración): empresa@gmail.com / password123")
);

// ── ANEXO C — Estructura de directorios ──────────────────────────────────────
children.push(h1("Anexo C — Estructura de Directorios del Proyecto"));
children.push(p("El árbol de directorios simplificado del proyecto SmartBooking_DAWW es el siguiente:"));

const dirTree = [
  "SmartBooking_DAWW/",
  "├── symfony/               # Backend Symfony 7",
  "│   ├── src/",
  "│   │   ├── Controller/    # Controladores MVC y API",
  "│   │   ├── Entity/        # Entidades Doctrine",
  "│   │   ├── Repository/    # Repositorios de datos",
  "│   │   └── Form/          # Tipos de formulario",
  "│   ├── templates/         # Plantillas Twig",
  "│   └── public/            # Assets públicos y build Angular",
  "├── angular/               # Frontend Angular 17",
  "│   └── src/app/",
  "│       ├── components/    # Componentes reutilizables",
  "│       ├── pages/         # Páginas de la SPA",
  "│       ├── services/      # Servicios HTTP",
  "│       └── guards/        # Guards de rutas",
  "├── docker/                # Configuración Docker",
  "├── diagramas/             # Diagramas PNG del proyecto",
  "└── Dockerfile             # Para despliegue en Render.com",
];

for (const line of dirTree) {
  children.push(codeParagraph(line));
}

children.push(caption("Figura C.1. Estructura de directorios del proyecto SmartBooking. Elaboración propia."));

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════

const doc = new Document({
  creator: "Daniel Aguado",
  title: "Memoria PFC SmartBooking — CFGS DAW",
  description: "Proyecto Final de Ciclo — SmartBooking — CFGS Desarrollo de Aplicaciones Web",
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 24, color: "000000" },
        paragraph: { spacing: { line: 360, lineRule: LineRuleType.AUTO } },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { bold: true, size: 32, color: "1F3864", font: "Calibri" },
        paragraph: {
          spacing: { before: 480, after: 240 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2B579A" } },
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { bold: true, size: 26, color: "2B579A", font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 180 } },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { bold: true, size: 24, color: "375569", font: "Calibri" },
        paragraph: { spacing: { before: 240, after: 120 } },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1.18),
            right: convertInchesToTwip(0.98),
            bottom: convertInchesToTwip(0.98),
            left: convertInchesToTwip(1.18),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "SmartBooking — Memoria PFC  |  Daniel Aguado", size: 18, color: "888888" }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "CFGS DAW — Florida Centre de Formació Coop. V. — 2025-2026  |  Pág. ", size: 18, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const outputPath = path.join(__dirname, "Memoria_PFC_DanielAguado_v2.docx");
const tempPath = path.join(__dirname, "Memoria_PFC_DanielAguado_v2.tmp.docx");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(tempPath, buffer);
  try {
    fs.copyFileSync(tempPath, outputPath);
    fs.unlinkSync(tempPath);
    console.log("✓ Documento generado: " + outputPath);
  } catch (e) {
    if (e.code === "EBUSY" || e.code === "EPERM") {
      const fallback = path.join(__dirname, "Memoria_PFC_DanielAguado_v2_nuevo.docx");
      fs.copyFileSync(tempPath, fallback);
      fs.unlinkSync(tempPath);
      console.log("⚠ Archivo bloqueado. Guardado en: " + fallback);
      console.log("  Cierra Word y renombra o copia sobre Memoria_PFC_DanielAguado_v2.docx");
    } else {
      throw e;
    }
  }
  console.log("  Tamaño: " + (buffer.length / 1024).toFixed(1) + " KB");
}).catch((err) => {
  console.error("✗ Error al generar el documento:", err.message);
  process.exit(1);
});
