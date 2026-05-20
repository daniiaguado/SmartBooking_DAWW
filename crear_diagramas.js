const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, TableLayoutType,
  VerticalAlign, PageBreak, convertMillimetersToTwip,
  Footer, PageNumber
} = require('docx');

// ===== HELPERS =====
function cell(text, opts = {}) {
  const {
    bold = false, color = '222222', bg = 'FFFFFF',
    size = 20, font = 'Calibri', align = AlignmentType.LEFT,
    width = null, span = 1, italic = false, center = false
  } = opts;
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.CLEAR, color: bg, fill: bg },
    columnSpan: span,
    ...(width ? { width: { size: width, type: WidthType.DXA } } : {}),
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : align,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text, bold, color, size, font, italics: italic })],
    })],
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    },
  });
}

function headerCell(text, opts = {}) {
  return cell(text, { bold: true, color: 'FFFFFF', bg: '2E4057', size: 22, center: true, ...opts });
}

function sectionTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 30, color: '2E4057', font: 'Calibri' })],
    spacing: { before: 400, after: 200 },
  });
}

function subTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, color: '4A6FA5', font: 'Calibri' })],
    spacing: { before: 300, after: 160 },
  });
}

function para(text, opts = {}) {
  const { bold = false, color = '333333', size = 20, center = false, italic = false } = opts;
  return new Paragraph({
    alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, bold, color, size, font: 'Calibri', italics: italic })],
  });
}

function arrow(label = '') {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: label ? `↓  ${label}` : '↓', size: 24, color: '4A6FA5', font: 'Calibri', bold: true })],
  });
}

function emptyRow() {
  return new Paragraph({ children: [new TextRun('')], spacing: { before: 80, after: 80 } });
}

// =====================================================
// DIAGRAMA 1: ARQUITECTURA DEL SISTEMA
// =====================================================
function buildDiagram1() {
  const W = 9000;

  const rows = [];

  // ----- CAPA CLIENTE -----
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'D0E8FF', fill: 'D0E8FF' },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '4A6FA5' },
        left: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
        right: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [new TextRun({ text: '🌐  NAVEGADOR (Cliente)', bold: true, size: 26, color: '1A3A5C', font: 'Calibri' })],
      })],
      margins: { top: 100, bottom: 60, left: 200, right: 200 },
    })],
  }));

  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'E8F4FF', fill: 'E8F4FF' },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '4A6FA5' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '4A6FA5' },
        left: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
        right: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 }, children: [new TextRun({ text: 'Angular 17  ─  Single Page Application', bold: true, size: 22, color: '1A3A5C', font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: 'LoginComponent  ·  DashboardComponent  ·  BookingsComponent', size: 19, color: '3A5A7C', font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 60 }, children: [new TextRun({ text: 'EmpresasComponent  ·  RegisterComponent  ·  PerfilComponent', size: 19, color: '3A5A7C', font: 'Calibri' })] }),
      ],
      margins: { top: 80, bottom: 80, left: 400, right: 400 },
    })],
  }));

  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'D0E8FF', fill: 'D0E8FF' },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '4A6FA5' },
        bottom: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
        left: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
        right: { style: BorderStyle.THICK, size: 10, color: '2E4057' },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'TypeScript  ·  RxJS  ·  Angular HttpClient  ·  Angular Router', size: 19, color: '1A3A5C', font: 'Calibri', italic: true })],
      })],
      margins: { top: 60, bottom: 60, left: 200, right: 200 },
    })],
  }));

  // flecha
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'FFFFFF', fill: 'FFFFFF' },
      verticalAlign: VerticalAlign.CENTER,
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: '↕  HTTP / JSON  (API REST)', bold: true, size: 22, color: '4A6FA5', font: 'Calibri' })],
      })],
      margins: { top: 60, bottom: 60, left: 200, right: 200 },
    })],
  }));

  // ----- CAPA SERVIDOR -----
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'D5EDDA', fill: 'D5EDDA' },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E8A4A' },
        left: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
        right: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [new TextRun({ text: '🐳  DOCKER CONTAINER (Servidor)', bold: true, size: 26, color: '14502A', font: 'Calibri' })],
      })],
      margins: { top: 100, bottom: 60, left: 200, right: 200 },
    })],
  }));

  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'EAF7ED', fill: 'EAF7ED' },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '2E8A4A' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E8A4A' },
        left: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
        right: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 }, children: [new TextRun({ text: 'Symfony 7  (PHP 8.2)', bold: true, size: 22, color: '14502A', font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: 'API REST  /api/...      ·      Symfony Security  +  Sesiones PHP', size: 19, color: '1E6E3A', font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: '↓', size: 24, color: '1E6E3A', font: 'Calibri', bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 60 }, children: [new TextRun({ text: 'Doctrine ORM', bold: true, size: 20, color: '14502A', font: 'Calibri' })] }),
      ],
      margins: { top: 80, bottom: 80, left: 400, right: 400 },
    })],
  }));

  // flecha
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'EAF7ED', fill: 'EAF7ED' },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '2E8A4A' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E8A4A' },
        left: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
        right: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: '↕  SQL Queries', bold: true, size: 20, color: '2E8A4A', font: 'Calibri' })],
      })],
      margins: { top: 40, bottom: 40, left: 200, right: 200 },
    })],
  }));

  // DB
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'FFF3CD', fill: 'FFF3CD' },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '856404' },
        bottom: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
        left: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
        right: { style: BorderStyle.THICK, size: 10, color: '1E6E3A' },
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 }, children: [new TextRun({ text: '🗄️  MySQL 8.0', bold: true, size: 22, color: '5A4000', font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 80 }, children: [new TextRun({ text: 'user  ·  booking  ·  resource  ·  category', size: 19, color: '7A5500', font: 'Calibri' })] }),
      ],
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
    })],
  }));

  return new Table({
    rows,
    width: { size: W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });
}

