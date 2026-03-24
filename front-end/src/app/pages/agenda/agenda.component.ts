import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import { AgendaEvento } from '@models/agenda-evento';
import { DashboardService } from '@services/dashboard.service';
import { ToastService } from '@services/toast.service';

type AgendaFiltroTipo = 'FINALIZACAO_CONTRATO' | 'AGENDAMENTO' | 'ORDEM_SERVICO' | 'ATENDIMENTO' | 'MANUTENCAO';

interface AgendaFiltro {
  key: AgendaFiltroTipo;
  label: string;
  ativo: boolean;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FullCalendarModule
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);

  public agendaEventos: AgendaEvento[] = [];
  public agendamentosLocais: AgendaEvento[] = [];
  public mostrarFormularioAgendamento = false;
  public agendamentoEmEdicaoId: number | null = null;
  public readonly tiposTarefa: string[] = [
    'Visita técnica',
    'Compra de material',
    'Entrega',
    'Reunião',
    'Instalação',
    'Retorno ao cliente'
  ];
  public readonly filtros: AgendaFiltro[] = [
    { key: 'FINALIZACAO_CONTRATO', label: 'Finalização de contrato', ativo: true },
    { key: 'AGENDAMENTO', label: 'Agendamentos', ativo: true },
    { key: 'ORDEM_SERVICO', label: 'Ordem de serviço', ativo: true },
    { key: 'ATENDIMENTO', label: 'Atendimentos', ativo: true },
    { key: 'MANUTENCAO', label: 'Manutenção', ativo: true }
  ];

  public agendamentoForm = this.formBuilder.group({
    titulo: ['', Validators.required],
    tipoTarefa: ['', Validators.required],
    data: [null as Date | null, Validators.required],
    detalhes: ['', Validators.required]
  });

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
    this.mostrarFormularioAgendamento = true;
    this.agendamentoEmEdicaoId = null;
    this.agendamentoForm.reset();
  }

  public cancelarCadastroAgendamento(): void {
    this.mostrarFormularioAgendamento = false;
    this.agendamentoEmEdicaoId = null;
    this.agendamentoForm.reset();
  }

  public salvarAgendamentoLocal(): void {
    if (this.agendamentoForm.invalid) {
      this.agendamentoForm.markAllAsTouched();
      return;
    }

    const { titulo, tipoTarefa, data, detalhes } = this.agendamentoForm.getRawValue();
    const dataEvento = data ? new Date(data) : null;

    if (!dataEvento) {
      this.agendamentoForm.controls['data'].markAsTouched();
      return;
    }

    const agendamento: AgendaEvento = {
      tipo: 'AGENDAMENTO',
      referenciaId: this.agendamentoEmEdicaoId ?? Date.now(),
      empresaId: null,
      titulo: titulo?.trim() || '',
      subtitulo: `${tipoTarefa} | ${detalhes?.trim() || ''}`,
      dataEvento: new Date(dataEvento.getFullYear(), dataEvento.getMonth(), dataEvento.getDate(), 12, 0, 0).toISOString(),
      concluido: false
    };

    if (this.agendamentoEmEdicaoId) {
      this.agendamentosLocais = this.agendamentosLocais.map((item) =>
        item.referenciaId === this.agendamentoEmEdicaoId ? agendamento : item
      );
    } else {
      this.agendamentosLocais = [agendamento, ...this.agendamentosLocais];
    }

    this.atualizarEventosCalendario();
    this.toastService.success(this.agendamentoEmEdicaoId ? 'Agendamento local atualizado.' : 'Agendamento adicionado apenas no frontend.');
    this.cancelarCadastroAgendamento();
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
    if (this.isAgendamentoLocal(evento)) {
      this.editarAgendamentoLocal(evento.referenciaId);
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

  public get tituloFormularioAgendamento(): string {
    return this.agendamentoEmEdicaoId ? 'Editar agendamento' : 'Novo agendamento';
  }

  public get subtituloFormularioAgendamento(): string {
    return this.agendamentoEmEdicaoId ? 'Edição local' : 'Cadastro local';
  }

  public get textoAcaoFormularioAgendamento(): string {
    return this.agendamentoEmEdicaoId ? 'Salvar alterações' : 'Adicionar à agenda';
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
    return [...this.agendamentosLocais, ...this.agendaEventos];
  }

  private editarAgendamentoLocal(referenciaId: number): void {
    const agendamento = this.agendamentosLocais.find((item) => item.referenciaId === referenciaId);

    if (!agendamento) {
      return;
    }

    const [tipoTarefa, ...detalhes] = agendamento.subtitulo.split(' | ');

    this.agendamentoEmEdicaoId = agendamento.referenciaId;
    this.mostrarFormularioAgendamento = true;
    this.agendamentoForm.setValue({
      titulo: agendamento.titulo,
      tipoTarefa: tipoTarefa || '',
      data: agendamento.dataEvento ? new Date(agendamento.dataEvento) : null,
      detalhes: detalhes.join(' | ')
    });
  }

  private isAgendamentoLocal(evento: AgendaEvento): boolean {
    return evento.tipo === 'AGENDAMENTO' && this.agendamentosLocais.some((item) => item.referenciaId === evento.referenciaId);
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
