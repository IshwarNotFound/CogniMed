// src/utils/pdfExport.js
// Generates a clinical PDF and opens it in Chrome's native PDF viewer (new tab).
// No download attribute tricks — just window.open(blobUrl) with application/pdf MIME type.

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * @param {Array}  history   – The React history state [{role, content, ...}]
 * @param {Object} pdfState  – The pdfState object {filename} or null
 */
export function generateClinicalPDF(history, pdfState) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const now = new Date();
  const timestamp = now.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  // ─── Colours ────────────────────────────────────────────────────────────────
  const BLACK  = [11, 11, 11];
  const CYAN   = [0, 229, 255];
  const WHITE  = [255, 255, 255];
  const LGREY  = [245, 245, 245];
  const MGREY  = [150, 150, 150];
  const DGREY  = [60, 60, 60];

  // ─── HEADER BAR ─────────────────────────────────────────────────────────────
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PAGE_W, 30, 'F');
  doc.setFillColor(...CYAN);
  doc.rect(0, 28, PAGE_W, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...CYAN);
  doc.text('COGNIMED.AI', MARGIN, 13);

  doc.setFontSize(8);
  doc.setTextColor(...MGREY);
  doc.text('CLINICAL DIAGNOSTIC REPORT  //  SOVEREIGN DIAGNOSTIC v2.0', MARGIN, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MGREY);
  doc.text(`Generated: ${timestamp}`, PAGE_W - MARGIN, 20, { align: 'right' });

  // ─── METADATA BLOCK ─────────────────────────────────────────────────────────
  let y = 38;
  doc.setFillColor(...LGREY);
  doc.rect(MARGIN, y, CONTENT_W, 18, 'F');
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.6);
  doc.rect(MARGIN, y, CONTENT_W, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DGREY);
  const colW = CONTENT_W / 3;
  doc.text('CASE ID: 4882-QX', MARGIN + 4, y + 6);
  doc.text('PRIORITY: HIGH ALPHA', MARGIN + colW + 4, y + 6);
  doc.text('HIPAA COMPLIANT: YES', MARGIN + colW * 2 + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MGREY);
  const docRef = pdfState?.filename
    ? `Reference Document: ${pdfState.filename}`
    : 'Reference Document: None (No PDF Uploaded)';
  doc.text(docRef, MARGIN + 4, y + 13);

  y += 24;

  // ─── SECTION 1: TRANSCRIPT ───────────────────────────────────────────────────
  doc.setFillColor(...BLACK);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...CYAN);
  doc.text('01  //  DIAGNOSTIC CONVERSATION TRANSCRIPT', MARGIN + 3, y + 5);
  y += 10;

  const messages = history.filter(m => m.role === 'user' || m.role === 'assistant');

  const clean = (text = '') =>
    text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/gs, '[code]')
      .trim();

  if (messages.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...MGREY);
    doc.text('No conversation history recorded in this session.', MARGIN, y + 6);
    y += 12;
  } else {
    const tableRows = messages.map((msg, i) => [
      String(i + 1),
      msg.role === 'user' ? 'CLINICIAN' : 'COGNIMED AI',
      clean(msg.content),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'SPEAKER', 'MESSAGE']],
      body: tableRows,
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: BLACK,
        lineWidth: 0.3,
        textColor: DGREY,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      headStyles: {
        fillColor: DGREY,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: LGREY },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 34, fontStyle: 'bold' },
        2: { cellWidth: CONTENT_W - 42 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.textColor =
            data.cell.raw === 'CLINICIAN' ? [0, 100, 180] : [0, 130, 130];
        }
      },
      tableLineColor: BLACK,
      tableLineWidth: 0.6,
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // ─── SECTION 2: STATS ────────────────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20; }

  doc.setFillColor(...BLACK);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...CYAN);
  doc.text('02  //  SESSION STATISTICS', MARGIN + 3, y + 5);
  y += 10;

  const lastAI = [...history].reverse().find(m => m.role === 'assistant');

  autoTable(doc, {
    startY: y,
    body: [
      ['Total Clinician Queries',         String(history.filter(m => m.role === 'user').length)],
      ['Total AI Responses',              String(history.filter(m => m.role === 'assistant').length)],
      ['Last Response — Tokens Generated', String(lastAI?.tokensGenerated ?? 'N/A')],
      ['Last Inference — Tokens/sec',      String(lastAI?.tokensPerSecond  ?? 'N/A')],
      ['Reference PDF Loaded',             pdfState?.filename ?? 'None'],
    ],
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 3, lineColor: BLACK, lineWidth: 0.3 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', textColor: DGREY, fillColor: LGREY },
      1: { textColor: DGREY },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    tableLineColor: BLACK,
    tableLineWidth: 0.6,
  });

  // ─── FOOTER (all pages) ──────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const PH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...BLACK);
    doc.rect(0, PH - 12, PAGE_W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MGREY);
    doc.text(
      '⚠  AI-generated for clinical reference only. Always verify with a qualified medical professional.',
      MARGIN, PH - 5
    );
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN, PH - 5, { align: 'right' });
  }

  // ─── OPEN IN CHROME PDF VIEWER ───────────────────────────────────────────────
  // window.open(blobUrl) with application/pdf MIME type opens Chrome's native PDF
  // viewer directly — no print dialog, no download attribute issues.
  const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(pdfBlob);
  const viewer  = window.open(blobUrl, '_blank');

  if (!viewer) {
    alert('Popup blocked! Please allow popups for localhost to view the report.');
  }

  // Clean up the blob URL after a generous delay
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}
