import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ListarComponent } from './listar.component';
import { of, throwError } from 'rxjs';
import { ListarComponent as Avulsos } from './listar.component';
import { AvulsoService } from '@services/avulso.service';
import { pageSetup } from '../../../testing/page.testing';

describe('ListarComponent', () => {
  let component: ListarComponent;
  let fixture: ComponentFixture<ListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Standalone service order listing', () => {
  it('filters, pages, edits and deletes orders with date/executor formatting', () => {
    const setup = pageSetup({ page: '2', limit: '25' });
    const api = setup.mock(AvulsoService);
    spyOn(console, 'log');
    spyOn(window, 'scrollTo');
    api.buscarAvulsosPorPagina.and.returnValue(
      of({ lista: [{ id: 1 }], total: 100 }),
    );
    api.buscarAvulsosAtributoEPorPagina.and.returnValue(
      of({ lista: [{ id: 2 }], total: 100 }),
    );
    const c = setup.create(Avulsos);
    expect(c.paginasVisiveis).toEqual([]);
    c.ngOnInit();
    expect(c.page).toBe(2);
    expect(c.limit).toBe(25);
    expect(c.paginasVisiveis).toEqual([1, 2, 3]);
    c.onDataInicioPesquisaChange(new Date(2026, 9, 13));
    expect(c.dadosPesquisa).toBe('13/10/2026');
    c.carregarHistoricoAvulsos();
    expect(c.listaAvulsos().lista[0].id).toBe(2);
    c.irParaPagina(4);
    c.irParaPagina(0);
    c.irParaPagina(5);
    c.proximaPagina();
    expect(c.page).toBe(4);
    c.paginaAnterior();
    expect(c.page).toBe(3);
    c.irParaPagina(1);
    c.paginaAnterior();
    c.proximaPagina();
    c.mudarTamanho();
    expect(c.page).toBe(1);
    c.limparPesquisa();
    c.onDataInicioPesquisaChange(null);
    c.verificarVazio();
    c.cadastrarNovo();
    c.alterarAvulso(7);
    c.modalExcluirAvulso(7);
    c.excluirAvulso();
    expect(api.excluirAvulso).toHaveBeenCalledWith(7);
    expect(c.formatarExecutores('[{"nome":"Ana"}]')).toBe('Ana');
    expect(c.formatarExecutores('invalid')).toBe('');
    for (const method of [
      'buscarAvulsosPorPagina',
      'buscarAvulsosAtributoEPorPagina',
      'excluirAvulso',
    ])
      api[method].and.returnValue(throwError(() => new Error('offline')));
    c.carregarHistoricoAvulsos();
    c.dadosPesquisa = 'Ana';
    c.carregarHistoricoAvulsos();
    c.excluirAvulso();
    expect(c.resposta).toContain('Erro');
    const container = document.createElement('div');
    container.className = 'main-content';
    document.body.append(container);
    const scroll = spyOn(container, 'scrollTo');
    try {
      c.irParaPagina(2);
      expect(scroll).toHaveBeenCalled();
    } finally {
      container.remove();
    }
  });
});