// =====================================================
// DIAGRAMA 2: ERD
// =====================================================
function buildDiagram2() {
  const W = 9000;
  const col = Math.floor(W / 4);

  const makeEntityHeader = (name, color, bgColor) => new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.CLEAR, color: bgColor, fill: bgColor },
    borders: {
      top: { style: BorderStyle.THICK, size: 8, color },
      bottom: { style: BorderStyle.THICK, size: 8, color },
      left: { style: BorderStyle.THICK, size: 8, color },
      right: { style: BorderStyle.THICK, size: 8, color },
    },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: name, bold: true, size: 22, color: 'FFFFFF', font: 'Calibri' })],
    })],
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    width: { size: col, type: WidthType.DXA },
  });

  const makeFieldCell = (text, isPK = false, isFK = false, bg = 'FFFFFF', borderColor = 'AAAAAA') => new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.CLEAR, color: bg, fill: bg },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
      left: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
      right: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
    },
    children: [new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({
        text: isPK ? '🔑 ' + text : isFK ? '🔗 ' + text : '   ' + text,
        bold: isPK,
        size: 18,
        color: isPK ? '8B4513' : isFK ? '4A6FA5' : '333333',
        font: 'Courier New',
      })],
    })],
    margins: { top: 40, bottom: 40, left: 100, right: 100 },
    width: { size: col, type: WidthType.DXA },
  });

  // Encabezados
  const headerRow = new TableRow({
    children: [
      makeEntityHeader('USER', '1A3A6E', '2E4057'),
      makeEntityHeader('BOOKING', '1E6E3A', '2A6E3A'),
      makeEntityHeader('RESOURCE', '6E3A1A', '8B4513'),
      makeEntityHeader('CATEGORY', '5A2D8E', '6A3DA8'),
    ],
  });

  const userFields   = ['id (PK)', 'email', 'password', 'user_type', 'nombre', 'apellidos', 'dni', 'telefono', 'nombre_empresa', 'cif', 'sector', 'telefono_empresa', 'roles'];
  const bookFields   = ['id (PK)', 'user_id (FK→USER)', 'resource_id (FK→RES)', 'fecha_inicio', 'fecha_fin', 'estado', 'num_asistentes', 'motivo', 'precio_total', 'cliente_nombre', '', '', ''];
  const resFields    = ['id (PK)', 'nombre', 'descripcion', 'capacidad', 'precio_hora', 'disponible', 'category_id (FK→CAT)', '', '', '', '', '', ''];
  const catFields    = ['id (PK)', 'nombre', 'descripcion', 'color', '', '', '', '', '', '', '', '', ''];

  const maxLen = Math.max(userFields.length, bookFields.length, resFields.length, catFields.length);

  const fieldRows = [];
  for (let r = 0; r < maxLen; r++) {
    const uf = userFields[r] || '';
    const bf = bookFields[r] || '';
    const rf = resFields[r] || '';
    const cf = catFields[r] || '';
    fieldRows.push(new TableRow({
      children: [
        makeFieldCell(uf, uf.includes('(PK)'), false, r % 2 === 0 ? 'EEF3FF' : 'F8F9FF', '8899CC'),
        makeFieldCell(bf, bf.includes('(PK)'), bf.includes('(FK'), r % 2 === 0 ? 'EEF9F2' : 'F5FBF7', '88CC99'),
        makeFieldCell(rf, rf.includes('(PK)'), rf.includes('(FK'), r % 2 === 0 ? 'FFF3EE' : 'FFF8F5', 'CCAA88'),
        makeFieldCell(cf, cf.includes('(PK)'), false, r % 2 === 0 ? 'F5EEFF' : 'FAF5FF', 'BB99DD'),
      ],
    }));
  }

  // Relaciones
  const relRow = new TableRow({
    children: [new TableCell({
      columnSpan: 4,
      shading: { type: ShadingType.CLEAR, color: 'F0F0F0', fill: 'F0F0F0' },
      borders: {
        top: { style: BorderStyle.THICK, size: 8, color: '2E4057' },
        bottom: { style: BorderStyle.THICK, size: 8, color: '2E4057' },
        left: { style: BorderStyle.THICK, size: 8, color: '2E4057' },
        right: { style: BorderStyle.THICK, size: 8, color: '2E4057' },
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 }, children: [new TextRun({ text: 'RELACIONES', bold: true, size: 20, color: '2E4057', font: 'Calibri' })] }),
        new Paragraph({ spacing: { before: 40, after: 30 }, children: [new TextRun({ text: '   USER (1) ────────────── (N) BOOKING     [ user_id → user.id ]', size: 18, color: '1A3A6E', font: 'Courier New' })] }),
        new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: '   RESOURCE (1) ─────────── (N) BOOKING     [ resource_id → resource.id ]', size: 18, color: '6E3A1A', font: 'Courier New' })] }),
        new Paragraph({ spacing: { before: 30, after: 80 }, children: [new TextRun({ text: '   CATEGORY (1) ─────────── (N) RESOURCE    [ category_id → category.id ]', size: 18, color: '5A2D8E', font: 'Courier New' })] }),
      ],
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
      width: { size: W, type: WidthType.DXA },
    })],
  });

  return new Table({
    rows: [headerRow, ...fieldRows, relRow],
    width: { size: W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });
}

