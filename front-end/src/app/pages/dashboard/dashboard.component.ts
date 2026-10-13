import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ContratoCalendario } from '@models/contrato-calendario';
import { DashboardService } from '@services/dashboard.service';
import { LoginService } from '@services/login.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [AeroNativeButtonComponent, CommonModule, MatCardModule, FullCalendarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  private dashboardService = inject(DashboardService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private destroyed = false;
  private areaCanvas?: HTMLCanvasElement;
  private tipoCanvas?: HTMLCanvasElement;
  private vendasCanvas?: HTMLCanvasElement;
  private pendingArea?: { labels: string[]; valores: number[] };
  private pendingTipo?: { labels: string[]; valores: number[] };
  private pendingVendas?: { labels: string[]; valores: number[] };

  @ViewChild('areaCanvas')
  set areaCanvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.areaCanvas = ref?.nativeElement;
    if (this.areaCanvas && this.pendingArea) {
      this.renderAreaChart(this.pendingArea.labels, this.pendingArea.valores);
    }
  }

  @ViewChild('tipoCanvas')
  set tipoCanvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.tipoCanvas = ref?.nativeElement;
    if (this.tipoCanvas && this.pendingTipo) {
      this.renderTipoChart(this.pendingTipo.labels, this.pendingTipo.valores);
    }
  }

  @ViewChild('vendasCanvas')
  set vendasCanvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.vendasCanvas = ref?.nativeElement;
    if (this.vendasCanvas && this.pendingVendas) {
      this.renderVendasChart(this.pendingVendas.labels, this.pendingVendas.valores);
    } else if (!this.vendasCanvas) {
      this.vendasChart?.destroy();
      this.vendasChart = null;
    }
  }

  public perfil = sessionStorage.getItem('perfil') || '';

  public lucroMes = 0;
  public lucroAno = 0;
  public contratosEncerrando = 0;
  public chamadosCancelados = 0;
  public produtosEmFalta = 0;

  public chamadosMes = 0;
  public chamadosAtrasados = 0;
  public chamadosAtendidosPorMim = 0;
  public contratosCalendario: ContratoCalendario[] = [];

  public calendarioContratosOptions: CalendarOptions = {
    plugins: [dayGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: ptBrLocale,
    firstDay: 1,
    height: 'auto',
    dayMaxEventRows: 3,
    fixedWeekCount: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listMonth'
    },
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      list: 'Lista'
    },
    noEventsContent: 'Nenhum contrato com data final cadastrada.',
    events: [],
    eventClick: ({ event }) => {
      const idEmpresa = Number(event.extendedProps['idEmpresa']);

      if (idEmpresa) {
        this.router.navigate(['/empresas/detalhes', idEmpresa]);
      }
    }
  };

  private areaChart: Chart | null = null;
  private tipoChart: Chart | null = null;
  private vendasChart: Chart | null = null;

  public ngOnInit(): void {
    this.loginService.getPerfil().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.perfil = response.role || this.perfil;
        this.loginService.persistSessionMetadata(response);
        this.carregarDashboard();
      },
      error: (error) => {
        console.log(error);
        this.carregarDashboard();
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    this.areaChart?.destroy();
    this.tipoChart?.destroy();
    this.vendasChart?.destroy();
  }

  public get isAdmin(): boolean {
    return this.perfil === 'ADMIN';
  }

  public get dashboardDescricao(): string {
    return this.isAdmin
      ? 'Resumo operacional do mês, contratos ativos e indicadores financeiros.'
      : 'Resumo operacional do mês com foco na sua execução e acompanhamento dos chamados.';
  }

  public get contratosProximosVencimentos(): ContratoCalendario[] {
    return this.contratosCalendario.filter((contrato) =>
      contrato.diasParaEncerrar >= 0 && contrato.diasParaEncerrar < 30
    );
  }

  private carregarDashboard(): void {
    this.carregarGraficoPrincipal();
    this.carregarGraficoTipoAtendimento();

    if (this.isAdmin) {
      this.carregarGraficoVendas();
      this.carregarMetricasAdmin();
      return;
    }

    this.carregarMetricasUsuario();
  }

  private carregarMetricasAdmin(): void {
    this.dashboardService.retornarLucrosDoMes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.lucroMes = response.lucro || 0;
      },
      error: (error: any) => console.log(error)
    });

    this.dashboardService.retornarLucrosDoAno().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.lucroAno = response.lucro || 0;
      },
      error: (error: any) => console.log(error)
    });

    this.dashboardService.retornarContratosAcabando().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.contratosEncerrando = response.total || 0;
      },
      error: (error: any) => console.log(error)
    });

    this.dashboardService.retornarContratosCalendario().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: ContratoCalendario[]) => {
        this.contratosCalendario = response || [];
        this.atualizarEventosCalendario();
      },
      error: (error: any) => console.log(error)
    });

    this.dashboardService.retornarChamadosCancelados().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.chamadosCancelados = response.total || 0;
      },
      error: (error: any) => console.log(error)
    });

    this.dashboardService.retornarProdutosEmFalta().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.produtosEmFalta = response.total || 0;
      },
      error: (error: any) => console.log(error)
    });
  }

  private carregarMetricasUsuario(): void {
    this.dashboardService.retornarTotalChamadosMes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.chamadosMes = response.total || 0;
      },
      error: (error: any) => console.log(error)
    });

    this.dashboardService.retornarChamadosAtrasados().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.chamadosAtrasados = response.total || 0;
      },
      error: (error: any) => console.log(error)
    });

    this.dashboardService.retornarChamadosAtendidosPorMim().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.chamadosAtendidosPorMim = response.total || 0;
      },
      error: (error: any) => console.log(error)
    });
  }

  private carregarGraficoPrincipal(): void {
    this.dashboardService.retornarLucrosPorMes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const labels = response.map((item: { mes: string }) => item.mes);
        const valores = response.map((item: { valor: number }) => item.valor);
        this.renderAreaChart(labels, valores);
      },
      error: (error: any) => console.log(error)
    });
  }

  private carregarGraficoTipoAtendimento(): void {
    this.dashboardService.retornarQuantidadeAtendimentosPorTipo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const labels = response.map((item: { tipo: string | null }) => {
          const tipo = item.tipo?.trim();
          return tipo ? tipo : 'Sem definição';
        });
        const valores = response.map((item: { quantidade: number }) => item.quantidade);
        this.renderTipoChart(labels, valores);
      },
      error: (error: any) => console.log(error)
    });
  }

  private carregarGraficoVendas(): void {
    this.dashboardService.retornarVendasPorMes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const serie = this.normalizarSerieMensal(response);
        const labels = serie.map((item) => item.mes);
        const valores = serie.map((item) => item.valor);
        this.renderVendasChart(labels, valores);
      },
      error: (error: any) => console.log(error)
    });
  }

  private renderAreaChart(labels: string[], valores: number[]): void {
    if (this.destroyed) return;
    this.pendingArea = { labels, valores };
    if (!this.areaCanvas) return;
    this.areaChart?.destroy();
    this.areaChart = new Chart(this.areaCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: this.isAdmin ? 'Valores por mês' : 'Chamados por mês',
          data: valores,
          backgroundColor: [
            'rgba(59, 130, 246, 0.25)',
            'rgba(16, 185, 129, 0.25)',
            'rgba(244, 114, 182, 0.25)',
            'rgba(245, 158, 11, 0.25)',
            'rgba(14, 165, 233, 0.25)',
            'rgba(99, 102, 241, 0.25)',
            'rgba(34, 197, 94, 0.25)',
            'rgba(239, 68, 68, 0.25)',
            'rgba(168, 85, 247, 0.25)',
            'rgba(20, 184, 166, 0.25)',
            'rgba(251, 146, 60, 0.25)',
            'rgba(100, 116, 139, 0.25)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(244, 114, 182)',
            'rgb(245, 158, 11)',
            'rgb(14, 165, 233)',
            'rgb(99, 102, 241)',
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
            'rgb(168, 85, 247)',
            'rgb(20, 184, 166)',
            'rgb(251, 146, 60)',
            'rgb(100, 116, 139)'
          ],
          borderWidth: 1,
          borderRadius: 14
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private renderTipoChart(labels: string[], valores: number[]): void {
    if (this.destroyed) return;
    this.pendingTipo = { labels, valores };
    if (!this.tipoCanvas) return;
    this.tipoChart?.destroy();
    this.tipoChart = new Chart(this.tipoCanvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: ['#0f172a', '#d99e04', '#2563eb', '#ef4444'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private renderVendasChart(labels: string[], valores: number[]): void {
    if (this.destroyed) return;
    this.pendingVendas = { labels, valores };
    if (!this.vendasCanvas) return;
    this.vendasChart?.destroy();
    this.vendasChart = new Chart(this.vendasCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vendas por mes',
          data: valores,
          backgroundColor: 'rgba(217, 158, 4, 0.22)',
          borderColor: 'rgb(217, 158, 4)',
          borderWidth: 1,
          borderRadius: 14
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private normalizarSerieMensal(response: Array<{ mes: string; valor: number }>): Array<{ mes: string; valor: number }> {
    const mapa = new Map<string, number>();
    (response || []).forEach((item) => {
      const chave = (item.mes || '').trim().toLowerCase();
      mapa.set(chave, Number(item.valor || 0));
    });

    return this.meses.map((mes) => ({
      mes,
      valor: mapa.get(mes) ?? 0
    }));
  }

  public navegarParaProdutosEmFalta(): void {
    this.router.navigate(['/produtos/em-falta']);
  }

  public navegarParaEmpresa(idEmpresa: number): void {
    this.router.navigate(['/empresas/detalhes', idEmpresa]);
  }

  public formatarDataContrato(dataFim: string): string {
    if (!dataFim) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dataFim));
  }

  public descricaoDiasRestantes(diasParaEncerrar: number): string {
    if (diasParaEncerrar < 0) {
      const diasVencidos = Math.abs(diasParaEncerrar);
      return diasVencidos === 1 ? 'Vencido há 1 dia' : `Vencido há ${diasVencidos} dias`;
    }

    if (diasParaEncerrar === 0) {
      return 'Encerra hoje';
    }

    if (diasParaEncerrar === 1) {
      return 'Encerra amanhã';
    }

    return `Encerra em ${diasParaEncerrar} dias`;
  }

  private atualizarEventosCalendario(): void {
    const events: EventInput[] = this.contratosCalendario.map((contrato) => ({
      id: String(contrato.idEmpresa),
      title: contrato.nomeFantasia,
      start: this.normalizarDataCalendario(contrato.dataFim),
      allDay: true,
      backgroundColor: this.resolverCorEventoContrato(contrato.diasParaEncerrar),
      borderColor: this.resolverCorEventoContrato(contrato.diasParaEncerrar),
      textColor: '#0f172a',
      extendedProps: {
        idEmpresa: contrato.idEmpresa,
        razaoSocial: contrato.razaoSocial,
        diasParaEncerrar: contrato.diasParaEncerrar,
        dataFim: contrato.dataFim
      }
    }));

    this.calendarioContratosOptions = {
      ...this.calendarioContratosOptions,
      events
    };
  }

  private normalizarDataCalendario(dataFim: string): string {
    return dataFim ? dataFim.slice(0, 10) : '';
  }

  private resolverCorEventoContrato(diasParaEncerrar: number): string {
    if (diasParaEncerrar < 0) {
      return '#fca5a5';
    }

    if (diasParaEncerrar <= 7) {
      return '#fdba74';
    }

    if (diasParaEncerrar <= 30) {
      return '#fde68a';
    }

    return '#93c5fd';
  }
}
