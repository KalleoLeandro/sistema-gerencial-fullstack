import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ContasComponent } from './contas.component';
import { FinanceiroService } from '@services/financeiro.service';
import { ToastService } from '@services/toast.service';
import { ContaFinanceira } from '@models/financeiro';
import { ElementRef } from '@angular/core';
import { throwError } from 'rxjs';
import { pageSetup } from '../../../testing/page.testing';

const conta: ContaFinanceira = {
  id: 1,
  origem: 'MANUAL',
  tipo: 'PAGAR',
  descricao: 'Aluguel',
  contraparte: 'Parceiro',
  categoria: null,
  referencia: null,
  vencimento: '2026-10-13',
  valor: 100,
  valorBaixado: 0,
  saldo: 100,
  status: 'ABERTA',
  vendaId: null,
  entidadeTipo: null,
  entidadeId: null,
};
describe('Financeiro: contas', () => {
  let api: jasmine.SpyObj<FinanceiroService>;
  let toast: jasmine.SpyObj<ToastService>;
  const setup = () => {
    const fixture = TestBed.createComponent(ContasComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  };
  beforeEach(() => {
    api = jasmine.createSpyObj('FinanceiroService', [
      'listar',
      'criar',
      'atualizar',
      'detalhes',
      'baixar',
      'cancelar',
    ]);
    toast = jasmine.createSpyObj('ToastService', [
      'success',
      'error',
      'warning',
    ]);
    api.listar.and.returnValue(
      of({ lista: [conta], total: 1, page: 1, limit: 10 }),
    );
    api.detalhes.and.returnValue(of({ conta, baixas: [] }));
    api.criar.and.returnValue(of(conta));
    api.baixar.and.returnValue(of({ conta, baixas: [] }));
    TestBed.configureTestingModule({
      imports: [ContasComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { tipo: 'PAGAR' } } },
        },
        { provide: FinanceiroService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });
  });
  afterEach(() =>
    document
      .querySelectorAll('dialog[open]')
      .forEach((dialog) => (dialog as HTMLDialogElement).close()),
  );
  it('cria a listagem e distingue a origem das contas', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('Contas a pagar');
    expect(fixture.nativeElement.textContent).toContain('Lançamento manual');
    expect(api.listar).toHaveBeenCalledWith(
      jasmine.objectContaining({ tipo: 'PAGAR' }),
      1,
      10,
    );
  });
  it('não salva lançamento incompleto', () => {
    const { component } = setup();
    component.nova();
    component.salvar();
    expect(api.criar).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalled();
  });
  it('salva lançamento genérico sem exigir fornecedor ou centro de custo', () => {
    const { component } = setup();
    component.nova();
    component.form.patchValue({
      descricao: 'Aluguel',
      contraparte: 'Parceiro',
      valor: 100,
    });
    component.salvar();
    expect(api.criar).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tipo: 'PAGAR',
        categoria: null,
        entidadeTipo: null,
        entidadeId: null,
      }),
    );
    expect(component.dialog.nativeElement.open).toBeFalse();
  });
  it('rejeita baixa acima do saldo ou com data futura', () => {
    const { component } = setup();
    component.abrir(conta, 'baixa');
    component.baixaForm.patchValue({ valor: 101 });
    component.baixar();
    component.baixaForm.patchValue({ valor: 10, data: '2099-01-01' });
    component.baixar();
    expect(api.baixar).not.toHaveBeenCalled();
  });
  it('envia a baixa da parcela para a origem de venda e impede fechar durante gravação', () => {
    const { component } = setup();
    const response = new Subject<any>();
    api.baixar.and.returnValue(response);
    component.abrir({ ...conta, origem: 'VENDA', vendaId: 9 }, 'baixa');
    component.baixaForm.patchValue({ valor: 40 });
    component.baixar();
    expect(api.baixar).toHaveBeenCalledWith(
      'VENDA',
      1,
      jasmine.objectContaining({ valor: 40 }),
    );
    component.fechar();
    expect(component.dialog.nativeElement.open).toBeTrue();
    response.next({ conta, baixas: [] });
    response.complete();
    expect(component.dialog.nativeElement.open).toBeFalse();
  });
  it('filtro inválido não dispara consulta e pesquisa reinicia paginação', () => {
    const { component } = setup();
    api.listar.calls.reset();
    component.inicio = '2026-10-20';
    component.fim = '2026-10-01';
    component.pesquisar();
    expect(api.listar).not.toHaveBeenCalled();
    component.inicio = '';
    component.fim = '';
    component.page = 3;
    component.pesquisar();
    expect(component.page).toBe(1);
  });
});

