import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ContasComponent } from './contas.component';
import { FinanceiroService } from '@services/financeiro.service';
import { ToastService } from '@services/toast.service';
import { ContaFinanceira } from '@models/financeiro';

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
