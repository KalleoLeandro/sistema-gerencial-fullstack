import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import { AgendaEvento } from '@models/agenda-evento';
import { DashboardService } from '@services/dashboard.service';

type AgendaFiltroTipo = 'FINALIZACAO_CONTRATO' | 'AGENDAMENTO' | 'ORDEM_SERVICO' | 'ATENDIMENTO' | 'MANUTENCAO';

interface AgendaFiltro {
  key: AgendaFiltroTipo;
  label: string;
  ativo: boolean;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [AeroNativeButtonComponent,
    CommonModule,
    MatCardModule,
    MatChipsModule,
    FullCalendarModule
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);

  public agendaEventos: AgendaEvento[] = [];
  public readonly filtros: AgendaFiltro[] = [
    { key: 'FINALIZACAO_CONTRATO', label: 'Finalização de contrato', ativo: true },
    { key: 'AGENDAMENTO', label: 'Agendamentos', ativo: true },
    { key: 'ORDEM_SERVICO', label: 'Ordem de serviço', ativo: true },
    { key: 'ATENDIMENTO', label: 'Atendimentos', ativo: true },
    { key: 'MANUTENCAO', label: 'Manutenção', ativo: true }
  ];

  public calendarioOptions: CalendarOptions = {
    plugins: [dayGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: ptBrLocale,
    firstDay: 1,
    height: 'auto',
    dayMaxEventRows: 4,
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
    noEventsContent: 'Nenhum compromisso disponível.',
    events: [],
    eventClick: ({ event }) => {
      this.navegarParaDetalhe({
        tipo: String(event.extendedProps['tipo']),
        referenciaId: Number(event.extendedProps['referenciaId']),
        empresaId: event.extendedProps['empresaId'] ? Number(event.extendedProps['empresaId']) : null,
        titulo: String(event.title || ''),
        subtitulo: String(event.extendedProps['subtitulo'] || ''),
        dataEvento: String(event.extendedProps['dataEvento'] || ''),
        concluido: Boolean(event.extendedProps['concluido'])
      });
    }
  };

  public ngOnInit(): void {
    this.carregarAgenda();
  }

  public abrirCadastroAgendamento(): void {
    this.router.navigate(['/agenda/cadastrar']);
  }

  public atualizarFiltro(tipo: AgendaFiltroTipo, ativo: boolean): void {
    const filtro = this.filtros.find((item) => item.key === tipo);

    if (!filtro) {
      return;
    }

    filtro.ativo = ativo;
    this.atualizarEventosCalendario();
  }

  public navegarParaDetalhe(evento: AgendaEvento): void {
    if (evento.tipo === 'AGENDAMENTO') {
      this.router.navigate(['/agenda/detalhes', evento.referenciaId]);
      return;
    }

    const rota = this.resolverRotaEvento(evento);

    if (rota.length) {
      this.router.navigate(rota);
    }
  }

  public formatarDataEvento(dataEvento: string): string {
    if (!dataEvento) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dataEvento));
  }

  public get eventosFiltrados(): AgendaEvento[] {
    const tiposAtivos = new Set(this.filtros.filter((filtro) => filtro.ativo).map((filtro) => filtro.key));
    return this.todosEventos.filter((evento) => tiposAtivos.has(evento.tipo as AgendaFiltroTipo));
  }

  public descricaoTipo(tipo: string): string {
    switch (tipo as AgendaFiltroTipo) {
      case 'FINALIZACAO_CONTRATO':
        return 'Finalização de contrato';
      case 'AGENDAMENTO':
        return 'Agendamento';
      case 'ORDEM_SERVICO':
        return 'Ordem de serviço';
      case 'ATENDIMENTO':
        return 'Atendimento';
      case 'MANUTENCAO':
        return 'Manutenção';
      default:
        return tipo;
    }
  }

  public classesStatusEvento(evento: AgendaEvento): string[] {
    return this.eventoEmAtraso(evento) ? ['is-overdue'] : [];
  }

  public descricaoStatus(concluido: boolean): string {
    return concluido ? 'Concluído' : 'Não concluído';
  }

  public tituloEvento(evento: AgendaEvento): string {
    return evento.concluido ? `✓ ${evento.titulo}` : evento.titulo;
  }

  private carregarAgenda(): void {
    this.dashboardService.retornarAgendaEventos().subscribe({
      next: (response: AgendaEvento[]) => {
        this.agendaEventos = response || [];
        this.atualizarEventosCalendario();
      },
      error: (error: any) => console.log(error)
    });
  }

  private atualizarEventosCalendario(): void {
    const events: EventInput[] = this.eventosFiltrados.map((evento) => ({
      id: `${evento.tipo}-${evento.referenciaId}`,
      title: this.tituloEvento(evento),
      start: this.normalizarDataCalendario(evento.dataEvento),
      allDay: true,
      backgroundColor: 'transparent',
      borderColor: this.resolverCorEvento(evento.concluido),
      textColor: '#0f172a',
      extendedProps: {
        tipo: evento.tipo,
        referenciaId: evento.referenciaId,
        empresaId: evento.empresaId,
        subtitulo: evento.subtitulo,
        dataEvento: evento.dataEvento,
        concluido: evento.concluido
      }
    }));

    this.calendarioOptions = {
      ...this.calendarioOptions,
      events
    };
  }

  private normalizarDataCalendario(dataEvento: string): string {
    return dataEvento ? dataEvento.slice(0, 10) : '';
  }

  private get todosEventos(): AgendaEvento[] {
    return this.agendaEventos;
  }

  private resolverCorEvento(concluido: boolean): string {
    return concluido ? '#16a34a' : '#d97706';
  }

  private eventoEmAtraso(evento: AgendaEvento): boolean {
    if (evento.concluido || !evento.dataEvento) {
      return false;
    }

    return new Date(evento.dataEvento).getTime() < Date.now();
  }

  private resolverRotaEvento(evento: AgendaEvento): (string | number)[] {
    switch (evento.tipo as AgendaFiltroTipo) {
      case 'FINALIZACAO_CONTRATO':
        return evento.empresaId ? ['/empresas/detalhes', evento.empresaId] : [];
      case 'ORDEM_SERVICO':
        return ['/avulsos/detalhes', evento.referenciaId];
      case 'ATENDIMENTO':
        return ['/atendimentos/detalhes', evento.referenciaId];
      case 'MANUTENCAO':
        return ['/manutencao/detalhes', evento.referenciaId];
      default:
        return [];
    }
  }
}