// =====================================================
// DIAGRAMA 3: FLUJO DE LA APLICACIÓN
// =====================================================
function buildDiagram3() {
  const W = 9000;
  const fullCell = (text, opts = {}) => {
    const { bg = 'FFFFFF', borderColor = '4A6FA5', bold = false, color = '222222', size = 20, center = true, borderThick = false } = opts;
    return new TableCell({
      columnSpan: 1,
      verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, color: bg, fill: bg },
      borders: {
        top: { style: borderThick ? BorderStyle.THICK : BorderStyle.SINGLE, size: borderThick ? 8 : 4, color: borderColor },
        bottom: { style: borderThick ? BorderStyle.THICK : BorderStyle.SINGLE, size: borderThick ? 8 : 4, color: borderColor },
        left: { style: borderThick ? BorderStyle.THICK : BorderStyle.SINGLE, size: borderThick ? 8 : 4, color: borderColor },
        right: { style: borderThick ? BorderStyle.THICK : BorderStyle.SINGLE, size: borderThick ? 8 : 4, color: borderColor },
      },
      children: [new Paragraph({
        alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text, bold, size, color, font: 'Calibri' })],
      })],
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
      width: { size: W, type: WidthType.DXA },
    });
  };

  const arrowRow = (label = '') => new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'FFFFFF', fill: 'FFFFFF' },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: label ? `↓   ${label}` : '↓', bold: true, size: 22, color: '4A6FA5', font: 'Calibri' })],
      })],
      margins: { top: 40, bottom: 40, left: 200, right: 200 },
      width: { size: W, type: WidthType.DXA },
    })],
  });

  const stepRow = (text, opts = {}) => new TableRow({ children: [fullCell(text, opts)] });

  const rows = [];

  rows.push(stepRow('INICIO: Usuario accede a /app/login', { bg: 'D0E8FF', borderColor: '2E4057', bold: true, color: '1A3A5C', size: 22, borderThick: true }));
  rows.push(arrowRow());
  rows.push(stepRow('Introduce email + contraseña', { bg: 'EEF4FF', borderColor: '4A6FA5', size: 20 }));
  rows.push(arrowRow());
  rows.push(stepRow('Angular → POST /api/login → Symfony', { bg: 'EEF4FF', borderColor: '4A6FA5', size: 20, color: '1A3A5C' }));
  rows.push(arrowRow('Validación en servidor'));

  // Decision
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'FFF9C4', fill: 'FFF9C4' },
      borders: {
        top: { style: BorderStyle.THICK, size: 8, color: 'B8860B' },
        bottom: { style: BorderStyle.THICK, size: 8, color: 'B8860B' },
        left: { style: BorderStyle.THICK, size: 8, color: 'B8860B' },
        right: { style: BorderStyle.THICK, size: 8, color: 'B8860B' },
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 }, children: [new TextRun({ text: '◆  ¿Credenciales válidas?', bold: true, size: 24, color: '8B6914', font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 80 }, children: [new TextRun({ text: 'SÍ  ─────────────────────────────────  NO', size: 20, color: '8B6914', font: 'Calibri', bold: true })] }),
      ],
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
      width: { size: W, type: WidthType.DXA },
    })],
  }));

  // Dos ramas
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'FFFFFF', fill: 'FFFFFF' },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: '↙  Credenciales OK                                      Credenciales KO  ↘', size: 20, color: '666666', font: 'Calibri' }),
        ],
      })],
      margins: { top: 40, bottom: 40, left: 200, right: 200 },
      width: { size: W, type: WidthType.DXA },
    })],
  }));

  // Resultado autenticación
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'FFFFFF', fill: 'FFFFFF' },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({ text: '✅ Sesión PHP iniciada                                          ❌ HTTP 401 · Mensaje de error', size: 20, color: '333333', font: 'Calibri' }),
        ],
      })],
      margins: { top: 40, bottom: 40, left: 100, right: 100 },
      width: { size: W, type: WidthType.DXA },
    })],
  }));

  rows.push(arrowRow('Ruta SÍ: AuthService actualizado'));
  rows.push(stepRow('Redirigir según rol de usuario', { bg: 'D5EDDA', borderColor: '1E6E3A', bold: true, color: '14502A', size: 22, borderThick: true }));

  // Roles
  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'EAF7ED', fill: 'EAF7ED' },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '2E8A4A' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E8A4A' },
        left: { style: BorderStyle.THICK, size: 8, color: '1E6E3A' },
        right: { style: BorderStyle.THICK, size: 8, color: '1E6E3A' },
      },
      children: [
        new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: '   ├── ROLE_PERSONA  →  Dashboard personal (reservas propias, perfil)', size: 19, color: '14502A', font: 'Courier New' })] }),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: '   ├── ROLE_EMPRESA   →  Dashboard empresa  (gestión de recursos)', size: 19, color: '14502A', font: 'Courier New' })] }),
        new Paragraph({ spacing: { before: 40, after: 80 }, children: [new TextRun({ text: '   └── ROLE_ADMIN      →  Dashboard admin   (usuarios, reportes globales)', size: 19, color: '14502A', font: 'Courier New' })] }),
      ],
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
      width: { size: W, type: WidthType.DXA },
    })],
  }));

  rows.push(arrowRow('Navegar por la SPA'));
  rows.push(stepRow('Acciones disponibles en la SPA', { bg: 'D0E8FF', borderColor: '2E4057', bold: true, color: '1A3A5C', size: 22, borderThick: true }));

  rows.push(new TableRow({
    children: [new TableCell({
      columnSpan: 1,
      shading: { type: ShadingType.CLEAR, color: 'E8F4FF', fill: 'E8F4FF' },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '4A6FA5' },
        bottom: { style: BorderStyle.THICK, size: 8, color: '2E4057' },
        left: { style: BorderStyle.THICK, size: 8, color: '2E4057' },
        right: { style: BorderStyle.THICK, size: 8, color: '2E4057' },
      },
      children: [
        new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: '   ├── Ver / crear / editar / cancelar reservas', size: 19, color: '1A3A5C', font: 'Courier New' })] }),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: '   ├── Buscar empresas y recursos disponibles', size: 19, color: '1A3A5C', font: 'Courier New' })] }),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: '   ├── Ver calendario de reservas', size: 19, color: '1A3A5C', font: 'Courier New' })] }),
        new Paragraph({ spacing: { before: 40, after: 80 }, children: [new TextRun({ text: '   └── Editar perfil y datos personales', size: 19, color: '1A3A5C', font: 'Courier New' })] }),
      ],
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
      width: { size: W, type: WidthType.DXA },
    })],
  }));

  return new Table({
    rows,
    width: { size: W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });
}

