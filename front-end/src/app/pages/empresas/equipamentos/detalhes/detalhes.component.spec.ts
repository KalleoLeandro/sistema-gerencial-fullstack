import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DetalhesComponent } from './detalhes.component';
import { of, throwError } from 'rxjs';
import { DetalhesComponent as Equipamento } from './detalhes.component';
import { EquipamentoService } from '@services/equipamento.service';
import { ManutencaoService } from '@services/manutencao.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../../testing/page.testing';

describe('DetalhesComponent', () => {
  let component: DetalhesComponent;
  let fixture: ComponentFixture<DetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Equipment detail actions', () => {
  it('loads equipment, navigates history and handles confirmation/error paths', () => {
    const setup = pageSetup({ id_empresa: '3' }, { id: '42' });
    spyOn(console, 'log');
    const api = setup.mock(EquipamentoService);
    const history = setup.mock(ManutencaoService);
    api.buscarEquipamentoPorId.and.returnValue(
      of({ id: 42, id_empresa: 3, nome_maquina: 'PC' }),
    );
    history.buscarManutencoesPorPagina.and.returnValue(
      of({ lista: [{ id: 1 }], total: 30 }),
    );
    const c = setup.create(Equipamento);
    c.ngOnInit();
    expect(c.equipamento!.id).toBe(42);
    expect(c.listaManutencao().total).toBe(30);
    c.irParaPaginaHistorico(2);
    c.irParaPaginaHistorico(0);
    c.irParaPaginaHistorico(4);
    expect(c.pageHistorico).toBe(2);
    c.paginaAnteriorHistorico();
    c.paginaAnteriorHistorico();
    c.proximaPaginaHistorico();
    c.proximaPaginaHistorico();
    c.proximaPaginaHistorico();
    expect(c.pageHistorico).toBe(3);
    c.mudarTamanhoHistorico();
    expect(c.pageHistorico).toBe(1);
    c.alterarEquipamento();
    c.alterarHistoricoManutencao(7);
    c.detalharManutencao(7);
    c.cadastrarNovaManutencao();
    c.exportarPdf();
    c.redirecionar();
    expect(setup.router.navigate).toHaveBeenCalledTimes(4);
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    c.modalExcluirEquipamento();
    c.modalExcluirManutencao(7);
    expect(api.excluirEquipamento).not.toHaveBeenCalled();
    confirm.and.returnValue(true);
    c.modalExcluirEquipamento();
    c.modalExcluirManutencao(7);
    expect(api.excluirEquipamento).toHaveBeenCalledWith('42');
    expect(history.excluirManutencao).toHaveBeenCalledWith(7);
    for (const [mock, method, action] of [
      [api, 'buscarEquipamentoPorId', () => c.carregarEquipamento()],
      [
        history,
        'buscarManutencoesPorPagina',
        () => c.carregarHistoricoEquipamento(42),
      ],
      [api, 'excluirEquipamento', () => c.excluirEquipamento()],
      [history, 'excluirManutencao', () => c.excluirManutencao()],
    ] as const) {
      mock[method].and.returnValue(throwError(() => new Error('offline')));
      action();
    }
    expect(console.log).toHaveBeenCalled();
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
  });
});
