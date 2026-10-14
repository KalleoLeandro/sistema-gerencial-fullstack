import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DetalhesComponent } from './detalhes.component';
import { of, throwError } from 'rxjs';
import { DetalhesComponent as Cliente } from './detalhes.component';
import { EmpresasService } from '@services/empresas.service';
import { EquipamentoService } from '@services/equipamento.service';
import { AtendimentoService } from '@services/atendimento.service';
import { ManutencaoService } from '@services/manutencao.service';
import { LoginService } from '@services/login.service';
import { PdfExportService } from '@services/pdf-export.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../testing/page.testing';

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

describe('Customer details and histories', () => {
  let setup: ReturnType<typeof pageSetup>;
  let c: Cliente;
  beforeEach(() => {
    setup = pageSetup({}, { id: '42' });
    setup.mock(EmpresasService).buscarPorId.and.returnValue(
      of({
        id: 42,
        nome_fantasia: 'Loja',
        possui_contrato: true,
        infraestrutura: 'Rede',
      }),
    );
    setup
      .mock(EmpresasService)
      .listarRenovacoes.and.returnValue(of([{ id: 1 }]));
    setup
      .mock(EquipamentoService)
      .buscarEquipamentosPorPagina.and.returnValue(
        of({ lista: [{ id: 1 }], total: 30 }),
      );
    setup
      .mock(AtendimentoService)
      .buscarAtendimentosPorPagina.and.returnValue(
        of({ lista: [{ id: 2 }], total: 30 }),
      );
    setup
      .mock(ManutencaoService)
      .buscarManutencoesPorCliente.and.returnValue(
        of({ lista: [{ id: 3 }], total: 30 }),
      );
    setup.mock(LoginService).getPerfil.and.returnValue(of({ role: 'ADMIN' }));
    c = setup.create(Cliente);
    spyOn(console, 'log');
  });
  it('loads contract resources, profile and independent history pagination', () => {
    c.ngOnInit();
    expect(c.perfil).toBe('ADMIN');
    expect(c.exibeRecursosContrato).toBeTrue();
    expect(c.renovacoesContrato().length).toBe(1);
    expect(c.listaEquipamentos().total).toBe(30);
    expect(c.listaAtendimentos().total).toBe(30);
    expect(c.listaManutencoes().total).toBe(30);
    for (const suffix of ['', 'Historico']) {
      const page = suffix ? 'pageHistorico' : 'page';
      const instance = c as any;
      instance['irParaPagina' + suffix](2);
      expect(instance[page]).toBe(2);
      instance['irParaPagina' + suffix](0);
      instance['irParaPagina' + suffix](4);
      expect(instance[page]).toBe(2);
      instance['paginaAnterior' + suffix]();
      expect(instance[page]).toBe(1);
      instance['paginaAnterior' + suffix]();
      instance['proximaPagina' + suffix]();
      expect(instance[page]).toBe(2);
      instance['irParaPagina' + suffix](3);
      instance['proximaPagina' + suffix]();
      expect(instance[page]).toBe(3);
      instance['mudarTamanho' + suffix]();
      expect(instance[page]).toBe(1);
    }
  });
  it('edits/cancels infrastructure and persists nonempty values', () => {
    c.ngOnInit();
    c.habilitarEdicaoInfra();
    expect(c.editandoInfra).toBeTrue();
    c.dadosInfra = 'Modificado';
    c.cancelarEdicaoInfra();
    expect(c.dadosInfra).toBe('Rede');
    c.dadosInfra = ' ';
    c.salvarDadosInfra();
    expect(setup.mock(EmpresasService).salvarDadosInfra).not.toHaveBeenCalled();
    c.dadosInfra = 'Nova rede';
    c.salvarDadosInfra();
    expect(c.empresa!.infraestrutura).toBe('Nova rede');
    expect(c.editandoInfra).toBeFalse();
    setup
      .mock(EmpresasService)
      .salvarDadosInfra.and.returnValue(throwError(() => new Error('offline')));
    c.salvarDadosInfra();
    expect(console.log).toHaveBeenCalled();
  });
  it('opens related screens and exports a customer document', () => {
    c.ngOnInit();
    c.alterarEmpresa();
    c.renovarContrato();
    c.alterarEquipamento(1);
    c.cadastrarNovoEquipamento();
    c.cadastrarNovoAtendimento();
    c.detalharAtendimento(2);
    c.detalharManutencao(3);
    c.voltar();
    expect(setup.router.navigate).toHaveBeenCalledTimes(8);
    c.exportarPdf();
    expect(setup.mock(PdfExportService).exportElementToPdf).toHaveBeenCalled();
    expect(c.formatarExecutores('[{"nome":"Ana"},{"nome":"Bia"}]')).toBe(
      'Ana, Bia',
    );
    expect(c.formatarExecutores('invalid')).toBe('');
  });
  it('deletes a customer only after confirmation and reports backend failure', () => {
    c.ngOnInit();
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    c.modalExcluirEmpresa();
    expect(setup.mock(EmpresasService).excluirEmpresa).not.toHaveBeenCalled();
    confirm.and.returnValue(true);
    c.modalExcluirEmpresa();
    expect(setup.mock(EmpresasService).excluirEmpresa).toHaveBeenCalledWith(42);
    setup
      .mock(EmpresasService)
      .excluirEmpresa.and.returnValue(
        throwError(() => ({ error: { message: 'Falha' } })),
      );
    c.excluirEmpresa();
    expect(setup.mock(ToastService).error).toHaveBeenCalledWith('Falha');
    c.resposta = 'Erro';
    c.redirecionar();
    c.resposta = 'Sucesso';
    c.excluir = false;
    c.redirecionar();
    expect(setup.router.navigate).toHaveBeenCalledWith(['/clientes/listar']);
  });
  for (const config of [
    {
      modal: 'modalExcluirEquipamento',
      token: EquipamentoService,
      method: 'excluirEquipamento',
    },
    {
      modal: 'modalExcluirHistoricoAtendimento',
      token: AtendimentoService,
      method: 'excluirHistoricoAtendimento',
    },
  ])
    it(`dispatches ${config.modal} and refreshes relevant history`, () => {
      c.ngOnInit();
      (c as any)[config.modal](7);
      c.excluirPorTipo();
      expect(setup.mock(config.token)[config.method]).toHaveBeenCalledWith(7);
      setup
        .mock(config.token)
        [config.method].and.returnValue(throwError(() => new Error('offline')));
      c.excluirPorTipo();
      expect(c.resposta).toContain('Erro');
      (c as any).tipoExclusao = 2;
      c.excluirPorTipo();
    });
  it('handles failures in each data source and missing renewal lists', () => {
    for (const [token, api, load] of [
      [EmpresasService, 'buscarPorId', 'carregarEmpresa'],
      [
        EquipamentoService,
        'buscarEquipamentosPorPagina',
        'carregarEquipamentos',
      ],
      [
        AtendimentoService,
        'buscarAtendimentosPorPagina',
        'carregarHistoricoAtendimentos',
      ],
      [ManutencaoService, 'buscarManutencoesPorCliente', 'carregarManutencoes'],
      [EmpresasService, 'listarRenovacoes', 'carregarRenovacoesContrato'],
    ] as const) {
      setup
        .mock(token)
        [api].and.returnValue(throwError(() => new Error('offline')));
      (c as any)[load]();
    }
    expect(c.renovacoesContrato()).toEqual([]);
    expect(console.log).toHaveBeenCalled();
    setup.mock(EmpresasService).listarRenovacoes.and.returnValue(of(null));
    c.carregarRenovacoesContrato();
    expect(c.renovacoesContrato()).toEqual([]);
    setup
      .mock(LoginService)
      .getPerfil.and.returnValue(throwError(() => new Error('offline')));
    c.ngOnInit();
    expect(console.log).toHaveBeenCalled();
  });
});
