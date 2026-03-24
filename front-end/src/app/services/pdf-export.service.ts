import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  public async exportElementToPdf(source: HTMLElement | null, title: string): Promise<void> {
    if (!source) {
      return;
    }

    const renderHost = await this.buildRenderHost(source, title);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageSections = Array.from(renderHost.querySelectorAll('.pdf-page-section')) as HTMLElement[];

      if (pageSections.length) {
        for (const [index, section] of pageSections.entries()) {
          if (index > 0) {
            pdf.addPage();
          }

          const canvas = await html2canvas(section, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false
          });

          this.addCanvasToPdf(pdf, canvas);
        }
      } else {
        const canvas = await html2canvas(renderHost, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false
        });

        this.addCanvasToPdf(pdf, canvas);
      }

      pdf.save(`${this.toSafeFileName(title)}.pdf`);
    } finally {
      renderHost.remove();
    }
  }

  private async buildRenderHost(source: HTMLElement, title: string): Promise<HTMLElement> {
    const clone = this.buildPdfContent(source);
    const host = document.createElement('div');
    const logoUrl = new URL('/leal-informatica-logo.svg', window.location.origin).href;
    const logoBase64 = await this.imageToBase64(logoUrl);
    const generatedAt = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());

    host.className = 'pdf-render-host';
    host.innerHTML = `
      <div class="pdf-render-shell">
        <div class="pdf-render-header">
          <div class="pdf-render-brand">
            <img src="${logoBase64}" alt="Logo">
          </div>
          <div class="pdf-render-heading">
            <p class="pdf-render-kicker">Gestão da Informação</p>
            <h1 class="pdf-render-title">${title}</h1>
            <p class="pdf-render-subtitle">Documento gerado em ${generatedAt}</p>
          </div>
        </div>
        <div class="pdf-render-content"></div>
      </div>
    `;

    host.querySelector('.pdf-render-content')?.appendChild(clone);
    document.body.appendChild(host);
    this.applyRenderStyles(host);
    return host;
  }

  private buildPdfContent(source: HTMLElement): HTMLElement {
    if (source.id === 'empresa-detalhes-pdf') {
      return this.buildEmpresaPdfContent(source);
    }

    const activePane = source.querySelector('.tab-pane.show.active, .tab-pane.active') as HTMLElement | null;
    const clone = (activePane ?? source).cloneNode(true) as HTMLElement;
    this.prepareClone(clone);
    return clone;
  }

  private buildEmpresaPdfContent(source: HTMLElement): HTMLElement {
    const wrapper = document.createElement('div');
    const dadosBasicos = source.querySelector('#home')?.cloneNode(true) as HTMLElement | null;
    const equipamentos = source.querySelector('#profile')?.cloneNode(true) as HTMLElement | null;

    if (dadosBasicos) {
      this.prepareClone(dadosBasicos);
      const basicsSection = document.createElement('section');
      basicsSection.className = 'pdf-page-section';
      basicsSection.appendChild(dadosBasicos);
      wrapper.appendChild(basicsSection);
    }

    if (equipamentos) {
      equipamentos.classList.remove('tab-pane', 'fade');
      equipamentos.classList.add('show', 'active');
      equipamentos.style.display = 'block';
      equipamentos.style.opacity = '1';

      const heading = document.createElement('div');
      heading.className = 'pdf-section-heading';
      heading.innerHTML = `
        <p class="pdf-section-kicker">Equipamentos</p>
      `;

      this.prepareClone(equipamentos);
      const equipmentSection = document.createElement('section');
      equipmentSection.className = 'pdf-page-section';
      equipmentSection.appendChild(heading);
      equipmentSection.appendChild(equipamentos);
      wrapper.appendChild(equipmentSection);
    }

    return wrapper;
  }

  private addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const pageBreakBottomGap = 14;
    const pageBreakTopGap = 12;
    const printableWidth = pageWidth - margin * 2;
    const imageHeight = (canvas.height * printableWidth) / canvas.width;
    const imageData = canvas.toDataURL('image/png');
    const usablePageHeight = pageHeight - margin - pageBreakBottomGap;

    let heightLeft = imageHeight;
    let position = margin;

    pdf.addImage(imageData, 'PNG', margin, position, printableWidth, imageHeight, undefined, 'FAST');
    heightLeft -= usablePageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imageHeight + margin + pageBreakTopGap;
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', margin, position, printableWidth, imageHeight, undefined, 'FAST');
      heightLeft -= usablePageHeight - pageBreakTopGap;
    }
  }

  private prepareClone(clone: HTMLElement): void {
    clone.querySelectorAll('.pdf-hide, .modal, #modal, button, select, input, textarea, .btn-close')
      .forEach((element) => element.remove());

    clone.querySelectorAll('.details-richtext, .details-text-content').forEach((element) => {
      const richTextWrapper = (element as HTMLElement).closest('[class*="col-"]') as HTMLElement | null;
      if (richTextWrapper) {
        richTextWrapper.classList.add('pdf-full-row');
      }

      const framedContainer = (element as HTMLElement).closest('.border, .rounded, .overflow-hidden, [style*="height"]') as HTMLElement | null;
      if (framedContainer) {
        framedContainer.classList.add('pdf-rich-container');
        framedContainer.removeAttribute('style');
      }
    });

    clone.querySelectorAll('a').forEach((anchor) => {
      const replacement = document.createElement('span');
      replacement.textContent = anchor.textContent ?? '';
      anchor.replaceWith(replacement);
    });
  }

  private applyRenderStyles(host: HTMLElement): void {
    Object.assign(host.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: '1120px',
      background: '#ffffff',
      zIndex: '-1',
      padding: '32px'
    });

    const style = document.createElement('style');
    style.textContent = `
      .pdf-render-shell {
        background: #ffffff;
        color: #111827;
        font-family: "Segoe UI", Arial, sans-serif;
        padding: 18px 22px 22px;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
      }

      .pdf-render-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 24px;
        padding-bottom: 18px;
        border-bottom: 2px solid #111827;
      }

      .pdf-render-brand {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 132px;
        min-height: 78px;
        padding: 12px 16px;
        border-radius: 20px;
        background: linear-gradient(135deg, #111827 0%, #2b3445 100%);
      }

      .pdf-render-brand img {
        max-width: 180px;
        max-height: 72px;
        object-fit: contain;
      }

      .pdf-render-heading {
        flex: 1;
        text-align: right;
      }

      .pdf-render-kicker {
        margin: 0;
        color: #9a6700;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }

      .pdf-render-title {
        margin: 8px 0 4px;
        color: #111827;
        font-size: 28px;
        line-height: 1.2;
        font-weight: 800;
      }

      .pdf-render-subtitle {
        margin: 0;
        color: #6b7280;
        font-size: 12px;
      }

      .pdf-section-heading {
        margin: 28px 0 14px;
        padding-top: 14px;
        border-top: 1px solid #e5e7eb;
      }

      .pdf-section-kicker {
        margin: 0;
        color: #9a6700;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .pdf-section-title {
        margin: 6px 0 0;
        color: #111827;
        font-size: 20px;
        font-weight: 800;
      }

      .pdf-render-content .row {
        display: flex !important;
        flex-wrap: wrap !important;
        margin-left: -10px !important;
        margin-right: -10px !important;
      }

      .pdf-render-content .row > * {
        box-sizing: border-box !important;
        padding-left: 10px !important;
        padding-right: 10px !important;
      }

      .pdf-render-content .row.g-4 > *,
      .pdf-render-content .row.gx-4 > * {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }

      .pdf-render-content .row.g-4 > *,
      .pdf-render-content .row.gy-4 > * {
        margin-bottom: 20px !important;
      }

      .pdf-render-content .col-12 {
        width: 100% !important;
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }

      .pdf-render-content .col-sm-6,
      .pdf-render-content .col-md-6 {
        width: 50% !important;
        flex: 0 0 50% !important;
      }

      .pdf-render-content .col-md-4,
      .pdf-render-content .col-lg-4 {
        width: 33.333333% !important;
        flex: 0 0 33.333333% !important;
      }

      .pdf-render-content .col-lg-3 {
        width: 25% !important;
        flex: 0 0 25% !important;
      }

      .pdf-render-content .col-xl-8 {
        width: 66.666667% !important;
        flex: 0 0 66.666667% !important;
      }

      .pdf-render-content .col-xl-4 {
        width: 33.333333% !important;
        flex: 0 0 33.333333% !important;
      }

      .pdf-render-content .pdf-full-row {
        width: 100% !important;
        flex: 0 0 100% !important;
        max-width: 100% !important;
        order: 99 !important;
        margin-top: 12px;
      }

      .pdf-render-content .pdf-full-row .border,
      .pdf-render-content .pdf-full-row.border {
        border: none !important;
        box-shadow: none !important;
      }

      .pdf-render-content .pdf-full-row .rounded,
      .pdf-render-content .pdf-full-row.rounded,
      .pdf-render-content .pdf-full-row .overflow-hidden {
        border-radius: 0 !important;
        overflow: visible !important;
      }

      .pdf-render-content .pdf-rich-container {
        border: none !important;
        border-radius: 0 !important;
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin-bottom: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
      }

      .pdf-render-content [class*="col-"] > .border,
      .pdf-render-content [class*="col-"] > .rounded,
      .pdf-render-content [class*="col-"] > .card,
      .pdf-render-content [class*="col-"] > .details-section,
      .pdf-render-content [class*="col-"] > .details-panel {
        padding: 14px 16px !important;
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .pdf-render-content label {
        display: block;
        margin-bottom: 6px;
        color: #9a6700 !important;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .pdf-render-content h6,
      .pdf-render-content p,
      .pdf-render-content div,
      .pdf-render-content span {
        color: #4b5563;
      }

      .pdf-render-content h1,
      .pdf-render-content h2,
      .pdf-render-content h3,
      .pdf-render-content h4,
      .pdf-render-content h5,
      .pdf-render-content h6,
      .pdf-render-content strong {
        color: #111827 !important;
      }

      .pdf-render-content h6 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        min-height: 0 !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .pdf-render-content .details-infra-shell,
      .pdf-render-content .details-table-shell,
      .pdf-render-content .details-divider {
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .pdf-render-content hr {
        margin: 16px 0;
        border: 0;
        border-top: 1px solid #e5e7eb;
      }

      .pdf-render-content table {
        width: 100% !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
      }

      .pdf-render-content thead th {
        padding: 10px 12px !important;
        background: #f3f4f6 !important;
        color: #111827 !important;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .pdf-render-content tbody td {
        padding: 10px 12px !important;
        color: #374151 !important;
        border-top: 1px solid #e5e7eb !important;
        background: #ffffff !important;
      }

      .pdf-render-content tbody tr:nth-child(even) td {
        background: #fafafa !important;
      }

      .pdf-render-content .details-richtext,
      .pdf-render-content .details-text-content {
        border: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .pdf-render-content .details-richtext strong,
      .pdf-render-content .details-richtext b {
        font-weight: 700;
      }

      .pdf-render-content .details-richtext p,
      .pdf-render-content .details-richtext ul,
      .pdf-render-content .details-richtext ol,
      .pdf-render-content .details-richtext blockquote,
      .pdf-render-content .details-richtext pre {
        margin: 0 0 12px;
      }

      .pdf-render-content .details-richtext ul,
      .pdf-render-content .details-richtext ol {
        padding-left: 24px;
      }

      .pdf-render-content .details-richtext ul {
        list-style: disc;
      }

      .pdf-render-content .details-richtext ol {
        list-style: decimal;
      }

      .pdf-render-content .details-richtext blockquote {
        margin-left: 0;
        border-left: 4px solid #d99e04;
        padding-left: 12px;
        color: #475569;
      }

      .pdf-render-content .details-richtext pre {
        padding: 12px 16px;
        border-radius: 12px;
        background: #f8fafc !important;
        white-space: pre-wrap;
      }

      .pdf-render-content .nav,
      .pdf-render-content .nav-tabs,
      .pdf-render-content .pdf-hide,
      .pdf-render-content button,
      .pdf-render-content select,
      .pdf-render-content input,
      .pdf-render-content textarea,
      .pdf-render-content .modal,
      .pdf-render-content #modal {
        display: none !important;
      }
    `;

    host.appendChild(style);
  }

  private async imageToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private toSafeFileName(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[<>:"/\\|?*]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
}