// =====================================================
// CONSTRUIR DOCUMENTO
// =====================================================
const elements = [];

// Portada sección
elements.push(
  new Paragraph({
    children: [new TextRun({ text: 'SmartBooking', bold: true, size: 72, color: '2E4057', font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Diagramas Técnicos', size: 44, color: '4A6FA5', font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '─────────────────────────────────────────', color: '2E4057', size: 28 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Memoria del Proyecto Final de Ciclo · DAW · Mayo 2026', size: 24, color: '666666', font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Autor: Daniel Aguado', size: 24, color: '444444', font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 1000 },
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── DIAGRAMA 1 ───
elements.push(
  sectionTitle('Diagrama 1: Arquitectura del Sistema'),
  para('Representa la arquitectura cliente-servidor de SmartBooking con tres capas principales: el navegador ejecutando Angular 17, el servidor Docker con Symfony 7 y Doctrine ORM, y la base de datos MySQL 8.0.', { color: '555555' }),
  emptyRow(),
  buildDiagram1(),
  emptyRow(),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── DIAGRAMA 2 ───
elements.push(
  sectionTitle('Diagrama 2: Modelo de Entidad-Relación (ERD)'),
  para('Muestra las cuatro entidades principales de la base de datos y sus relaciones. Las claves primarias se marcan con 🔑 y las foráneas con 🔗.', { color: '555555' }),
  emptyRow(),
  buildDiagram2(),
  emptyRow(),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── DIAGRAMA 3 ───
elements.push(
  sectionTitle('Diagrama 3: Flujo General de la Aplicación'),
  para('Describe el flujo completo desde que el usuario accede a la pantalla de login hasta que navega por la SPA según su rol asignado.', { color: '555555' }),
  emptyRow(),
  buildDiagram3(),
  emptyRow(),
);

// ─── CREAR DOCUMENTO ───
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22 },
        paragraph: { spacing: { line: 276, before: 0, after: 160 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertMillimetersToTwip(20),
          right: convertMillimetersToTwip(20),
          bottom: convertMillimetersToTwip(20),
          left: convertMillimetersToTwip(20),
        },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'SmartBooking – Diagramas Técnicos  |  Página ', font: 'Calibri', size: 18, color: '888888' }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: '888888' }),
            new TextRun({ text: ' de ', font: 'Calibri', size: 18, color: '888888' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: '888888' }),
          ],
        })],
      }),
    },
    children: elements,
  }],
});

const outputPath = require('path').join(__dirname, 'Memoria_PFC_SmartBooking_Diagramas.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outputPath, buf);
  const kb = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log('OK Archivo generado: ' + outputPath);
  console.log('   Tamaño: ' + kb + ' KB');
  console.log('   Diagramas incluidos:');
  console.log('   1. Arquitectura del Sistema (Angular + Symfony + MySQL)');
  console.log('   2. Modelo Entidad-Relacion ERD (user, booking, resource, category)');
  console.log('   3. Flujo General de la Aplicacion (login → roles → SPA)');
}).catch(err => {
  console.error('ERROR: ' + err.message);
  process.exit(1);
});
