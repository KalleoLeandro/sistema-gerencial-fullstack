import { ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ListarComponent } from './listar.component';
import { ComercialService } from '@services/comercial.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../testing/page.testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ListarComponent as CaixaComponent } from './listar.component';
import { PdfExportService } from '@services/pdf-export.service';
import { ProdutoService } from '@services/produto.service';
import { ServicoComercialService } from '@services/servico-comercial.service';
import { UtilsService } from '@services/utils.service';

describe('Cash reconciliation', () => {
  let setup: ReturnType<typeof pageSetup>;
  let c: ListarComponent;
  let service: any;
  let dialog: any;
  const summary = [
    {
      forma_pagamento: 'DINHEIRO',
      valor_total: 80,
      valor_recebido: 80,
      valor_entregue: 100,
      troco: 20,
    },
    {
      forma_pagamento: 'CARTAO',
      valor_total: 30,
      valor_recebido: 30,
      valor_entregue: 30,
      troco: 0,
    },
  ];
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 13, 12));
    setup = pageSetup();
    service = setup.mock(ComercialService);
    service.buscarResumoCaixaDia.and.returnValue(
      of({ resumo: summary, fechamentos: [] }),
    );
    c = setup.create(ListarComponent);
    dialog = { showModal: jasmine.createSpy(), close: jasmine.createSpy() };
    (c as any).dialogFechamento = new ElementRef(dialog);
  });
  afterEach(() => jasmine.clock().uninstall());
  it('defaults to the last 30 days and validates/clears custom ranges', () => {
    expect(c.dataInicioFiltro).toBe('2026-09-14');
    expect(c.dataFimFiltro).toBe('2026-10-13');
    c.caixasFechados.set(
      ['2026-09-13', '2026-09-14', '2026-10-13', '2026-10-14', ''].map(
        (data_referencia) => ({ data_referencia }) as any,
      ),
    );
    expect(c.caixasFiltrados().length).toBe(2);
    c.dataInicioFiltro = '2026-10-14';
    c.filtrarHistorico();
    expect(setup.mock(ToastService).warning).toHaveBeenCalled();
    expect(c.caixasFiltrados().length).toBe(2);
    c.dataInicioFiltro = '';
    c.dataFimFiltro = '';
    c.filtrarHistorico();
    expect(c.caixasFiltrados().length).toBe(5);
    c.limparFiltroHistorico();
    expect(c.caixasFiltrados().length).toBe(2);
  });
  it('aggregates payment aliases, delivered amounts and change without inventing legacy values', () => {
    c.ngOnInit();
    expect(c.totalCaixaDia()).toBe(110);
    expect(c.totalRecebidoCaixaDia()).toBe(110);
    expect(
      c.resumoCaixaDia().find((x) => x.forma_pagamento === 'CARTAO_CREDITO')!
        .valor_recebido,
    ).toBe(30);
    expect(c.somarConferencia(summary, 'valor_entregue')).toBe(130);
    expect(c.somarConferencia(summary, 'troco')).toBe(20);
    expect(c.somarConferencia([], 'troco')).toBeNull();
    expect(
      c.somarConferencia(
        [{ forma_pagamento: 'PIX', valor_recebido: 10, valor_total: 10 }],
        'troco',
      ),
    ).toBeNull();
    for (const [forma, label] of [
      [null, '-'],
      ['pix', 'PIX'],
      ['Outra', 'Outra'],
    ])
      expect(c.formaPagamentoLabel(forma)).toBe(label!);
    expect(
      c.trackByFormaPagamento(0, {
        forma_pagamento: 'PIX',
        valor_informado: 10,
      }),
    ).toBe('PIX');
  });
  it('opens daily closure/editing, updates reconciliation and prevents closing while saving', () => {
    c.ngOnInit();
    c.abrirModalFechamento();
    expect(dialog.showModal).toHaveBeenCalled();
    expect(c.valorEsperadoFechamento).toBe(110);
    expect(c.valorConferido()).toBe(110);
    c.atualizarValorConferido(0, 'not-a-number');
    c.atualizarValorConferido(99, 1);
    expect(c.conferenciaPorTipo[0].valor_informado).toBe(0);
    c.editarFechamento({
      data_referencia: '2026-10-12',
      valor_total: 20,
      itens: [{ forma_pagamento: 'OUTRO', valor_total: 20 }],
      observacoes: 'Conferência',
    } as any);
    expect(c.editandoFechamento).toBeTrue();
    expect(c.valorConferido()).toBe(20);
    expect(c.dataReferenciaFechamento).toBe('2026-10-12');
    c.editarFechamento({} as any);
    expect(c.resumoFechamento).toEqual([]);
    c.fechandoCaixa.set(true);
    const event = { preventDefault: jasmine.createSpy() };
    c.fecharModalFechamento(event as any);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(dialog.close).not.toHaveBeenCalled();
    c.fechandoCaixa.set(false);
    c.fecharModalFechamento();
    expect(dialog.close).toHaveBeenCalled();
  });
  for (const editing of [false, true])
    for (const error of [false, true])
      it(`saves closure editing=${editing} error=${error}`, () => {
        c.ngOnInit();
        c.abrirModalFechamento();
        c.editandoFechamento = editing;
        c.observacoesFechamento = '  Nota  ';
        if (error)
          service.fecharCaixa.and.returnValue(
            throwError(() => new Error('offline')),
          );
        c.confirmarFechamento();
        expect(service.fecharCaixa).toHaveBeenCalledWith(
          jasmine.objectContaining({
            valor_informado: 110,
            observacoes: 'Nota',
          }),
        );
        expect(c.fechandoCaixa()).toBeFalse();
        expect(
          setup.mock(ToastService)[error ? 'error' : 'success'],
        ).toHaveBeenCalled();
      });
  it('rejects negative counts and clears daily summary when the backend fails', () => {
    c.conferenciaPorTipo = [{ forma_pagamento: 'PIX', valor_informado: -1 }];
    c.confirmarFechamento();
    expect(service.fecharCaixa).not.toHaveBeenCalled();
    service.buscarResumoCaixaDia.and.returnValue(
      throwError(() => new Error('offline')),
    );
    c.ngOnInit();
    expect(c.totalRecebidoCaixaDia()).toBe(0);
    expect(c.caixasFechados()).toEqual([]);
    service.buscarResumoCaixaDia.and.returnValue(of({}));
    c.ngOnInit();
    expect(c.totalCaixaDia()).toBe(0);
    service.buscarResumoCaixaDia.and.returnValue(
      of({
        resumo: [
          { forma_pagamento: '', valor_total: null, valor_recebido: null },
          { forma_pagamento: 'OUTRO', valor_total: 1, valor_recebido: 1 },
        ],
      }),
    );
    c.ngOnInit();
    expect(c.totalCaixaDia()).toBe(1);
  });
});

describe('Cash change', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        ...[
          ActivatedRoute,
          Router,
          ComercialService,
          PdfExportService,
          ProdutoService,
          ServicoComercialService,
          UtilsService,
        ].map((provide) => ({ provide, useValue: {} })),
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj('ToastService', ['warning']),
        },
      ],
    }),
  );
  it('conferência acompanha alterações e não gera quebra por precisão decimal', () => {
    const component = TestBed.runInInjectionContext(() => new CaixaComponent());
    component.valorEsperadoFechamento = 0.3;
    component.conferenciaPorTipo = [
      { forma_pagamento: 'PIX', valor_informado: 0.1 },
      { forma_pagamento: 'DINHEIRO', valor_informado: 0.2 },
    ];
    expect(component.quebraCaixa()).toBe(0);
    component.atualizarValorConferido(0, 0.2);
    expect(component.valorConferido()).toBe(0.4);
    expect(component.quebraCaixa()).toBe(0.1);
  });
});
