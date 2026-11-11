import { PdfExportService } from './pdf-export.service';

describe('PDF document composition', () => {
  let service: any;
  const element = (markup = '', id = '') => {
    const root = document.createElement('div');
    root.id = id;
    root.innerHTML = markup;
    return root;
  };
  const field = (label: string, value: string, rich = false) =>
    `<div class="col-md-6"><label>${label}</label>${rich ? `<div class="details-richtext"><b>${value}</b></div>` : `<h6>${value}</h6>`}</div>`;
  const control = (label: string, value: string) =>
    `<mat-form-field><mat-label>${label}</mat-label><input value="${value}"></mat-form-field>`;
  const table = (rows = 2, commercial = false) =>
    `<table><thead><tr>${(commercial ? ['Tipo', 'Catálogo', 'Qtd', 'Vlr unit', 'Vlr desc', 'Total', 'Ações'] : ['Nome', 'Data']).map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: rows }, (_, i) => `<tr>${(commercial ? ['PRODUTO', `<strong>Produto ${i}</strong><small>Interno</small>`, '2', 'R$ 10', '0', 'R$ 20', '<button>Editar</button>'] : ['Ana', '2026-10-13']).map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  beforeEach(() => {
    service = new PdfExportService();
  });
  afterEach(() =>
    document
      .querySelectorAll('.pdf-render-host')
      .forEach((host) => host.remove()),
  );

  for (const id of [
    'empresa-detalhes-pdf',
    'atendimento-detalhes-pdf',
    'manutencao-detalhes-pdf',
    'equipamento-detalhes-pdf',
    'avulso-detalhes-pdf',
    'generic',
  ]) {
    it(`composes ${id} without interactive controls and preserves source`, () => {
      const markup = `<div id="home" class="tab-pane show active"><div class="row">${field('Nome do Cliente', 'Ana')}${field('CPF/CNPJ', '12345678901')}${field('Descrição', 'Serviço', true)}${field('Observações', 'Internas', true)}${field('Inicio do Servico', '2026-10-13')}${field('Fim do Servico', '2026-10-14')}${field('Tipo de Atendimento', 'Remoto')}${field('Status do Atendimento', 'Aberto')}${field('Total', 'R$ 100')}<div><label>Sem valor</label></div></div><button>Editar</button></div><div id="profile">${table()}</div>`;
      const source = element(markup, id);
      const before = source.innerHTML;
      const result = service.buildPdfContent(source) as HTMLElement;
      expect(result.textContent).toContain('Ana');
      expect(result.querySelector('button')).toBeNull();
      expect(source.innerHTML).toBe(before);
      if (id === 'avulso-detalhes-pdf')
        expect(result.textContent).not.toContain('Internas');
      expect(service.buildPdfContent(element('', id))).toBeInstanceOf(
        HTMLElement,
      );
    });
  }
  for (const venda of [true, false])
    for (const count of [0, 1, 21]) {
      it(`composes ${venda ? 'sale' : 'budget'} with ${count} items and closing information`, () => {
        const cards = Array.from(
          { length: count },
          (_, i) =>
            `<div class="pdv-cart-item"><div class="pdv-cart-item__info"><strong>Item ${i}</strong><small>R$ 10</small></div><div class="pdv-quantity-stepper"><input value="2"></div>${control('Valor desconto', '1')}<div class="pdv-cart-item__total"><strong>R$ 19</strong></div></div>`,
        ).join('');
        const source = element(
          `<h2>${venda ? 'PDV' : 'Orçamento'}</h2><div class="summary-card"><span>Status</span><strong>Aberto</strong></div><div class="summary-card"></div><div class="pdv-cliente-section">${control('Cliente', 'Ana')}${control('Documento', '123')}</div><div class="pdv-config-section">${control('Validade', '2026-10-13')}${control('Desconto financeiro', '2')}${control('Acrescimo financeiro', '3')}${control('Motivo da rejeicao', 'Nenhum')}${control('Observacoes', 'Texto')}</div>${cards}<div class="totals-panel"><div><span>Total</span><strong>R$ 19</strong></div><div></div></div><div class="pdv-linked-sale"><div class="summary-card"><span>Venda</span><strong>42</strong></div><div class="summary-card"></div></div>`,
          'comercial-detalhes-pdf',
        );
        const result: HTMLElement = service.buildPdfContent(source);
        expect(result.textContent).toContain('Ana');
        expect(result.textContent).toContain('R$ 19');
        expect(result.querySelectorAll('.pdf-commercial-item-row').length).toBe(
          count,
        );
        expect(result.querySelectorAll('.pdf-page-section').length).toBe(
          Math.max(1, Math.ceil(count / 10)),
        );
        if (!venda) expect(result.textContent).toContain('13/10/2026');
        expect(source.querySelectorAll('input').length).toBeGreaterThan(0);
      });
    }
  it('handles empty semantic fields and missing commercial sections', () => {
    const root = element(
      '<label>Nome</label><div class="pdf-field-static"><label>Cliente</label><h6>-</h6></div><div class="pdv-cart-item"></div>',
    );
    expect(
      service
        .buildComercialSelectedPdfContent(root)
        .querySelectorAll('.pdf-commercial-item-row').length,
    ).toBe(0);
    expect(
      service.buildFieldGridFromLabels(null, [['Nome']], 'Dados'),
    ).toBeNull();
    expect(
      service.buildFieldGridFromLabels(root, [['Não existe']], 'Dados'),
    ).toBeNull();
    expect(
      service.buildFieldGridFromEntries(
        [
          { label: '', value: 'X' },
          { label: 'X', value: '-' },
        ],
        'Dados',
      ),
    ).toBeNull();
    expect(service.buildCommercialClosingBlock(root, true)).toBeNull();
  });
  it('normalizes native/material fields, rich text, links, summaries and Angular attributes', () => {
    const root = element(
      `<div class="row custom" _ngcontent-demo style="height:2px"><div class="col-md-6 border" style="height:2px"><quill-editor><div class="ql-editor"><p>Descrição rica</p></div></quill-editor></div><div class="col-md-6"><label for="name">Nome</label><input id="name" value="Ana"></div></div><label><input type="checkbox" checked>Ativo</label><div><label>Tipo</label><select><option selected>Notebook</option></select></div><div><textarea placeholder="Notas"></textarea></div>${control('Material', 'Texto')}<mat-form-field><span class="mat-mdc-select-value-text">Opção</span></mat-form-field><mat-form-field><span class="mdc-text-field__input">Legado</span></mat-form-field><mat-form-field></mat-form-field><div class="summary-card"><span>Total</span><strong>100</strong></div><div class="summary-card"></div><div class="totals-panel"><div><span>Saldo</span><strong>50</strong></div><div></div></div><a href="/edit">Link</a><button>Salvar</button><quill-editor></quill-editor>`,
    );
    service.prepareClone(root);
    expect(root.textContent).toContain('Ana');
    expect(root.textContent).toContain('Notebook');
    expect(root.textContent).toContain('Descrição rica');
    expect(
      root.querySelector('input,select,textarea,button,a,quill-editor'),
    ).toBeNull();
    expect(root.querySelector('[_ngcontent-demo]')).toBeNull();
    expect(root.querySelector('.custom')).toBeNull();
    const unchecked = document.createElement('input');
    unchecked.type = 'radio';
    expect(service.resolveFieldValue(unchecked)).toBe('Não');
    const select = document.createElement('select');
    expect(service.resolveFieldValue(select)).toBe('-');
    service.normalizeNativeFields(
      element('<mat-form-field><input></mat-form-field>'),
    );
    expect(
      service.resolveFieldLabel(document.createElement('input'), root),
    ).toBeNull();
  });
  it('renders table values with date normalization, fallback labels and empty state', () => {
    for (const html of [
      table(),
      table(2, true),
      '<table></table>',
      '<table><tr><td>Sem cabeçalho</td><td></td></tr><tr></tr></table>',
      '<table><tbody><tr><td><span>A</span><strong>B</strong></td></tr></tbody></table>',
    ]) {
      const source = element(html);
      const result = service.buildTableContent(source.querySelector('table'));
      expect(result).toBeInstanceOf(HTMLElement);
      expect(result.textContent!.trim().length).toBeGreaterThan(0);
    }
    expect(
      service.buildTableContent(element(table()).querySelector('table'))
        .textContent,
    ).toContain('13/10/2026');
    for (const [value, expected] of [
      ['', ''],
      ['2026-10-13', '13/10/2026'],
      ['2026-10-13T23:00:00Z', '13/10/2026'],
      ['  Ana  ', 'Ana'],
    ])
      expect(service.normalizePrintedDateValue(value)).toBe(expected);
    expect(
      service
        .resolveCommercialTableColumns([
          'Catálogo',
          'Quantidade',
          'Valor unitário',
          '% Desc',
          'Total',
        ])
        .map((x: any) => x.label),
    ).toEqual([
      'Catalogo',
      'Quantidade',
      'Valor unitario',
      'Desconto',
      'Total',
    ]);
    expect(
      service.extractCommercialItemRow(element('<span></span>'), []),
    ).toEqual([]);
  });
  it('composes table-based commercial item pages and excludes generated installments', () => {
    const root = element(
      `<section class="editor-card"><h3>Itens do orçamento</h3>${table(21, true)}</section><section><h3>Venda gerada</h3></section>${field('Total', 'R$ 100')}${field('Validade', '2026-10-13')}${field('Forma de pagamento', 'PIX')}`,
    );
    const pages = service.buildCommercialItemsPages(root, false);
    expect(pages.length).toBe(3);
    expect(
      pages.flatMap((p: HTMLElement) =>
        Array.from(p.querySelectorAll('.pdf-commercial-item-row')),
      ).length,
    ).toBe(21);
    expect(
      service.buildCommercialClosingBlock(root, false).textContent,
    ).toContain('R$ 100');
    service.moveCommercialItemsToEnd(root);
    expect(root.lastElementChild!.textContent).toContain('Itens do orçamento');
    expect(service.buildCommercialItemsPages(element(), true)).toEqual([]);
    expect(
      service.buildCommercialItemsPages(
        element(`<section><h3>Itens do orçamento</h3>${table(1)}</section>`),
        true,
      ),
    ).toEqual([]);
    expect(
      service.buildCommercialItemsPages(
        element(
          `<section><h3>Itens do orçamento</h3>${table(0, true)}</section>`,
        ),
        true,
      ),
    ).toEqual([]);
    const installments =
      '<table><thead><tr>' +
      ['Parcela', 'Vencimento', 'Status', 'Previsto', 'Pago', 'Saldo']
        .map((x) => `<th>${x}</th>`)
        .join('') +
      '</tr></thead></table>';
    const sales = element(
      `<div class="table-responsive">${installments}</div><div class="editor-card">${installments}<h3>Venda</h3></div>${installments}${table()}`,
    );
    service.removeVendaGeradaTables(sales);
    expect(sales.querySelectorAll('table').length).toBe(1);
    const sections = element(
      '<section><h3>Acoes do orçamento</h3></section><section><h3>Venda gerada</h3></section>',
    );
    service.filterCommercialSections(sections, element('PDV'));
    expect(sections.textContent).not.toContain('Acoes');
    service.filterCommercialSections(sections, element('Orçamento'));
    expect(sections.children.length).toBe(0);
  });
  it('rebalances rows across physical pages, preserving the closing block', () => {
    const host = element(
      '<section class="pdf-page-section"><div class="pdf-render-header">Header</div><div class="pdf-section-heading"><div class="pdf-commercial-items"><div class="pdf-commercial-item-row">A</div><div class="pdf-commercial-item-row">B</div></div></div><div class="pdf-commercial-closing">Total</div></section>',
    );
    const first = host.firstElementChild!;
    Object.defineProperties(first, {
      clientHeight: { value: 10 },
      scrollHeight: {
        get: () =>
          first.querySelectorAll('.pdf-commercial-item-row').length * 10,
      },
    });
    service.rebalanceCommercialItemPages(host);
    expect(host.querySelectorAll('.pdf-page-section').length).toBe(2);
    expect(host.lastElementChild!.textContent).toContain('Total');
    expect(host.querySelectorAll('.pdf-commercial-item-row').length).toBe(2);
    service.rebalanceCommercialItemPages(element());
    service.rebalanceCommercialItemPages(
      element(
        '<section class="pdf-page-section"><div class="pdf-commercial-items"></div></section>',
      ),
    );
  });
  it('builds semantic tab sections and legacy commercial documents', () => {
    const root = element(
      `<div class="comercial-header"><h2>Orçamento</h2><p>Descrição</p></div><div id="home">${field('Nome', 'Ana')}${field('Texto', 'Rico', true)}<div class="col-12"><label>A</label><label>B</label><h6>1</h6></div><div><label></label><h6>2</h6></div><div><label>Vazio</label></div>${table()}</div><div id="profile">${table()}</div><div class="editor-card"><h3>Dados</h3><div class="form-grid"><div class="full"><label>Nome</label><h6>Ana</h6></div><div><label>Vazio</label></div></div>${table()}</div>`,
    );
    expect(
      service
        .buildTabbedSemanticPdfContent(root, [
          { paneId: '#home' },
          { paneId: '#profile', title: 'Itens', tablesOnly: true },
          { paneId: '#missing' },
        ])
        .querySelectorAll('.pdf-page-section').length,
    ).toBe(2);
    expect(
      service.buildSemanticTablesOnlyContent(element()).textContent,
    ).toContain('Nenhum');
    expect(
      service.buildEmpresaEquipmentSection(element()).textContent,
    ).toContain('Nenhum');
    // Layout composition is tested separately from markup sanitization above.
    spyOn(service, 'sanitizeCloneMarkup').and.stub();
    expect(service.buildComercialPdfContent(root).textContent).toContain(
      'Orçamento',
    );
    expect(
      service
        .buildComercialPdfContent(element())
        .querySelectorAll('.pdf-page-section').length,
    ).toBe(1);
    expect(
      service.findFieldByLabel(element('<div><label>Nome</label></div>'), [
        'Nome',
      ]),
    ).toBeNull();
    expect(
      service.findControlValueByLabel(
        element(
          '<div class="pdf-field-static"><label>Nome</label><h6>Ana</h6></div>',
        ),
        ['Nome'],
      ),
    ).toBe('Ana');
  });
  it('adds tall canvases to multiple pages and masks page insets', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 400;
    const pdf = {
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
      addImage: jasmine.createSpy(),
      addPage: jasmine.createSpy(),
      setFillColor: jasmine.createSpy(),
      rect: jasmine.createSpy(),
    };
    service.addCanvasToPdf(pdf, canvas);
    expect(pdf.addPage).toHaveBeenCalledTimes(2);
    expect(pdf.addImage).toHaveBeenCalledTimes(3);
    expect(pdf.rect).toHaveBeenCalledWith(0, 0, 210, 22, 'F');
    service.maskPdfPageInsets(pdf, 210, 297, 0, 0);
  });
  for (const logo of [true, false])
    it(`builds render hosts with logo=${logo} and scoped styles`, async () => {
      spyOn(service, 'imageToBase64').and.returnValue(
        logo
          ? Promise.resolve('data:image/png;base64,AA==')
          : Promise.reject(new Error('offline')),
      );
      for (const id of ['empresa-detalhes-pdf', 'generic']) {
        const source = element(
          `<div id="home">${field('Nome', 'Ana')}</div>`,
          id,
        );
        const host: HTMLElement = await service.buildRenderHost(
          source,
          'Relatório',
        );
        expect(host.querySelector('style')).not.toBeNull();
        expect(host.textContent).toContain('Relatório');
        expect(!!host.querySelector('img')).toBe(logo);
        host.remove();
      }
    });
  it('fetches image data as base64 and sanitizes download names', async () => {
    spyOn(window, 'fetch').and.resolveTo({
      blob: async () => new Blob(['image'], { type: 'image/png' }),
    } as any);
    expect(await service.imageToBase64('/logo')).toContain(
      'data:image/png;base64,',
    );
    expect(service.toSafeFileName('  Relatório: Venda / 42  ')).toBe(
      'relatorio-venda-42',
    );
    await service.exportElementToPdf(null, 'Nada');
  });
  it('converts unsupported colors and removes incompatible shadows', () => {
    const root = element('<span>Texto</span>');
    document.body.append(root);
    try {
      for (const color of ['', 'initial', 'inherit', 'unset'])
        expect(service.toCanvasSafeColor(color)).toBe('');
      expect(service.toCanvasSafeColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)');
      expect(service.toCanvasSafeColor('oklch(0.5 0.1 120)')).not.toContain(
        'oklch',
      );
      root.style.boxShadow = '0 0 2px oklch(0.5 0.1 120)';
      service.normalizeColorsForCanvas(root);
      expect(root.style.boxShadow).toBe('none');
    } finally {
      root.remove();
    }
  });
});