describe('Financial account actions', () => {
  const conta = {
    id: 42,
    origem: 'MANUAL',
    tipo: 'PAGAR',
    descricao: 'Aluguel',
    contraparte: 'Parceiro',
    vencimento: '2026-10-13',
    valor: 100,
    saldo: 100,
    categoria: 'Serviços',
    referencia: 'R42',
    entidadeTipo: 'FORNECEDOR',
    entidadeId: 3,
  } as any;
  for (const tipo of ['PAGAR', 'RECEBER'])
    for (const failure of [false, true])
      it(`edits, settles and cancels ${tipo}; failure=${failure}`, () => {
        const setup = pageSetup({}, {}, { tipo });
        const api = setup.mock(FinanceiroService);
        api.listar.and.returnValue(of({ lista: [conta], total: 1 }));
        const c = setup.create(ContasComponent);
        const dialog = {
          showModal: jasmine.createSpy(),
          close: jasmine.createSpy(),
        };
        c.dialog = new ElementRef(dialog as any);
        for (const name of ['atualizar', 'baixar', 'cancelar', 'detalhes'])
          api[name].and.returnValue(
            failure
              ? throwError(() => ({ error: { message: 'Falha' } }))
              : of({ conta, baixas: [] }),
          );
        c.abrir(conta, 'editar');
        expect(c.tituloModal).toBe('Editar conta');
        c.salvar();
        expect(api.atualizar).toHaveBeenCalledWith(
          42,
          jasmine.objectContaining({
            entidadeTipo: 'FORNECEDOR',
            entidadeId: 3,
          }),
        );
        c.abrir(conta, 'baixa');
        expect(c.tituloModal).toContain(
          tipo === 'PAGAR' ? 'pagamento' : 'recebimento',
        );
        c.baixaForm.patchValue({ observacoes: 'Nota' });
        c.baixar();
        expect(api.baixar).toHaveBeenCalledWith(
          'MANUAL',
          42,
          jasmine.objectContaining({ valor: 100, observacoes: 'Nota' }),
        );
        c.abrir(conta, 'cancelar');
        expect(c.tituloModal).toBe('Cancelar conta');
        c.cancelar();
        expect(api.cancelar).toHaveBeenCalledWith(42);
        c.abrir(conta, 'detalhes');
        expect(c.tituloModal).toBe('Detalhes da conta');
        expect(api.detalhes).toHaveBeenCalledWith('MANUAL', 42);
        if (failure)
          expect(setup.mock(ToastService).error).toHaveBeenCalledWith('Falha');
        else expect(c.detalhes()!.conta.id).toBe(42);
        expect(c.salvando()).toBeFalse();
        c.fechar();
        expect(dialog.close).toHaveBeenCalled();
      });
  it('bounds pagination, recovers empty pages and reports list/save failures', () => {
    const setup = pageSetup({}, {}, { tipo: 'PAGAR' });
    const api = setup.mock(FinanceiroService);
    api.listar.and.returnValue(of({ lista: [], total: 0 }));
    const c = setup.create(ContasComponent);
    c.dialog = new ElementRef({
      showModal: jasmine.createSpy(),
      close: jasmine.createSpy(),
    } as any);
    c.page = 4;
    c.ngOnInit();
    expect(c.page).toBe(1);
    expect(api.listar).toHaveBeenCalledTimes(2);
    expect(c.paginasVisiveis).toEqual([1]);
    c.total = 40;
    c.irParaPagina(3);
    c.irParaPagina(0);
    c.irParaPagina(5);
    expect(c.page).toBe(1);
    c.selecionada = null;
    c.cancelar();
    c.baixar();
    expect(api.cancelar).not.toHaveBeenCalled();
    c.nova();
    c.form.patchValue({ descricao: ' ', contraparte: 'Pessoa', valor: 10 });
    c.salvar();
    expect(api.criar).not.toHaveBeenCalled();
    c.form.patchValue({ descricao: 'Conta', contraparte: ' ' });
    c.salvar();
    expect(api.criar).not.toHaveBeenCalled();
    c.form.patchValue({ contraparte: 'Pessoa' });
    api.criar.and.returnValue(
      throwError(() => ({ error: { message: 'Falha' } })),
    );
    c.salvar();
    expect(c.salvando()).toBeFalse();
    api.listar.and.returnValue(throwError(() => new Error('offline')));
    c.carregar();
    expect(c.lista()).toEqual([]);
    expect(c.total).toBe(0);
    c.salvando.set(true);
    const event = { preventDefault: jasmine.createSpy() };
    c.fechar(event as any);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
