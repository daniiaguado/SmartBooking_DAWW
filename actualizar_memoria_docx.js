"use strict";
/**
 * Actualiza Memoria_PFC_DanielAguado_v2.docx preservando imágenes y estructura Word.
 */
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const INPUT = path.join(__dirname, "Memoria_PFC_DanielAguado_v2.docx");
const OUTPUT = path.join(__dirname, "Memoria_PFC_DanielAguado_v2.docx");
const FALLBACK = path.join(__dirname, "Memoria_PFC_DanielAguado_v2_actualizado.docx");

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Permite etiquetas XML entre caracteres (Word fragmenta w:t) */
function buildFlexPattern(text) {
  const gap = "(?:</w:t>\\s*(?:</w:r>\\s*)?(?:<w:r[^>]*>\\s*)?(?:<w:proofErr[^>]*/>\\s*)*(?:<w:r[^>]*>\\s*)?<w:t(?:\\s[^>]*)?>\\s*)*";
  return text
    .split("")
    .map((ch) => {
      if (ch === " ") return "(?:\\s|" + gap + ")+";
      return escapeRegex(ch) + gap;
    })
    .join("");
}

function flexReplace(xml, from, to) {
  const pattern = buildFlexPattern(from);
  const re = new RegExp(pattern, "g");
  if (!re.test(xml)) return { xml, ok: false };
  const re2 = new RegExp(buildFlexPattern(from), "g");
  return { xml: xml.replace(re2, to), ok: true };
}

