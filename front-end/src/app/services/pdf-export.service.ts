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

    let renderHost: HTMLElement | null = null;

    try {
      renderHost = await this.buildRenderHost(source, title);
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
      renderHost?.remove();
    }
  }

  private async buildRenderHost(source: HTMLElement, title: string): Promise<HTMLElement> {
    const clone = this.buildPdfContent(source);
    const host = document.createElement('div');
    let logoBase64 = '';
    try {
      const logoUrl = new URL('/leal-informatica-logo.svg', window.location.origin).href;
      logoBase64 = await this.imageToBase64(logoUrl);
    } catch {
      logoBase64 = '';
    }
    const generatedAt = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());

    host.className = 'pdf-render-host';
    const pageSections = Array.from(clone.querySelectorAll('.pdf-page-section')) as HTMLElement[];

    if (pageSections.length) {
      clone.classList.add('pdf-render-content');
      pageSections.forEach((section) => {
        section.prepend(this.createPdfHeader(logoBase64, title, generatedAt));
      });
      host.appendChild(clone);
    } else {
      host.innerHTML = `
      <div class="pdf-render-shell">
        <div class="pdf-render-header">
          <div class="pdf-render-brand">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : `<span class="pdf-render-brand-text">GI</span>`}
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
    }

    document.body.appendChild(host);
    this.applyRenderStyles(host);
    this.rebalanceCommercialItemPages(host);
    this.normalizeColorsForCanvas(host);
    return host;
  }

  private buildPdfContent(source: HTMLElement): HTMLElement {
    if (source.id === 'empresa-detalhes-pdf') {
      return this.buildEmpresaPdfContent(source);
    }

    if (source.id === 'atendimento-detalhes-pdf') {
      return this.buildAtendimentoPdfContent(source);
    }

    if (source.id === 'manutencao-detalhes-pdf') {
      return this.buildManutencaoPdfContent(source);
    }

    if (source.id === 'comercial-detalhes-pdf') {
      return this.buildComercialSelectedPdfContent(source);
    }

    if (source.id === 'avulso-detalhes-pdf') {
      return this.buildAvulsoSelectedPdfContent(source);
    }

    if (
      source.id === 'equipamento-detalhes-pdf'
    ) {
      const activeTabPane = source.querySelector('.tab-pane.show.active, .tab-pane.active') as HTMLElement | null;
      const genericClone = (activeTabPane ?? source).cloneNode(true) as HTMLElement;
      this.prepareClone(genericClone);
      this.replaceTablesWithContent(genericClone);
      return genericClone;
    }

    if (source.id === 'equipamento-detalhes-pdf') {
      return this.buildTabbedSemanticPdfContent(source, [
        { paneId: '#home' },
        { paneId: '#profile', title: 'Manutenções', tablesOnly: true }
      ]);
    }

    if (source.id === 'atendimento-detalhes-pdf' || source.id === 'manutencao-detalhes-pdf' || source.id === 'avulso-detalhes-pdf') {
      return this.buildTabbedSemanticPdfContent(source, [
        { paneId: '#home' }
      ]);
    }

    if (source.id === 'comercial-detalhes-pdf') {
      return this.buildComercialPdfContent(source);
    }

    const activePane = source.querySelector('.tab-pane.show.active, .tab-pane.active') as HTMLElement | null;
    const clone = (activePane ?? source).cloneNode(true) as HTMLElement;
    this.prepareClone(clone);
    this.replaceTablesWithContent(clone);
    return clone;
  }

  private buildAtendimentoPdfContent(source: HTMLElement): HTMLElement {
    return this.buildTabbedSemanticPdfContent(source, [
      { paneId: '#home' }
    ]);
  }

  private buildManutencaoPdfContent(source: HTMLElement): HTMLElement {
    return this.buildTabbedSemanticPdfContent(source, [
      { paneId: '#home' }
    ]);
  }

  private buildComercialSelectedPdfContent(source: HTMLElement): HTMLElement {
    const wrapper = document.createElement('div');
    const isVenda = this.isCommercialVenda(source, source);
    const firstSection = document.createElement('section');
    firstSection.className = 'pdf-render-shell pdf-page-section';

    const summaryFields = this.buildFieldGridFromEntries(
      this.extractCommercialSummaryEntries(source),
      'Resumo'
    );
    if (summaryFields) {
      firstSection.appendChild(summaryFields);
    }

    const buyerFields = this.buildFieldGridFromEntries(
      this.extractCommercialBuyerEntries(source),
      'Dados do comprador'
    );
    if (buyerFields) {
      firstSection.appendChild(buyerFields);
    }

    const configFields = this.buildFieldGridFromEntries(
      this.extractCommercialConfigEntries(source, isVenda),
      isVenda ? 'Dados da venda' : 'Dados do orcamento'
    );
    if (configFields) {
      firstSection.appendChild(configFields);
    }

    const itemsPages = this.buildCommercialItemsPagesFromCards(source, isVenda);
    if (itemsPages.length) {
      const firstItemsBlock = itemsPages.shift();
      if (firstItemsBlock) {
        firstSection.appendChild(firstItemsBlock);
      }
    }

    const closingBlock = this.buildFieldGridFromEntries(
      this.extractCommercialClosingEntries(source, isVenda),
      'Fechamento'
    );
    if (closingBlock) {
      const finalItemsPage = itemsPages[itemsPages.length - 1];
      (finalItemsPage ?? firstSection).appendChild(closingBlock);
    }

    const linkedSaleFields = this.buildFieldGridFromEntries(
      this.extractCommercialLinkedSaleEntries(source),
      'Venda gerada'
    );
    if (linkedSaleFields) {
      const finalTarget = itemsPages[itemsPages.length - 1] ?? firstSection;
      finalTarget.appendChild(linkedSaleFields);
    }

    wrapper.appendChild(firstSection);
    itemsPages.forEach((itemsPage) => wrapper.appendChild(itemsPage));
    return wrapper;
  }

  private buildAvulsoSelectedPdfContent(source: HTMLElement): HTMLElement {
    const activePane = source.querySelector('.tab-pane.show.active, .tab-pane.active') as HTMLElement | null;
    const clone = (activePane ?? source).cloneNode(true) as HTMLElement;
    this.prepareClone(clone);
    this.removeObservationFields(clone);

    const wrapper = document.createElement('div');
    const section = document.createElement('section');
    section.className = 'pdf-render-shell pdf-page-section';

    const buyerFields = this.buildFieldGridFromLabels(clone, [
      ['Nome do Cliente', 'Nome Fantasia'],
      ['CPF/CNPJ']
    ], 'Dados do comprador', ['Nome', 'Documento']);
    if (buyerFields) {
      section.appendChild(buyerFields);
    }

    const orderFields = this.buildFieldGridFromLabels(clone, [
      ['Inicio do Servico'],
      ['Fim do Servico'],
      ['Tipo de Atendimento'],
      ['Status do Atendimento'],
      ['Total']
    ], 'Dados da ordem de servico');
    if (orderFields) {
      section.appendChild(orderFields);
    }

    const descriptionField = this.buildFieldGridFromLabels(clone, [
      ['Descricao']
    ], 'Descricao');
    if (descriptionField) {
      section.appendChild(descriptionField);
    }

    wrapper.appendChild(section);
    return wrapper;
  }

  private removeObservationFields(clone: HTMLElement): void {
    Array.from(clone.querySelectorAll('label')).forEach((label) => {
      const text = label.textContent?.trim().toLowerCase();
      if (!text || !text.includes('observa')) {
        return;
      }

      const block =
        (label.closest('.full') as HTMLElement | null) ??
        (label.closest('[class*="col-"]') as HTMLElement | null) ??
        label.parentElement;

      block?.remove();
    });
  }

  private replaceTablesWithContent(root: HTMLElement): void {
    Array.from(root.querySelectorAll('table')).forEach((tableElement) => {
      const table = tableElement as HTMLTableElement;
      table.replaceWith(this.buildTableContent(table));
    });
  }

  private removeVendaGeradaTables(root: HTMLElement): void {
    Array.from(root.querySelectorAll('table')).forEach((tableElement) => {
      const headers = Array.from(tableElement.querySelectorAll('thead th'))
        .map((cell) => this.normalizeTableHeader(cell.textContent || ''));

      const isInstallmentTable =
        headers.includes('parcela') &&
        headers.includes('vencimento') &&
        headers.includes('status') &&
        headers.includes('previsto') &&
        headers.includes('pago') &&
        headers.includes('saldo');

      if (!isInstallmentTable) {
        return;
      }

      const container =
        (tableElement.closest('.table-responsive') as HTMLElement | null) ??
        (tableElement.closest('.editor-card') as HTMLElement | null) ??
        tableElement;

      if (container.classList.contains('editor-card')) {
        tableElement.remove();
      } else {
        container.remove();
      }
    });
  }

  private moveCommercialItemsToEnd(root: HTMLElement): void {
    const itemsSection = Array.from(root.querySelectorAll('.editor-card, section'))
      .find((element) => element.querySelector('h3')?.textContent?.trim().toLowerCase().startsWith('itens do'));

    if (!itemsSection || !itemsSection.parentElement) {
      return;
    }

    itemsSection.parentElement.appendChild(itemsSection);
  }

  private isCommercialVenda(source: HTMLElement, clone: HTMLElement): boolean {
    const sourceText = source.textContent?.toLowerCase() || '';
    return sourceText.includes('pdv') || !!this.findSectionByTitle(clone, ['Venda gerada']);
  }

  private buildCommercialItemsPages(clone: HTMLElement, isVenda: boolean): HTMLElement[] {
    const itemsSection = Array.from(clone.querySelectorAll('.editor-card, section'))
      .find((element) => element.querySelector('h3')?.textContent?.trim().toLowerCase().startsWith('itens do'));
    const table = itemsSection?.querySelector('table') as HTMLTableElement | null;
    if (!table) {
      return [];
    }

    const headerCells = Array.from(table.querySelectorAll('thead th'))
      .map((cell) => cell.textContent?.trim() || '');
    const commercialColumns = this.resolveCommercialTableColumns(headerCells);
    if (!commercialColumns?.length) {
      return [];
    }

    const rows = Array.from(table.querySelectorAll('tbody tr'))
      .map((row) => this.extractCommercialItemRow(row, commercialColumns))
      .filter((row): row is Array<{ label: string; value: string }> => row.length > 0);

    if (!rows.length) {
      return [];
    }

    const pages: HTMLElement[] = [];
    const firstPageItems = 10;
    const nextPageItems = 10;
    let index = 0;

    const firstRows = rows.slice(0, firstPageItems);
    if (firstRows.length) {
      pages.push(this.createCommercialItemsBlock(firstRows, false, isVenda));
      index = firstPageItems;
    }

    while (index < rows.length) {
      const pageRows = rows.slice(index, index + nextPageItems);
      const page = document.createElement('section');
      page.className = 'pdf-render-shell pdf-page-section';
      page.appendChild(this.createCommercialItemsBlock(pageRows, true, isVenda));
      pages.push(page);
      index += nextPageItems;
    }

    return pages;
  }

  private rebalanceCommercialItemPages(host: HTMLElement): void {
    const pageSections = Array.from(host.querySelectorAll('.pdf-page-section')) as HTMLElement[];
    const itemSections = pageSections.filter((section) => section.querySelector('.pdf-commercial-items'));
    if (!itemSections.length) {
      return;
    }

    const firstSection = itemSections[0];
    const firstBlock =
      (Array.from(firstSection.querySelectorAll('.pdf-section-heading')).find((element) =>
        element.querySelector('.pdf-commercial-items')
      ) as HTMLElement | undefined) ?? null;
    const firstList = firstSection.querySelector('.pdf-commercial-items') as HTMLElement | null;
    if (!firstBlock || !firstList) {
      return;
    }

    const closingBlocks = itemSections.flatMap((section) =>
      Array.from(section.querySelectorAll(':scope > .pdf-commercial-closing')) as HTMLElement[]
    );
    const headerTemplate = firstSection.querySelector('.pdf-render-header')?.cloneNode(true) as HTMLElement | null;
    const allRows = itemSections.flatMap((section) =>
      Array.from(section.querySelectorAll('.pdf-commercial-item-row')) as HTMLElement[]
    );

    closingBlocks.forEach((block) => block.remove());
    itemSections.slice(1).forEach((section) => section.remove());
    firstList.replaceChildren();

    let rowIndex = this.fillCommercialItemsSection(firstSection, firstList, allRows, 0);

    if (!firstList.children.length) {
      firstBlock.remove();
    }

    let insertAfter: HTMLElement = firstSection;
    while (rowIndex < allRows.length) {
      const nextSection = document.createElement('section');
      nextSection.className = 'pdf-render-shell pdf-page-section';

      if (headerTemplate) {
        nextSection.appendChild(headerTemplate.cloneNode(true));
      }

      const itemsBlock = document.createElement('div');
      itemsBlock.className = 'pdf-section-heading';
      itemsBlock.innerHTML = '<p class="pdf-section-kicker">Itens continuacao</p>';

      const itemsList = document.createElement('div');
      itemsList.className = 'pdf-commercial-items';
      itemsBlock.appendChild(itemsList);
      nextSection.appendChild(itemsBlock);

      insertAfter.insertAdjacentElement('afterend', nextSection);
      insertAfter = nextSection;

      rowIndex = this.fillCommercialItemsSection(nextSection, itemsList, allRows, rowIndex);
      if (!itemsList.children.length && rowIndex < allRows.length) {
        itemsList.appendChild(allRows[rowIndex]);
        rowIndex += 1;
      }
    }

    const lastSection = (Array.from(host.querySelectorAll('.pdf-page-section')).pop() as HTMLElement | undefined) ?? firstSection;
    closingBlocks.forEach((block) => lastSection.appendChild(block));
  }

  private fillCommercialItemsSection(
    section: HTMLElement,
    list: HTMLElement,
    rows: HTMLElement[],
    startIndex: number
  ): number {
    let index = startIndex;

    while (index < rows.length) {
      const row = rows[index];
      list.appendChild(row);

      if (section.scrollHeight > section.clientHeight) {
        list.removeChild(row);
        break;
      }

      index += 1;
    }

    return index;
  }

  private createCommercialItemsBlock(
    rows: Array<Array<{ label: string; value: string }>>,
    continuation: boolean,
    isVenda: boolean
  ): HTMLElement {
    const block = document.createElement('div');
    block.className = 'pdf-section-heading';
    const sectionTitle = continuation
      ? `Itens ${isVenda ? 'da venda' : 'do orçamento'} continuacao`
      : `Itens ${isVenda ? 'da venda' : 'do orçamento'}`;
    block.innerHTML = `<p class="pdf-section-kicker">${sectionTitle}</p>`;

    const list = document.createElement('div');
    list.className = 'pdf-commercial-items';

    rows.forEach((row, rowIndex) => {
      const itemRow = document.createElement('div');
      itemRow.className = 'pdf-commercial-item-row';
      if (rowIndex > 0 || continuation) {
        itemRow.classList.add('pdf-commercial-item-row-compact');
      }

      row.forEach((fieldData) => {
        const field = document.createElement('div');
        field.className = 'pdf-commercial-item-field';

        if (rowIndex === 0 && !continuation) {
          const label = document.createElement('label');
          label.textContent = fieldData.label;
          field.appendChild(label);
        }

        const value = document.createElement('p');
        value.textContent = fieldData.value;
        field.appendChild(value);
        itemRow.appendChild(field);
      });

      list.appendChild(itemRow);
    });

    block.appendChild(list);
    return block;
  }

  private buildCommercialClosingBlock(clone: HTMLElement, isVenda: boolean): HTMLElement | null {
    const fieldGroups = isVenda
      ? [
          ['Total', 'Total atual'],
          ['Forma de pagamento']
        ]
      : [
          ['Validade'],
          ['Total atual', 'Total'],
          ['Forma de pagamento']
        ];

    const closingBlock = this.buildFieldGridFromLabels(clone, fieldGroups, 'Fechamento');
    if (!closingBlock) {
      return null;
    }

    closingBlock.classList.add('pdf-commercial-closing');
    return closingBlock;
  }

  private extractCommercialItemRow(
    row: Element,
    columns: Array<{ index: number; label: string }>
  ): Array<{ label: string; value: string }> {
    const cells = Array.from(row.querySelectorAll('td, th'));
    if (!cells.length) {
      return [];
    }

    return columns
      .map((column) => ({
        label: column.label,
        value: this.extractTableCellValue(cells[column.index], {
          excludeSmall: column.label === 'Catalogo'
        })
      }))
      .filter((field) => !!field.value);
  }

  private buildFieldGridFromLabels(
    scope: HTMLElement | null,
    labelGroups: string[][],
    title: string,
    displayLabels?: string[]
  ): HTMLElement | null {
    if (!scope) {
      return null;
    }

    const entries = labelGroups
      .map((group, index) => {
        const field = this.findFieldByLabel(scope, group);
        if (!field) {
          return null;
        }

        return {
          label: displayLabels?.[index] || field.label,
          value: field.value,
          rich: field.rich
        };
      })
      .filter((entry): entry is { label: string; value: string; rich: boolean } => !!entry);

    if (!entries.length) {
      return null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-section-heading';
    wrapper.innerHTML = `<p class="pdf-section-kicker">${title}</p>`;

    const grid = document.createElement('div');
    grid.className = 'row g-3';

    entries.forEach((entry) => {
      const field = document.createElement('div');
      field.className = entry.rich ? 'col-12 pdf-full-row' : 'col-lg-4 col-md-6 col-12';
      field.appendChild(this.createStaticPdfField(entry.label, entry.value, entry.rich));
      grid.appendChild(field);
    });

    wrapper.appendChild(grid);
    return wrapper;
  }

  private buildFieldGridFromEntries(
    entries: Array<{ label: string; value: string; rich?: boolean }>,
    title: string
  ): HTMLElement | null {
    const normalizedEntries = entries.filter((entry) => !!entry.label && !!entry.value && entry.value !== '-');
    if (!normalizedEntries.length) {
      return null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-section-heading';
    wrapper.innerHTML = `<p class="pdf-section-kicker">${title}</p>`;

    const grid = document.createElement('div');
    grid.className = 'row g-3';

    normalizedEntries.forEach((entry) => {
      const field = document.createElement('div');
      field.className = entry.rich ? 'col-12 pdf-full-row' : 'col-lg-4 col-md-6 col-12';
      field.appendChild(this.createStaticPdfField(entry.label, entry.value, !!entry.rich));
      grid.appendChild(field);
    });

    wrapper.appendChild(grid);
    return wrapper;
  }

  private extractCommercialSummaryEntries(source: HTMLElement): Array<{ label: string; value: string }> {
    return Array.from(source.querySelectorAll('.summary-card'))
      .map((card) => ({
        label: card.querySelector('span')?.textContent?.trim() || '',
        value: card.querySelector('strong')?.textContent?.trim() || ''
      }))
      .filter((entry) => !!entry.label && !!entry.value);
  }

  private extractCommercialBuyerEntries(source: HTMLElement): Array<{ label: string; value: string }> {
    const buyerScope = source.querySelector('.pdv-cliente-section, .consumer-section') as HTMLElement | null;
    if (!buyerScope) {
      return [];
    }

    return [
      { label: 'Cliente', value: this.findControlValueByLabel(buyerScope, ['Cliente']) },
      { label: 'Documento', value: this.findControlValueByLabel(buyerScope, ['Documento']) }
    ].filter((entry) => !!entry.value && entry.value !== '-');
  }

  private extractCommercialConfigEntries(
    source: HTMLElement,
    isVenda: boolean
  ): Array<{ label: string; value: string; rich?: boolean }> {
    const entries: Array<{ label: string; value: string; rich?: boolean }> = [];

    if (!isVenda) {
      const configScope = source.querySelector('.pdv-config-section') as HTMLElement | null;
      if (configScope) {
        const simpleEntries = [
          { label: 'Validade', value: this.findControlValueByLabel(configScope, ['Validade']) },
          { label: 'Desconto financeiro', value: this.findControlValueByLabel(configScope, ['Desconto financeiro', 'Desconto']) },
          { label: 'Acrescimo financeiro', value: this.findControlValueByLabel(configScope, ['Acrescimo financeiro']) },
          { label: 'Motivo da rejeicao', value: this.findControlValueByLabel(configScope, ['Motivo da rejeicao']) }
        ];
        entries.push(...simpleEntries.filter((entry) => !!entry.value && entry.value !== '-'));

        const observacoes = this.findControlValueByLabel(configScope, ['Observacoes']);
        if (observacoes && observacoes !== '-') {
          entries.push({ label: 'Observacoes', value: observacoes, rich: true });
        }
      }
    }

    return entries;
  }

  private extractCommercialClosingEntries(source: HTMLElement, isVenda: boolean): Array<{ label: string; value: string }> {
    const totals = Array.from(source.querySelectorAll('.totals-panel > div'))
      .map((item) => ({
        label: item.querySelector('span')?.textContent?.trim() || '',
        value: item.querySelector('strong')?.textContent?.trim() || ''
      }))
      .filter((entry) => !!entry.label && !!entry.value);

    if (isVenda) {
      return totals;
    }

    const configScope = source.querySelector('.pdv-config-section') as HTMLElement | null;
    const extras = configScope
      ? [
          { label: 'Desconto financeiro', value: this.findControlValueByLabel(configScope, ['Desconto financeiro', 'Desconto']) },
          { label: 'Acrescimo financeiro', value: this.findControlValueByLabel(configScope, ['Acrescimo financeiro']) }
        ].filter((entry) => !!entry.value && entry.value !== '-')
      : [];

    return [...totals, ...extras];
  }

  private extractCommercialLinkedSaleEntries(source: HTMLElement): Array<{ label: string; value: string }> {
    const scope = source.querySelector('.pdv-linked-sale') as HTMLElement | null;
    if (!scope) {
      return [];
    }

    return Array.from(scope.querySelectorAll('.summary-card'))
      .map((card) => ({
        label: card.querySelector('span')?.textContent?.trim() || '',
        value: card.querySelector('strong')?.textContent?.trim() || ''
      }))
      .filter((entry) => !!entry.label && !!entry.value);
  }

  private buildCommercialItemsPagesFromCards(source: HTMLElement, isVenda: boolean): HTMLElement[] {
    const rows = Array.from(source.querySelectorAll('.pdv-cart-item'))
      .map((itemCard) => this.extractCommercialItemRowFromCard(itemCard as HTMLElement, isVenda))
      .filter((row) => row.length > 0);

    if (!rows.length) {
      return [];
    }

    const pages: HTMLElement[] = [];
    const firstPageItems = 10;
    const nextPageItems = 10;
    let index = 0;

    const firstRows = rows.slice(0, firstPageItems);
    if (firstRows.length) {
      pages.push(this.createCommercialItemsBlock(firstRows, false, isVenda));
      index = firstPageItems;
    }

    while (index < rows.length) {
      const pageRows = rows.slice(index, index + nextPageItems);
      const page = document.createElement('section');
      page.className = 'pdf-render-shell pdf-page-section';
      page.appendChild(this.createCommercialItemsBlock(pageRows, true, isVenda));
      pages.push(page);
      index += nextPageItems;
    }

    return pages;
  }

  private extractCommercialItemRowFromCard(
    card: HTMLElement,
    isVenda: boolean
  ): Array<{ label: string; value: string }> {
    const nome = card.querySelector('.pdv-cart-item__info strong')?.textContent?.trim() || '';
    const valorUnitario = card.querySelector('.pdv-cart-item__info small')?.textContent?.trim() || '';
    const quantidadeInput = card.querySelector('.pdv-quantity-stepper input') as HTMLInputElement | null;
    const quantidade = quantidadeInput?.value?.trim() || '';

    const fields: Array<{ label: string; value: string }> = [
      { label: 'Item', value: nome },
      { label: 'Valor unitario', value: valorUnitario },
      { label: 'Quantidade', value: quantidade }
    ];

    if (!isVenda) {
      const valorDesconto = this.findControlValueByLabel(card, ['Valor desconto']);
      const totalItem = card.querySelector('.pdv-cart-item__total strong')?.textContent?.trim() || '';

      if (valorDesconto && valorDesconto !== '-') {
        fields.push({ label: 'Valor desconto', value: valorDesconto });
      }

      if (totalItem) {
        fields.push({ label: 'Total do item', value: totalItem });
      }
    }

    return fields.filter((field) => !!field.value);
  }

  private findControlValueByLabel(scope: HTMLElement, candidateLabels: string[]): string {
    const normalizedCandidates = candidateLabels.map((label) => this.normalizeTableHeader(label));
    const containers = Array.from(scope.querySelectorAll('mat-form-field, .mat-mdc-form-field, .pdf-field-static, .totals-panel > div'));

    for (const container of containers) {
      const label = container.querySelector('mat-label, .mdc-floating-label, label, span')?.textContent?.trim() || '';
      if (!normalizedCandidates.includes(this.normalizeTableHeader(label))) {
        continue;
      }

      const input = container.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      const value =
        input?.value?.trim()
        || container.querySelector('h6, strong, p, .mat-mdc-select-value-text, .mat-select-value-text')?.textContent?.trim()
        || '';

      if (value) {
        return this.normalizePrintedDateValue(value);
      }
    }

    return '';
  }

  private findSectionByTitle(root: HTMLElement, titles: string[]): HTMLElement | null {
    const normalizedTitles = titles.map((title) => this.normalizeTableHeader(title));

    return (
      Array.from(root.querySelectorAll('.editor-card, section, .col-12, .form-sections > div')).find((element) => {
        const title = element.querySelector('h3')?.textContent?.trim() || '';
        return normalizedTitles.includes(this.normalizeTableHeader(title));
      }) as HTMLElement | undefined
    ) ?? null;
  }

  private findFieldByLabel(
    scope: HTMLElement,
    candidateLabels: string[]
  ): { label: string; value: string; rich: boolean } | null {
    const normalizedCandidates = candidateLabels.map((label) => this.normalizeTableHeader(label));
    const labels = Array.from(scope.querySelectorAll('label'));

    for (const labelElement of labels) {
      const normalizedLabel = this.normalizeTableHeader(labelElement.textContent || '');
      if (!normalizedCandidates.includes(normalizedLabel)) {
        continue;
      }

      const wrapper =
        (labelElement.closest('.pdf-field-static') as HTMLElement | null) ??
        (labelElement.closest('[class*="col-"]') as HTMLElement | null) ??
        labelElement.parentElement;

      if (!wrapper) {
        continue;
      }

      const richText = wrapper.querySelector('.details-richtext, .details-observacoes, .ql-editor') as HTMLElement | null;
      const valueCandidates = Array.from(wrapper.querySelectorAll('h6, .pdf-field-static h6, strong, p'))
        .map((element) => element.textContent?.replace(/\s+/g, ' ').trim() || '')
        .filter(Boolean);

      const value = richText?.textContent?.replace(/\s+/g, ' ').trim() || valueCandidates[0] || '';
      if (!value) {
        continue;
      }

      return {
        label: labelElement.textContent?.trim() || candidateLabels[0],
        value: this.normalizePrintedDateValue(value),
        rich: !!richText
      };
    }

    return null;
  }

  private filterCommercialSections(clone: HTMLElement, source: HTMLElement): void {
    const sourceText = source.textContent?.toLowerCase() || '';
    const isVenda = sourceText.includes('pdv') || sourceText.includes('venda gerada');

    Array.from(clone.querySelectorAll('.editor-card, section')).forEach((sectionElement) => {
      const title = sectionElement.querySelector('h3')?.textContent?.trim().toLowerCase() || '';

      if (isVenda && title === 'acoes do orçamento') {
        sectionElement.remove();
      }

      if (!isVenda && title === 'venda gerada') {
        sectionElement.remove();
      }
    });
  }

  private buildTableContent(table: HTMLTableElement): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-table-content';

    const headerCells = Array.from(table.querySelectorAll('thead th'))
      .map((cell) => cell.textContent?.trim() || '');
    const commercialColumns = this.resolveCommercialTableColumns(headerCells);

    const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
    const rows = bodyRows.length ? bodyRows : Array.from(table.querySelectorAll('tr'));

    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      if (!cells.length) {
        return;
      }

      const rowBlock = document.createElement('div');
      rowBlock.className = 'pdf-table-row';

      cells.forEach((cell, index) => {
        if (commercialColumns && !commercialColumns.some((column) => column.index === index)) {
          return;
        }

        const value = this.extractTableCellValue(cell);
        if (!value) {
          return;
        }

        const field = document.createElement('div');
        field.className = 'pdf-table-field';

        const labelText = commercialColumns?.find((column) => column.index === index)?.label || headerCells[index]?.trim();
        if (labelText) {
          const label = document.createElement('label');
          label.textContent = labelText;
          field.appendChild(label);
        }

        const content = document.createElement('p');
        content.textContent = this.normalizePrintedDateValue(value);
        field.appendChild(content);
        rowBlock.appendChild(field);
      });

      if (rowBlock.children.length) {
        wrapper.appendChild(rowBlock);
      }
    });

    if (!wrapper.children.length) {
      const empty = document.createElement('p');
      empty.textContent = table.textContent?.replace(/\s+/g, ' ').trim() || 'Nenhum registro encontrado.';
      wrapper.appendChild(empty);
    }

    return wrapper;
  }

  private extractTableCellValue(cell: Element, options?: { excludeSmall?: boolean }): string {
    const selector = options?.excludeSmall
      ? 'h6, .pdf-value-stack p, .pdf-field-static h6, strong, span'
      : 'h6, .pdf-value-stack p, .pdf-field-static h6, strong, small, span';

    const semanticValues = Array.from(
      cell.querySelectorAll(selector)
    )
      .map((element) => element.textContent?.replace(/\s+/g, ' ').trim() || '')
      .filter(Boolean);

      if (semanticValues.length) {
        if (semanticValues.length === 1) {
        return this.normalizePrintedDateValue(semanticValues[0]);
      }

      return this.normalizePrintedDateValue(semanticValues.join(': '));
    }

    return this.normalizePrintedDateValue(cell.textContent?.replace(/\s+/g, ' ').trim() || '');
  }

  private normalizePrintedDateValue(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const exactDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (exactDateMatch) {
      const [, year, month, day] = exactDateMatch;
      return `${day}/${month}/${year}`;
    }

    const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      return `${day}/${month}/${year}`;
    }

    return trimmed;
  }

  private resolveCommercialTableColumns(headers: string[]): Array<{ index: number; label: string }> | null {
    const normalizedHeaders = headers.map((header) => this.normalizeTableHeader(header));
    const catalogIndex = normalizedHeaders.indexOf('catalogo');

    if (catalogIndex === -1) {
      return null;
    }

    const quantityIndex = normalizedHeaders.findIndex((header) => header === 'qtd' || header === 'quantidade');
    const unitValueIndex = normalizedHeaders.findIndex((header) => header === 'vlr unit' || header === 'valor unitario');
    const discountValueIndex = normalizedHeaders.findIndex((header) => header === 'vlr desc' || header === 'valor desconto');
    const discountPercentIndex = normalizedHeaders.findIndex((header) => header === 'desc' || header === 'percent desc');
    const totalIndex = normalizedHeaders.indexOf('total');

    const allowedColumns = [
      { index: catalogIndex, label: 'Catalogo' },
      { index: quantityIndex, label: 'Quantidade' },
      { index: unitValueIndex, label: 'Valor unitario' },
      { index: discountValueIndex !== -1 ? discountValueIndex : discountPercentIndex, label: 'Desconto' },
      { index: totalIndex, label: 'Total' }
    ].filter((column) => column.index !== -1);

    return allowedColumns.length ? allowedColumns : null;
  }

  private normalizeTableHeader(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private buildEmpresaPdfContent(source: HTMLElement): HTMLElement {
    const wrapper = document.createElement('div');
    const dadosBasicos = source.querySelector('#home') as HTMLElement | null;
    const equipamentos = source.querySelector('#profile') as HTMLElement | null;

    if (dadosBasicos) {
      const basicsSection = document.createElement('section');
      basicsSection.className = 'pdf-render-shell pdf-page-section';
      basicsSection.appendChild(this.buildEmpresaBasicsSection(dadosBasicos));
      wrapper.appendChild(basicsSection);
    }

    if (equipamentos) {
      const heading = document.createElement('div');
      heading.className = 'pdf-section-heading';
      heading.innerHTML = `
        <p class="pdf-section-kicker">Equipamentos</p>
      `;

      const equipmentSection = document.createElement('section');
      equipmentSection.className = 'pdf-render-shell pdf-page-section';
      equipmentSection.appendChild(heading);
      equipmentSection.appendChild(this.buildEmpresaEquipmentSection(equipamentos));
      wrapper.appendChild(equipmentSection);
    }

    return wrapper;
  }

  private buildEmpresaBasicsSection(source: HTMLElement): HTMLElement {
    const content = document.createElement('div');
    const grid = document.createElement('div');
    grid.className = 'row g-3';

    const fieldWrappers = Array.from(source.querySelectorAll('label'))
      .map((label) => label.parentElement as HTMLElement | null)
      .filter((element, index, items): element is HTMLElement => !!element && items.indexOf(element) === index);

    fieldWrappers.forEach((fieldWrapper) => {
      const label = fieldWrapper.querySelector('label')?.textContent?.trim();
      const richText = fieldWrapper.querySelector('.ql-editor, .details-richtext') as HTMLElement | null;
      const headingValue = fieldWrapper.querySelector('h6')?.textContent?.trim();
      const textValue = richText?.innerHTML?.trim() || richText?.textContent?.trim() || headingValue || '';

      if (!label || !textValue) {
        return;
      }

      const field = document.createElement('div');
      field.className = richText ? 'col-12 pdf-full-row' : 'col-lg-4 col-md-6 col-12';
      field.innerHTML = `<label>${label}</label>`;

      if (richText) {
        const richContainer = document.createElement('div');
        richContainer.className = 'details-richtext';
        richContainer.innerHTML = richText.innerHTML;
        field.appendChild(richContainer);
      } else {
        const value = document.createElement('h6');
        value.textContent = textValue;
        field.appendChild(value);
      }

      grid.appendChild(field);
    });

    content.appendChild(grid);
    return content;
  }

  private buildEmpresaEquipmentSection(source: HTMLElement): HTMLElement {
    const content = document.createElement('div');
    const sourceTable = source.querySelector('table') as HTMLTableElement | null;

    if (!sourceTable) {
      const empty = document.createElement('p');
      empty.textContent = 'Nenhum equipamento encontrado.';
      content.appendChild(empty);
      return content;
    }

    content.appendChild(this.buildTableContent(sourceTable));
    return content;
  }

  private buildTabbedSemanticPdfContent(
    source: HTMLElement,
    panes: Array<{ paneId: string; title?: string; tablesOnly?: boolean }>
  ): HTMLElement {
    const wrapper = document.createElement('div');

    panes.forEach((paneConfig) => {
      const pane = source.querySelector(paneConfig.paneId) as HTMLElement | null;
      if (!pane) {
        return;
      }

      const section = document.createElement('section');
      section.className = 'pdf-render-shell pdf-page-section';

      if (paneConfig.title) {
        const heading = document.createElement('div');
        heading.className = 'pdf-section-heading';
        heading.innerHTML = `<p class="pdf-section-kicker">${paneConfig.title}</p>`;
        section.appendChild(heading);
      }

      section.appendChild(
        paneConfig.tablesOnly
          ? this.buildSemanticTablesOnlyContent(pane)
          : this.buildSemanticDetailsContent(pane)
      );

      wrapper.appendChild(section);
    });

    return wrapper;
  }

  private buildSemanticDetailsContent(source: HTMLElement): HTMLElement {
    const clone = source.cloneNode(true) as HTMLElement;
    this.prepareClone(clone);

    const content = document.createElement('div');
    const grid = document.createElement('div');
    grid.className = 'row g-3';

    const labels = Array.from(clone.querySelectorAll('label'))
      .filter((label) => !label.closest('table'));

    const seen = new Set<HTMLElement>();

    labels.forEach((labelElement) => {
      const wrapper = (labelElement.closest('[class*="col-"]') as HTMLElement | null) ?? labelElement.parentElement;
      if (!wrapper || seen.has(wrapper)) {
        return;
      }

      seen.add(wrapper);
      const label = labelElement.textContent?.trim();
      if (!label) {
        return;
      }

      const richText = wrapper.querySelector('.details-richtext, .details-observacoes, .ql-editor') as HTMLElement | null;
      const values = Array.from(wrapper.querySelectorAll('h6, .pdf-field-static h6, strong'))
        .map((element) => element.textContent?.trim() || '')
        .filter(Boolean);

      if (!richText && !values.length) {
        return;
      }

      const field = document.createElement('div');
      field.className = richText ? 'col-12 pdf-full-row' : this.resolveSemanticColumnClass(wrapper);
      field.innerHTML = `<label>${label}</label>`;

      if (richText) {
        const richContainer = document.createElement('div');
        richContainer.className = 'details-richtext';
        richContainer.innerHTML = richText.innerHTML;
        field.appendChild(richContainer);
      } else {
        const value = document.createElement('div');
        value.className = 'pdf-value-stack';
        values.forEach((item) => {
          const line = document.createElement('p');
          line.textContent = item;
          value.appendChild(line);
        });
        field.appendChild(value);
      }

      grid.appendChild(field);
    });

    if (grid.children.length) {
      content.appendChild(grid);
    }

    Array.from(clone.querySelectorAll('table')).forEach((tableElement) => {
      content.appendChild(this.buildTableContent(tableElement as HTMLTableElement));
    });

    return content;
  }

  private buildSemanticTablesOnlyContent(source: HTMLElement): HTMLElement {
    const clone = source.cloneNode(true) as HTMLElement;
    this.prepareClone(clone);

    const content = document.createElement('div');
    const table = clone.querySelector('table') as HTMLTableElement | null;
    if (!table) {
      const empty = document.createElement('p');
      empty.textContent = 'Nenhum registro encontrado.';
      content.appendChild(empty);
      return content;
    }

    content.appendChild(this.buildTableContent(table));
    return content;
  }

  private buildComercialPdfContent(source: HTMLElement): HTMLElement {
    const wrapper = document.createElement('div');
    const clone = source.cloneNode(true) as HTMLElement;
    this.prepareClone(clone);

    const section = document.createElement('section');
    section.className = 'pdf-render-shell pdf-page-section';

    const content = document.createElement('div');
    const title = clone.querySelector('.comercial-header h2')?.textContent?.trim();
    const subtitle = clone.querySelector('.comercial-header p')?.textContent?.trim();
    if (title) {
      const heading = document.createElement('div');
      heading.className = 'pdf-section-heading';
      heading.innerHTML = `
        <p class="pdf-section-kicker">Comercial</p>
        <h2 class="pdf-section-title">${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      `;
      content.appendChild(heading);
    }

    const summaryGrid = document.createElement('div');
    summaryGrid.className = 'row g-3';
    clone.querySelectorAll('.summary-card').forEach((card) => {
      const label = card.querySelector('span')?.textContent?.trim();
      const value = card.querySelector('strong')?.textContent?.trim();
      if (!label || !value) {
        return;
      }

      const field = document.createElement('div');
      field.className = 'col-lg-4 col-md-6 col-12';
      field.innerHTML = `<label>${label}</label><div class="pdf-value-stack"><p>${value}</p></div>`;
      summaryGrid.appendChild(field);
    });
    if (summaryGrid.children.length) {
      content.appendChild(summaryGrid);
    }

    clone.querySelectorAll('.editor-card').forEach((card) => {
      const cardSection = document.createElement('div');
      const cardTitle = card.querySelector('h3')?.textContent?.trim();
      if (cardTitle) {
        const heading = document.createElement('div');
        heading.className = 'pdf-section-heading';
        heading.innerHTML = `<p class="pdf-section-kicker">${cardTitle}</p>`;
        cardSection.appendChild(heading);
      }

      const grid = document.createElement('div');
      grid.className = 'row g-3';
      card.querySelectorAll('.form-grid label').forEach((labelElement) => {
        const wrapperElement = labelElement.parentElement as HTMLElement | null;
        const label = labelElement.textContent?.trim();
        const value = wrapperElement?.querySelector('h6')?.textContent?.trim();
        if (!wrapperElement || !label || !value) {
          return;
        }

        const field = document.createElement('div');
        field.className = wrapperElement.classList.contains('full') ? 'col-12' : 'col-lg-4 col-md-6 col-12';
        field.innerHTML = `<label>${label}</label><div class="pdf-value-stack"><p>${value}</p></div>`;
        grid.appendChild(field);
      });

      if (grid.children.length) {
        cardSection.appendChild(grid);
      }

      card.querySelectorAll('.totals-panel').forEach((panel) => {
        const panelGrid = document.createElement('div');
        panelGrid.className = 'row g-3';
        panel.querySelectorAll('div').forEach((item) => {
          const label = item.querySelector('span')?.textContent?.trim();
          const value = item.querySelector('strong')?.textContent?.trim();
          if (!label || !value) {
            return;
          }
          const field = document.createElement('div');
          field.className = 'col-md-6 col-12';
          field.innerHTML = `<label>${label}</label><div class="pdf-value-stack"><p>${value}</p></div>`;
          panelGrid.appendChild(field);
        });
        if (panelGrid.children.length) {
          cardSection.appendChild(panelGrid);
        }
      });

      card.querySelectorAll('table').forEach((table) => {
        const cleanTable = table.cloneNode(true) as HTMLElement;
        cleanTable.querySelectorAll('button').forEach((button) => button.remove());
        cardSection.appendChild(cleanTable);
      });

      if (cardSection.children.length) {
        content.appendChild(cardSection);
      }
    });

    section.appendChild(content);
    wrapper.appendChild(section);
    return wrapper;
  }

  private resolveSemanticColumnClass(wrapper: HTMLElement): string {
    const columnClasses = Array.from(wrapper.classList).filter((className) => className.startsWith('col-'));
    return columnClasses.join(' ') || 'col-lg-4 col-md-6 col-12';
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
    const continuationTopInset = margin + pageBreakTopGap;

    let heightLeft = imageHeight;
    let position = margin;

    pdf.addImage(imageData, 'PNG', margin, position, printableWidth, imageHeight, undefined, 'FAST');
    this.maskPdfPageInsets(pdf, pageWidth, pageHeight, 0, pageBreakBottomGap);
    heightLeft -= usablePageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imageHeight + continuationTopInset;
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', margin, position, printableWidth, imageHeight, undefined, 'FAST');
      this.maskPdfPageInsets(pdf, pageWidth, pageHeight, continuationTopInset, pageBreakBottomGap);
      heightLeft -= usablePageHeight - pageBreakTopGap;
    }
  }

  private maskPdfPageInsets(
    pdf: jsPDF,
    pageWidth: number,
    pageHeight: number,
    topInset: number,
    bottomInset: number
  ): void {
    pdf.setFillColor(255, 255, 255);

    if (topInset > 0) {
      pdf.rect(0, 0, pageWidth, topInset, 'F');
    }

    if (bottomInset > 0) {
      pdf.rect(0, pageHeight - bottomInset, pageWidth, bottomInset, 'F');
    }
  }

  private prepareClone(clone: HTMLElement): void {
    this.normalizeFormFields(clone);
    this.normalizeNativeFields(clone);
    this.normalizeSummaryBlocks(clone);

    clone.querySelectorAll('.pdf-hide, .modal, #modal, button, select, input, textarea, .ql-toolbar, .btn-close')
      .forEach((element) => element.remove());

    clone.querySelectorAll('quill-editor').forEach((element) => {
      const quillHost = element as HTMLElement;
      const editorContent = quillHost.querySelector('.ql-editor');
      const replacement = document.createElement('div');
      replacement.className = 'details-richtext';
      replacement.innerHTML = editorContent?.innerHTML ?? '';
      quillHost.replaceWith(replacement);
    });

    clone.querySelectorAll('.details-richtext, .ql-editor').forEach((element) => {
      const richTextWrapper = (element as HTMLElement).closest('[class*="col-"]') as HTMLElement | null;
      if (richTextWrapper) {
        richTextWrapper.classList.add('pdf-full-row');
        const parentRow = richTextWrapper.parentElement;
        if (parentRow?.classList.contains('row')) {
          Array.from(parentRow.children).forEach((child) => {
            if (child !== richTextWrapper) {
              (child as HTMLElement).classList.add('pdf-expand-row');
            }
          });
        }
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

    this.sanitizeCloneMarkup(clone);
  }

  private normalizeSummaryBlocks(clone: HTMLElement): void {
    clone.querySelectorAll('.summary-card').forEach((card) => {
      const label = card.querySelector('span')?.textContent?.trim() || '';
      const value = card.querySelector('strong, h6')?.textContent?.trim() || '';
      if (!label || !value) {
        return;
      }

      card.replaceWith(this.createStaticPdfField(label, value));
    });

    clone.querySelectorAll('.totals-panel > div').forEach((item) => {
      const label = item.querySelector('span')?.textContent?.trim() || '';
      const value = item.querySelector('strong, h6')?.textContent?.trim() || '';
      if (!label || !value) {
        return;
      }

      item.replaceWith(this.createStaticPdfField(label, value));
    });
  }

  private createStaticPdfField(label: string, value: string, rich = false): HTMLElement {
    const field = document.createElement('div');
    field.className = 'pdf-field-static';

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    field.appendChild(labelElement);

    if (rich) {
      const valueElement = document.createElement('div');
      valueElement.className = 'details-richtext';
      valueElement.textContent = value;
      field.appendChild(valueElement);
    } else {
      const valueElement = document.createElement('h6');
      valueElement.textContent = value;
      field.appendChild(valueElement);
    }

    return field;
  }

  private normalizeFormFields(clone: HTMLElement): void {
    clone.querySelectorAll('mat-form-field, .mat-mdc-form-field').forEach((field) => {
      const fieldElement = field as HTMLElement;
      const label = fieldElement.querySelector('mat-label, .mdc-floating-label, label')?.textContent?.trim() || '';
      const input = fieldElement.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
      const selectValue = fieldElement.querySelector('.mat-mdc-select-value-text, .mat-select-value-text')?.textContent?.trim() || '';
      const value = input?.value?.trim() || selectValue || fieldElement.querySelector('.mdc-text-field__input')?.textContent?.trim() || '-';

      const replacement = document.createElement('div');
      replacement.className = 'pdf-field-static';

      if (label) {
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        replacement.appendChild(labelElement);
      }

      const valueElement = document.createElement('h6');
      valueElement.textContent = value || '-';
      replacement.appendChild(valueElement);
      fieldElement.replaceWith(replacement);
    });
  }

  private normalizeNativeFields(clone: HTMLElement): void {
    clone.querySelectorAll('input, select, textarea').forEach((field) => {
      const fieldElement = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (fieldElement.closest('mat-form-field, .mat-mdc-form-field, quill-editor')) {
        return;
      }

      const labelElement = this.resolveFieldLabel(fieldElement, clone);
      const value = this.resolveFieldValue(fieldElement);
      const replacement = document.createElement('div');
      replacement.className = 'pdf-field-static';

      if (labelElement?.textContent?.trim()) {
        const normalizedLabel = document.createElement('label');
        normalizedLabel.textContent = labelElement.textContent.trim();
        replacement.appendChild(normalizedLabel);
        labelElement.remove();
      }

      const valueElement = document.createElement('h6');
      valueElement.textContent = value || '-';
      replacement.appendChild(valueElement);
      fieldElement.replaceWith(replacement);
    });
  }

  private resolveFieldLabel(
    field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    root: HTMLElement
  ): HTMLLabelElement | null {
    const id = field.getAttribute('id');
    if (id) {
      const byFor = root.querySelector(`label[for="${id}"]`) as HTMLLabelElement | null;
      if (byFor) {
        return byFor;
      }
    }

    const previousLabel = field.previousElementSibling;
    if (previousLabel instanceof HTMLLabelElement) {
      return previousLabel;
    }

    return field.closest('label') as HTMLLabelElement | null;
  }

  private resolveFieldValue(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
    if (field instanceof HTMLSelectElement) {
      return field.selectedOptions[0]?.textContent?.trim() || field.value?.trim() || '-';
    }

    if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
      return field.checked ? 'Sim' : 'Não';
    }

    return field.value?.trim() || field.getAttribute('value')?.trim() || field.placeholder?.trim() || '-';
  }

  private createPdfHeader(logoBase64: string, title: string, generatedAt: string): HTMLElement {
    const header = document.createElement('div');
    header.className = 'pdf-render-header';
    header.innerHTML = `
      <div class="pdf-render-brand">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : `<span class="pdf-render-brand-text">GI</span>`}
      </div>
      <div class="pdf-render-heading">
        <p class="pdf-render-kicker">Gestão da Informação</p>
        <h1 class="pdf-render-title">${title}</h1>
        <p class="pdf-render-subtitle">Documento gerado em ${generatedAt}</p>
      </div>
    `;

    return header;
  }

  private sanitizeCloneMarkup(clone: HTMLElement): void {
    const allowedClasses = [
      /^row$/,
      /^col-/,
      /^g-\d+$/,
      /^gx-\d+$/,
      /^gy-\d+$/,
      /^mt-/,
      /^mb-/,
      /^ms-/,
      /^me-/,
      /^mx-/,
      /^my-/,
      /^pt-/,
      /^pb-/,
      /^ps-/,
      /^pe-/,
      /^px-/,
      /^py-/,
      /^w-100$/,
      /^h-100$/,
      /^overflow-hidden$/,
      /^table$/,
      /^table-/,
      /^pdf-/,
      /^details-richtext$/,
      /^ql-/,
      /^show$/,
      /^active$/
    ];

    [clone, ...Array.from(clone.querySelectorAll('*'))].forEach((element) => {
      Array.from(element.getAttributeNames())
        .filter((name) => name.startsWith('_ngcontent-') || name.startsWith('_nghost-'))
        .forEach((name) => element.removeAttribute(name));

      const filteredClasses = Array.from(element.classList)
        .filter((className) => allowedClasses.some((pattern) => pattern.test(className)))
        .join(' ');

      if (filteredClasses) {
        element.setAttribute('class', filteredClasses);
      } else {
        element.removeAttribute('class');
      }

      const isHeaderElement = element.classList.contains('pdf-render-header') || element.classList.contains('pdf-render-brand');
      if (!isHeaderElement) {
        element.removeAttribute('style');
      }
    });
  }

  private normalizeColorsForCanvas(root: HTMLElement): void {
    const elements = [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[];

    elements.forEach((element) => {
      const computed = window.getComputedStyle(element);

      this.applySafeColor(element, 'color', computed.color);
      this.applySafeColor(element, 'background-color', computed.backgroundColor);
      this.applySafeColor(element, 'border-top-color', computed.borderTopColor);
      this.applySafeColor(element, 'border-right-color', computed.borderRightColor);
      this.applySafeColor(element, 'border-bottom-color', computed.borderBottomColor);
      this.applySafeColor(element, 'border-left-color', computed.borderLeftColor);
      this.applySafeColor(element, 'outline-color', computed.outlineColor);
      this.applySafeColor(element, 'text-decoration-color', computed.textDecorationColor);

      if (computed.boxShadow && computed.boxShadow !== 'none' && computed.boxShadow.includes('oklch')) {
        element.style.boxShadow = 'none';
      }
    });
  }

  private applySafeColor(element: HTMLElement, property: string, value: string): void {
    const safeColor = this.toCanvasSafeColor(value);
    if (safeColor) {
      element.style.setProperty(property, safeColor);
    }
  }

  private toCanvasSafeColor(value: string): string {
    if (!value || value === 'initial' || value === 'inherit' || value === 'unset') {
      return '';
    }

    if (!value.includes('oklch')) {
      return value;
    }

    const probe = document.createElement('span');
    probe.style.position = 'fixed';
    probe.style.left = '-10000px';
    probe.style.top = '0';
    probe.style.color = value;
    document.body.appendChild(probe);

    const resolved = window.getComputedStyle(probe).color;
    probe.remove();

    return resolved && !resolved.includes('oklch') ? resolved : '#000000';
  }

  private applyRenderStyles(host: HTMLElement): void {
    Object.assign(host.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: '1240px',
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
        font-size: 19px;
        line-height: 1.5;
        padding: 24px 28px 28px;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        box-sizing: border-box;
      }

      .pdf-page-section {
        width: 100%;
        min-height: 1480px;
      }

      .pdf-page-section + .pdf-page-section {
        margin-top: 24px;
      }

      .pdf-render-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
        margin-bottom: 24px;
        padding-bottom: 18px;
        border-bottom: 2px solid #111827;
      }

      .pdf-render-brand {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 156px;
        min-height: 108px;
        padding: 0;
        border-radius: 0;
        background: transparent;
      }

      .pdf-render-brand img {
        max-width: 260px;
        max-height: 102px;
        object-fit: contain;
      }

      .pdf-render-brand-text {
        color: #ffffff;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: 0.12em;
      }

      .pdf-render-heading {
        flex: 1;
        text-align: right;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .pdf-render-kicker {
        margin: 0;
        color: #9a6700;
        font-size: 0;
        font-weight: 800;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }

      .pdf-render-kicker::after {
        content: 'Leal Informatica';
        font-size: 18px;
      }

      .pdf-render-title {
        margin: 8px 0 4px;
        color: #111827;
        font-size: 39px;
        line-height: 1.2;
        font-weight: 800;
      }

      .pdf-render-subtitle {
        margin: 0;
        color: #6b7280;
        font-size: 19px;
      }

      .pdf-section-heading {
        margin: 32px 0 20px;
        padding-top: 14px;
        border-top: 1px solid #e5e7eb;
      }

      .pdf-section-kicker {
        margin: 0;
        color: #9a6700;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .pdf-section-title {
        margin: 6px 0 0;
        color: #111827;
        font-size: 29px;
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

      .pdf-render-content .pdf-expand-row {
        width: 100% !important;
        flex: 0 0 100% !important;
        max-width: 100% !important;
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
        margin-top: 18px;
        margin-bottom: 6px;
        color: #111827 !important;
        font-size: 16px;
        font-weight: 700 !important;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .pdf-render-content [class*="col-"]:first-child > label,
      .pdf-render-content .row > [class*="col-"]:nth-child(-n+3) > label,
      .pdf-render-content .pdf-full-row > label {
        margin-top: 0;
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
      .pdf-render-content strong {
        color: #111827 !important;
      }

      .pdf-render-content h6 {
        margin: 0;
        font-size: 20px;
        font-weight: 400;
        min-height: 0 !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .pdf-render-content strong {
        font-weight: 400 !important;
      }

      .pdf-render-content .pdf-value-stack p {
        margin: 0 0 6px;
        color: #111827 !important;
        font-size: 20px;
        font-weight: 400;
        line-height: 1.45;
      }

      .pdf-render-content .pdf-value-stack p:last-child {
        margin-bottom: 0;
      }

      .pdf-render-content .details-infra-shell,
      .pdf-render-content .details-table-shell,
      .pdf-render-content .details-divider,
      .pdf-render-content .pdf-field-static,
      .pdf-render-content .pdf-table-content,
      .pdf-render-content .pdf-table-row,
      .pdf-render-content .pdf-table-field {
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .pdf-render-content .pdf-table-content {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin-top: 12px;
      }

      .pdf-render-content .pdf-table-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
        padding-top: 14px;
        border-top: 1px solid #e5e7eb;
      }

      .pdf-render-content .pdf-table-row:first-child {
        padding-top: 0;
        border-top: none;
      }

      .pdf-render-content .pdf-table-field {
        min-width: 0;
        flex: 1 1 calc(20% - 14px);
        max-width: calc(20% - 14px);
      }

      .pdf-render-content .pdf-table-field p {
        margin: 0;
        color: #111827 !important;
        font-size: 18px;
        font-weight: 400;
        line-height: 1.45;
      }

      .pdf-render-content .pdf-table-field label {
        margin-top: 0;
        margin-bottom: 4px;
        font-size: 15px;
        letter-spacing: 0.08em;
      }

      .pdf-render-content .pdf-commercial-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 10px;
        margin-bottom: 10px;
      }

      .pdf-render-content .pdf-commercial-item-row {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px 14px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }

      .pdf-render-content .pdf-commercial-item-row:first-child {
        padding-top: 0;
        border-top: none;
      }

      .pdf-render-content .pdf-commercial-item-row-compact {
        padding-top: 8px;
      }

      .pdf-render-content .pdf-commercial-item-field {
        min-width: 0;
      }

      .pdf-render-content .pdf-commercial-item-field label {
        margin-top: 0;
        margin-bottom: 4px;
        font-size: 15px;
        letter-spacing: 0.08em;
      }

      .pdf-render-content .pdf-commercial-item-field p {
        margin: 0;
        color: #111827 !important;
        font-size: 18px;
        font-weight: 400;
        line-height: 1.4;
        word-break: break-word;
      }

      .pdf-render-content .pdf-commercial-item-row-compact .pdf-commercial-item-field p {
        padding-top: 2px;
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
        font-size: 16px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .pdf-render-content tbody td {
        padding: 10px 12px !important;
        color: #374151 !important;
        font-size: 17px;
        line-height: 1.45;
        border-top: 1px solid #e5e7eb !important;
        background: #ffffff !important;
      }

      .pdf-render-content tbody tr:nth-child(even) td {
        background: #fafafa !important;
      }

      .pdf-render-content .details-richtext,
      .pdf-render-content .ql-editor {
        border: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        line-height: 1.6;
        white-space: normal;
        word-break: break-word;
      }

      .pdf-render-content .details-richtext *,
      .pdf-render-content .ql-editor * {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
      }

      .pdf-render-content .details-richtext strong,
      .pdf-render-content .details-richtext b {
        font-weight: 700;
      }

      .pdf-render-content .details-richtext p,
      .pdf-render-content .details-richtext ul,
      .pdf-render-content .details-richtext ol,
      .pdf-render-content .details-richtext blockquote,
      .pdf-render-content .details-richtext pre,
      .pdf-render-content .ql-editor p,
      .pdf-render-content .ql-editor ul,
      .pdf-render-content .ql-editor ol,
      .pdf-render-content .ql-editor blockquote,
      .pdf-render-content .ql-editor pre {
        margin: 0 0 12px;
      }

      .pdf-render-content .details-richtext ul,
      .pdf-render-content .details-richtext ol,
      .pdf-render-content .ql-editor ul,
      .pdf-render-content .ql-editor ol {
        padding-left: 24px;
      }

      .pdf-render-content .details-richtext ul,
      .pdf-render-content .ql-editor ul {
        list-style: disc;
      }

      .pdf-render-content .details-richtext ol,
      .pdf-render-content .ql-editor ol {
        list-style: decimal;
      }

      .pdf-render-content .details-richtext blockquote,
      .pdf-render-content .ql-editor blockquote {
        margin-left: 0;
        border-left: 4px solid #d99e04;
        padding-left: 12px;
        color: #475569;
      }

      .pdf-render-content .details-richtext pre,
      .pdf-render-content .ql-editor pre {
        padding: 12px 16px;
        border-radius: 12px;
        background: #f8fafc !important;
        white-space: pre-wrap;
      }

      .pdf-render-content .ql-align-center {
        text-align: center;
      }

      .pdf-render-content .ql-align-right {
        text-align: right;
      }

      .pdf-render-content .ql-align-justify {
        text-align: justify;
      }

      .pdf-render-content .ql-indent-1 {
        padding-left: 3em;
      }

      .pdf-render-content .ql-indent-2 {
        padding-left: 6em;
      }

      .pdf-render-content .ql-indent-3 {
        padding-left: 9em;
      }

      .pdf-render-content .ql-size-small {
        font-size: 0.75em;
      }

      .pdf-render-content .ql-size-large {
        font-size: 1.5em;
      }

      .pdf-render-content .ql-size-huge {
        font-size: 2.5em;
      }

      .pdf-render-content .ql-font-monospace {
        font-family: monospace;
      }

      .pdf-render-content .nav,
      .pdf-render-content .nav-tabs,
      .pdf-render-content .pdf-hide,
      .pdf-render-content button,
      .pdf-render-content select,
      .pdf-render-content input,
      .pdf-render-content textarea,
      .pdf-render-content .ql-toolbar,
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
