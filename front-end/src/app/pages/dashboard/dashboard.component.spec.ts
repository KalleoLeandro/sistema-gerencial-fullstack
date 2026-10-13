import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardService } from '@services/dashboard.service';
import { LoginService } from '@services/login.service';
import { of, Subject, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import Chart from 'chart.js/auto';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    sessionStorage.setItem('perfil', 'ADMIN');
    dashboardServiceSpy = jasmine.createSpyObj<DashboardService>('DashboardService', [
      'retornarLucrosDoMes',
      'retornarLucrosDoAno',
      'retornarContratosAcabando',
      'retornarContratosCalendario',
      'retornarChamadosCancelados',
      'retornarTotalChamadosMes',
      'retornarChamadosAtrasados',
      'retornarChamadosAtendidosPorMim',
      'retornarProdutosEmFalta',
      'retornarVendasPorMes',
      'retornarLucrosPorMes',
      'retornarQuantidadeAtendimentosPorTipo'
    ]);

    loginServiceSpy = jasmine.createSpyObj<LoginService>('LoginService', ['getPerfil', 'persistSessionMetadata']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    dashboardServiceSpy.retornarLucrosDoMes.and.returnValue(of({ lucro: 0 }));
    dashboardServiceSpy.retornarLucrosDoAno.and.returnValue(of({ lucro: 0 }));
    dashboardServiceSpy.retornarContratosAcabando.and.returnValue(of({ total: 0 }));
    dashboardServiceSpy.retornarContratosCalendario.and.returnValue(of([]));
    dashboardServiceSpy.retornarChamadosCancelados.and.returnValue(of({ total: 0 }));
    dashboardServiceSpy.retornarTotalChamadosMes.and.returnValue(of({ total: 0 }));
    dashboardServiceSpy.retornarChamadosAtrasados.and.returnValue(of({ total: 0 }));
    dashboardServiceSpy.retornarChamadosAtendidosPorMim.and.returnValue(of({ total: 0 }));
    dashboardServiceSpy.retornarProdutosEmFalta.and.returnValue(of({ total: 0 }));
    dashboardServiceSpy.retornarVendasPorMes.and.returnValue(of([]));
    dashboardServiceSpy.retornarLucrosPorMes.and.returnValue(of([]));
    dashboardServiceSpy.retornarQuantidadeAtendimentosPorTipo.and.returnValue(of([]));
    loginServiceSpy.getPerfil.and.returnValue(of({ role: 'ADMIN' }));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cria os tres graficos mesmo quando os dados chegam antes da view', () => {
    for (const selector of ['#area', '#tipo-atendimento', '#vendas-mes']) {
      const canvas = fixture.nativeElement.querySelector(selector) as HTMLCanvasElement;
      expect(canvas).not.toBeNull();
      expect(Chart.getChart(canvas)?.canvas).toBe(canvas);
    }
  });

  it('aguarda o canvas de vendas quando o perfil ADMIN chega depois', () => {
    sessionStorage.setItem('perfil', 'USER');
    const perfil$ = new Subject<{ role: string }>();
    loginServiceSpy.getPerfil.and.returnValue(perfil$);
    dashboardServiceSpy.retornarVendasPorMes.and.returnValue(of([{ mes: 'outubro', valor: 150 }]));
    const localFixture = TestBed.createComponent(DashboardComponent);
    localFixture.detectChanges();
    expect(localFixture.nativeElement.querySelector('#vendas-mes')).toBeNull();
    expect(() => perfil$.next({ role: 'ADMIN' })).not.toThrow();
    localFixture.detectChanges();
    const canvas = localFixture.nativeElement.querySelector('#vendas-mes') as HTMLCanvasElement;
    const chart = Chart.getChart(canvas);
    expect(chart).toBeDefined();
    expect(chart?.data.datasets[0].data[9]).toBe(150);
    localFixture.destroy();
  });

  it('cancela respostas de graficos pendentes quando a tela e destruida', () => {
    const principal$ = new Subject<any[]>();
    const tipo$ = new Subject<any[]>();
    const vendas$ = new Subject<any[]>();
    dashboardServiceSpy.retornarLucrosPorMes.and.returnValue(principal$);
    dashboardServiceSpy.retornarQuantidadeAtendimentosPorTipo.and.returnValue(tipo$);
    dashboardServiceSpy.retornarVendasPorMes.and.returnValue(vendas$);
    const localFixture = TestBed.createComponent(DashboardComponent);
    localFixture.detectChanges();
    const area = spyOn<any>(localFixture.componentInstance, 'renderAreaChart').and.callThrough();
    const tipo = spyOn<any>(localFixture.componentInstance, 'renderTipoChart').and.callThrough();
    const vendas = spyOn<any>(localFixture.componentInstance, 'renderVendasChart').and.callThrough();
    localFixture.destroy();
    expect(() => {
      principal$.next([{ mes: 'outubro', valor: 100 }]);
      tipo$.next([{ tipo: 'REMOTO', quantidade: 1 }]);
      vendas$.next([{ mes: 'outubro', valor: 100 }]);
    }).not.toThrow();
    expect(area).not.toHaveBeenCalled();
    expect(tipo).not.toHaveBeenCalled();
    expect(vendas).not.toHaveBeenCalled();
  });

  it('carrega o dashboard mesmo se a consulta de perfil falhar', () => {
    loginServiceSpy.getPerfil.and.returnValue(throwError(() => new Error('falha')));
    spyOn<any>(DashboardComponent.prototype, 'carregarDashboard');

    const localFixture = TestBed.createComponent(DashboardComponent);
    localFixture.detectChanges();

    expect((DashboardComponent.prototype as any).carregarDashboard).toHaveBeenCalled();
  });

  it('expõe descricoes e status derivados do perfil', () => {
    component.perfil = 'ADMIN';
    expect(component.isAdmin).toBeTrue();
    expect(component.dashboardDescricao).toContain('financeiros');

    component.perfil = 'USER';
    expect(component.isAdmin).toBeFalse();
    expect(component.dashboardDescricao).toContain('sua execu');
  });

  it('formata contratos e descreve dias restantes', () => {
    expect(component.formatarDataContrato('2026-03-21T00:00:00')).toBe('21/03/2026');
    expect(component.formatarDataContrato('')).toBe('-');
    expect(component.descricaoDiasRestantes(-2)).toContain('2 dias');
    expect(component.descricaoDiasRestantes(0)).toBe('Encerra hoje');
    expect(component.descricaoDiasRestantes(1)).toBe('Encerra amanhã');
    expect(component.descricaoDiasRestantes(5)).toBe('Encerra em 5 dias');
  });

  it('navega para empresa a partir da acao direta e do click do calendario', () => {
    component.navegarParaEmpresa(9);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/empresas/detalhes', 9]);

    component.calendarioContratosOptions.eventClick?.({
      event: { extendedProps: { idEmpresa: 11 } }
    } as any);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/empresas/detalhes', 11]);
  });

  it('atualiza eventos do calendario com as cores esperadas', () => {
    component.contratosCalendario = [{
      idEmpresa: 1,
      nomeFantasia: 'Acme',
      razaoSocial: 'Acme LTDA',
      dataFim: '2026-03-30T00:00:00',
      diasParaEncerrar: 5
    } as any];

    (component as any).atualizarEventosCalendario();

    const events = component.calendarioContratosOptions.events as any[];
    expect(events.length).toBe(1);
    expect(events[0].start).toBe('2026-03-30');
    expect(events[0].backgroundColor).toBe('#fdba74');
  });

  it('resolve as cores dos contratos por faixa de vencimento', () => {
    expect((component as any).resolverCorEventoContrato(-1)).toBe('#fca5a5');
    expect((component as any).resolverCorEventoContrato(7)).toBe('#fdba74');
    expect((component as any).resolverCorEventoContrato(20)).toBe('#fde68a');
    expect((component as any).resolverCorEventoContrato(60)).toBe('#93c5fd');
  });

  it('destroi os graficos ao encerrar o componente', () => {
    (component as any).areaChart?.destroy();
    (component as any).tipoChart?.destroy();
    const destroy = jasmine.createSpy('destroy');
    (component as any).areaChart = { destroy } as unknown as Chart;
    (component as any).tipoChart = { destroy } as unknown as Chart;

    component.ngOnDestroy();

    expect(destroy).toHaveBeenCalledTimes(2);
  });
});