const REPLACEMENTS = [
  [
    "La Aplicación permite a los usuarios de una organización gestionar sus reservas",
    "SmartBooking distingue usuarios persona y empresa con roles y paneles diferenciados",
  ],
  [
    "La arquitectura de la aplicación se divide en dos bloques:",
    "La arquitectura se articula en tres bloques:",
  ],
  [
    "Backend con Symfony : gestiona la lógica de negocio, el enrutamiento, la autenticación, los formularios y la persistencia de datos mediante Doctrine ORM sobre MySQL .",
    "Backend Symfony 7 y PHP 8.2: lógica de negocio, Twig, API REST con 24 endpoints /api/* y Doctrine ORM sobre MySQL 8.",
  ],
  [
    "Frontend con Angular: integrado como Web Components (Angular Elements ), mejora la interfaz con filtros dinámicos y validación de formularios en el cliente.",
    "Frontend Angular 17: SPA en /app/* (login, register, dashboard, bookings, empresas, perfil, mi-empresa) con AuthGuard y ThemeService; Web Components en Twig.",
  ],
  [
    "El entorno de desarrollo y producción se encuentra completamente contenerizado con Docker, lo que garantiza el despliegue. La interfaz se construye con Bootstrap , ofreciendo un diseño moderno y adaptable a múltiples dispositivos.",
    "Docker (docker-compose) y Dockerfile para Render.com; CI con GitHub Actions. Bootstrap 5.3, modo oscuro y calendario FullCalendar en /calendar; coexistencia /booking (Twig) y /app/bookings (Angular).",
  ],
  [
    "Organizaciones medianas y pequeñas con recursos compartidos entre equipos (salas de reuniones, material audiovisual, laboratorios, etc.).",
    "Personas que reservan servicios en empresas (/app/empresas, buscador en navbar).",
  ],
  [
    "Empresas de servicios profesionales (clínicas, centros de estética, asesorías) que requieran un sistema de reservas para sus clientes.",
    "Empresas que consultan reservas recibidas (clienteNombre = nombreEmpresa). Administradores gestionan recursos y categorías.",
  ],
  [
    "Integrar Angular 17 como Web Components (Angular Elements ) dentro de las plantillas Twig sin necesidad de una API REST independiente.",
    "Desplegar Angular 17 como SPA con API REST (/api/*), AuthGuard y navbar horizontal, manteniendo Web Components en Twig.",
  ],
  [
    "Desarrollar un CRUD completo de reservas con detección automática de conflictos de horario mediante consultas DQL.",
    "Desarrollar CRUD de reservas con BookingRepository::findConflictingBookings() y filtrado por clienteNombre para empresas.",
  ],
  [
    "En SmartBooking , Angular 17 actúa como capa SPA para las secciones de mayor interactividad, compilado como Angular Elements e incrustado en las plantillas Twig del servidor.",
    "Angular 17 opera como SPA bajo /app/* (HttpClient, sesión, AuthGuard). Login y registro en /app/login y /app/register. Angular Elements permanecen en Twig.",
  ],
  [
    "El diseño del sistema partió de la identificación de las entidades principales del dominio ( User , Resource , Category , Booking )",
    "El diseño partió de User (userType persona/empresa), Resource, Category y Booking (clienteNombre). Diagramas en diagramas/arquitectura.png, erd.png y flujo.png",
  ],
  [
    "La interfaz sigue un diseño de sidebar fijo + área de contenido principal",
    "La SPA usa navbar horizontal fija; Twig conserva sidebar. ThemeService habilita modo oscuro en navbar",
  ],
  [
    "Login y Registro: formulario centrado con fondo degradado e indicador de fortaleza de contraseña.",
    "Login y registro: /app/login, /app/register (SPA) y /login, /register (Twig). Perfiles: /app/perfil, /app/mi-empresa.",
  ],
  [
    "Reservas: tabla con filtros, badges de estado coloreados y acciones por fila (ver, editar, cancelar, eliminar).",
    "Reservas: /app/bookings, detalle /app/bookings/:id y /booking/{id}; empresa consulta sin editar; validación findConflictingBookings().",
  ],
  [
    "Problema 5: Integración Angular sin API REST",
    "Problema 5: Integración SPA, API REST y permisos de empresa",
  ],
  [
    "Integrar Angular 17 en una aplicación Symfony tradicional sin duplicar la lógica de negocio en una API REST supuso un reto arquitectónico.",
    "Implementar SPA con 24 endpoints REST y corregir 403 en empresas (clienteNombre) supuso unificar denyIfNotOwnerOrAdmin() en API y Twig.",
  ],
  [
    "Se optó por Angular Elements (Web Components estándar), compilando Angular como un bundle JavaScript que registra custom HTML elements .",
    "Se expuso API REST reutilizando findConflictingBookings(); empresas leen reservas por clienteNombre; Angular Elements siguen en Twig.",
  ],
  [
    "Se han implementado 21 endpoints REST distribuidos en 5 controladores API",
    "Se han implementado 24 endpoints REST distribuidos en 5 controladores API",
  ],
  [
    "La SPA Angular cuenta con 12 componentes, 5 servicios y 8 rutas gestionadas por Angular Router.",
    "La SPA Angular cuenta con 12 componentes de página, AuthGuard, ThemeService y rutas /app/* (incl. perfil, mi-empresa, empresas).",
  ],
  [
    "Se implementó detección de conflictos de reserva mediante consulta DQL que verifica el solapamiento de fechas en tiempo real.",
    "findConflictingBookings() valida solapamientos; FullCalendar en /calendar; Dockerfile Render.com; usuarios prueba persona@test.com, empresa@test.com, empresa@gmail.com (SAD).",
  ],
  [
    "La decisión de integrar Angular como Angular Elements en lugar de una SPA tradicional constituyó uno de los aprendizajes más valiosos del proyecto",
    "La arquitectura híbrida SPA + API REST + Twig constituyó el aprendizaje principal del proyecto",
  ],
  [
    "demuestra que no siempre la solución más compleja es la más adecuada. Adaptar la tecnología al problema —y no al revés— produjo una arquitectura más sencilla, mantenible y funcional.",
    "combina fluidez en /app/* con vistas servidor y calendario; la API unifica permisos y conflictos para ambos canales.",
  ],
  [
    "Usuario tipo empresa: empresa@test.com / password123",
    "Usuario tipo empresa: empresa@test.com / password123 — Usuario SAD: empresa@gmail.com / password123",
  ],
];

async function main() {
  const inputPath = fs.existsSync(INPUT) ? INPUT : path.join(__dirname, "Memoria_PFC_DanielAguado_v2_actualizado.docx");
  const buf = fs.readFileSync(inputPath);
  const zip = await JSZip.loadAsync(buf);
  let xml = await zip.file("word/document.xml").async("string");

  let ok = 0;
  let miss = 0;
  for (const [from, to] of REPLACEMENTS) {
    const r = flexReplace(xml, from, to);
    xml = r.xml;
    if (r.ok) ok++;
    else {
      miss++;
      console.warn("⚠", from.substring(0, 55) + "...");
    }
  }

  zip.file("word/document.xml", xml);
  const outBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  try {
    fs.writeFileSync(OUTPUT, outBuf);
    console.log("✓ Guardado:", OUTPUT);
  } catch {
    fs.writeFileSync(FALLBACK, outBuf);
    console.log("⚠ Bloqueado. Guardado:", FALLBACK);
  }
  console.log(`  Reemplazos flex: ${ok} OK, ${miss} fallidos | ${(outBuf.length / 1024).toFixed(1)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
