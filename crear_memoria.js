const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, PageNumber, Footer, Header,
  NumberingLevel, AbstractNumbering, Numbering, LevelFormat,
  convertInchesToTwip, convertMillimetersToTwip,
  UnderlineType, ShadingType, TableLayoutType,
  VerticalAlign, PageBreak, Tab
} = require('docx');

// Leer el archivo markdown con UTF-8
const mdPath = path.join(__dirname, 'MEMORIA_COMPLETA.md');
const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

// ===== HELPERS DE PARSEO DE INLINE MARKDOWN =====
function parseInline(text) {
  if (!text) return [new TextRun('')];
  const runs = [];
  // Procesar negrita+cursiva, negrita, cursiva, código inline
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index) }));
    }
    if (match[2]) { // bold+italic
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
    } else if (match[3]) { // bold
      runs.push(new TextRun({ text: match[3], bold: true }));
    } else if (match[4]) { // italic
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[5]) { // code inline
      runs.push(new TextRun({ text: match[5], font: 'Courier New', size: 18, shading: { type: ShadingType.CLEAR, color: 'E8E8E8', fill: 'E8E8E8' } }));
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIndex) }));
  }
  if (runs.length === 0) runs.push(new TextRun(''));
  return runs;
}

function cleanMdLinks(text) {
  // Limpiar [texto](url) -> texto
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

// ===== PARSEAR TABLAS MARKDOWN =====
function parseMarkdownTable(tableLines) {
  const rows = [];
  for (const line of tableLines) {
    if (line.match(/^\s*\|[-:| ]+\|\s*$/)) continue; // separator row
    const cells = line.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length > 0) rows.push(cells);
  }
  if (rows.length === 0) return null;
  
  const numCols = rows[0].length;
  const colWidth = Math.floor(9000 / numCols);
  
  const tableRows = rows.map((rowCells, rowIdx) => {
    return new TableRow({
      tableHeader: rowIdx === 0,
      children: rowCells.map(cell => new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        shading: rowIdx === 0 ? { type: ShadingType.CLEAR, color: '2E4057', fill: '2E4057' } : undefined,
        children: [new Paragraph({
          children: parseInline(cleanMdLinks(cell)),
          spacing: { before: 60, after: 60 },
          run: rowIdx === 0 ? { color: 'FFFFFF' } : undefined,
        })],
        width: { size: colWidth, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      }))
    });
  });
  
  // Fix header color
  const headerRow = rows[0];
  const fixedHeaderRow = new TableRow({
    tableHeader: true,
    children: headerRow.map(cell => new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, color: '2E4057', fill: '2E4057' },
      children: [new Paragraph({
        children: [new TextRun({ text: cell, bold: true, color: 'FFFFFF' })],
        spacing: { before: 60, after: 60 },
      })],
      width: { size: colWidth, type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
    }))
  });
  
  const bodyRows = rows.slice(1).map(rowCells => new TableRow({
    children: rowCells.map(cell => new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        children: parseInline(cleanMdLinks(cell)),
        spacing: { before: 60, after: 60 },
      })],
      width: { size: colWidth, type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
    }))
  }));

  return new Table({
    rows: [fixedHeaderRow, ...bodyRows],
    width: { size: 9000, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });
}

// ===== GENERAR ELEMENTOS DEL DOCUMENTO =====
const elements = [];

// ===== PORTADA =====
elements.push(
  new Paragraph({
    children: [],
    spacing: { before: 2000, after: 0 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: 'SmartBooking',
      bold: true,
      size: 72,
      color: '2E4057',
      font: 'Calibri',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: 'Sistema de Gestión de Reservas',
      size: 40,
      color: '4A6FA5',
      font: 'Calibri',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: '─────────────────────────────────────',
      color: '2E4057',
      size: 28,
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: 'Memoria del Proyecto Final de Ciclo',
      bold: true,
      size: 36,
      color: '333333',
      font: 'Calibri',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: 'Grado Superior – Desarrollo de Aplicaciones Web (DAW)',
      size: 28,
      color: '666666',
      font: 'Calibri',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 1000 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: 'Autor: Daniel Aguado',
      size: 26,
      font: 'Calibri',
      color: '444444',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: 'Centro: Florida Centre de Formació Coop. V.',
      size: 26,
      font: 'Calibri',
      color: '444444',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({
      text: 'Mayo 2026',
      size: 26,
      font: 'Calibri',
      color: '444444',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new PageBreak()],
  })
);

// ===== PARSEAR MARKDOWN =====
let i = 0;
let inCodeBlock = false;
let codeLines = [];
let inTable = false;
let tableLines = [];

while (i < lines.length) {
  const line = lines[i];
  
  // Bloques de código
  if (line.startsWith('```')) {
    if (!inCodeBlock) {
      inCodeBlock = true;
      codeLines = [];
      i++;
      continue;
    } else {
      inCodeBlock = false;
      // Crear párrafos de código
      if (codeLines.length > 0) {
        for (const codeLine of codeLines) {
          elements.push(new Paragraph({
            children: [new TextRun({
              text: codeLine || ' ',
              font: 'Courier New',
              size: 18,
            })],
            shading: { type: ShadingType.CLEAR, color: 'F4F4F4', fill: 'F4F4F4' },
            spacing: { before: 0, after: 0, line: 240 },
            indent: { left: 360 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 12, color: '2E4057' },
            },
          }));
        }
        elements.push(new Paragraph({ children: [new TextRun('')], spacing: { before: 100, after: 100 } }));
      }
      i++;
      continue;
    }
  }
  
  if (inCodeBlock) {
    codeLines.push(line);
    i++;
    continue;
  }
  
  // Detectar tablas
  if (line.match(/^\s*\|/) && !inTable) {
    inTable = true;
    tableLines = [line];
    i++;
    continue;
  }
  if (inTable) {
    if (line.match(/^\s*\|/)) {
      tableLines.push(line);
      i++;
      continue;
    } else {
      // Fin de tabla
      inTable = false;
      const table = parseMarkdownTable(tableLines);
      if (table) {
        elements.push(new Paragraph({ children: [], spacing: { before: 100, after: 0 } }));
        elements.push(table);
        elements.push(new Paragraph({ children: [], spacing: { before: 0, after: 200 } }));
      }
      tableLines = [];
      // No incrementar i, procesar línea actual
      continue;
    }
  }
  
  // Línea vacía o separador
  if (line.trim() === '' || line.trim() === '---') {
    if (line.trim() !== '---') {
      elements.push(new Paragraph({ children: [new TextRun('')], spacing: { before: 60, after: 60 } }));
    }
    i++;
    continue;
  }
  
  // Headings
  if (line.startsWith('# ')) {
    const text = cleanMdLinks(line.slice(2).trim());
    // Salto de página antes de heading 1 (excepto el primero que puede ser el título del índice)
    if (elements.length > 10) {
      elements.push(new Paragraph({ children: [new PageBreak()] }));
    }
    elements.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text, bold: true, size: 36, color: '2E4057', font: 'Calibri' })],
      spacing: { before: 400, after: 200 },
    }));
    i++;
    continue;
  }
  
  if (line.startsWith('## ')) {
    const text = cleanMdLinks(line.slice(3).trim());
    elements.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text, bold: true, size: 28, color: '4A6FA5', font: 'Calibri' })],
      spacing: { before: 300, after: 160 },
    }));
    i++;
    continue;
  }
  
  if (line.startsWith('### ')) {
    const text = cleanMdLinks(line.slice(4).trim());
    elements.push(new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun({ text, bold: true, size: 24, color: '5A7FA5', font: 'Calibri' })],
      spacing: { before: 200, after: 120 },
    }));
    i++;
    continue;
  }
  
  if (line.startsWith('#### ')) {
    const text = cleanMdLinks(line.slice(5).trim());
    elements.push(new Paragraph({
      heading: HeadingLevel.HEADING_4,
      children: [new TextRun({ text, bold: true, size: 22, color: '666666', font: 'Calibri' })],
      spacing: { before: 160, after: 80 },
    }));
    i++;
    continue;
  }
  
  // Listas con bullet (- o * o +)
  if (line.match(/^(\s*)([-*+])\s+/)) {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const text = cleanMdLinks(line.replace(/^\s*[-*+]\s+/, ''));
    elements.push(new Paragraph({
      children: [
        new TextRun({ text: '•  ', bold: false }),
        ...parseInline(text),
      ],
      indent: { left: 360 + indent * 180, hanging: 360 },
      spacing: { before: 60, after: 60 },
    }));
    i++;
    continue;
  }
  
  // Listas numeradas
  if (line.match(/^\d+\.\s+/)) {
    const num = line.match(/^(\d+)\.\s+/)[1];
    const text = cleanMdLinks(line.replace(/^\d+\.\s+/, ''));
    elements.push(new Paragraph({
      children: [
        new TextRun({ text: `${num}.  ` }),
        ...parseInline(text),
      ],
      indent: { left: 360, hanging: 360 },
      spacing: { before: 60, after: 60 },
    }));
    i++;
    continue;
  }
  
  // Párrafo normal
  const cleanedLine = cleanMdLinks(line.trim());
  if (cleanedLine) {
    elements.push(new Paragraph({
      children: parseInline(cleanedLine),
      spacing: { before: 60, after: 120 },
      alignment: AlignmentType.JUSTIFIED,
    }));
  }
  
  i++;
}

// Si quedó una tabla sin cerrar
if (inTable && tableLines.length > 0) {
  const table = parseMarkdownTable(tableLines);
  if (table) {
    elements.push(table);
  }
}

// ===== CREAR DOCUMENTO =====
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
          top: convertMillimetersToTwip(25),
          right: convertMillimetersToTwip(25),
          bottom: convertMillimetersToTwip(25),
          left: convertMillimetersToTwip(25),
        },
      },
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'SmartBooking – Memoria PFC  |  Página ', font: 'Calibri', size: 18, color: '888888' }),
              new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: '888888' }),
              new TextRun({ text: ' de ', font: 'Calibri', size: 18, color: '888888' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: '888888' }),
            ],
          }),
        ],
      }),
    },
    children: elements,
  }],
});

// ===== GUARDAR EL ARCHIVO =====
const outputPath = path.join(__dirname, 'Memoria_PFC_SmartBooking.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Archivo Word creado exitosamente:');
  console.log('   ' + outputPath);
  const stats = fs.statSync(outputPath);
  console.log('   Tamaño: ' + (stats.size / 1024).toFixed(1) + ' KB');
}).catch(err => {
  console.error('❌ Error al crear el Word:', err.message);
  process.exit(1);
});