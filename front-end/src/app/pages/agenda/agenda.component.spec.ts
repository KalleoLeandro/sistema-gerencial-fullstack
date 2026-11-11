import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardService } from '@services/dashboard.service';
import { AgendaComponent } from './agenda.component';
import { throwError } from 'rxjs';
import { pageSetup } from '../../testing/page.testing';

describe('AgendaComponent', () => {
  let component: AgendaComponent;
  let fixture: ComponentFixture<AgendaComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj<DashboardService>(
      'DashboardService',
      ['retornarAgendaEventos'],
    );
    dashboardServiceSpy.retornarAgendaEventos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AgendaComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: dashboardServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Agenda workflow', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 13, 12));
  });
  afterEach(() => jasmine.clock().uninstall());
  it('loads events, filters types, formats statuses and navigates each event kind', () => {
    const setup = pageSetup();
    const dashboard = jasmine.createSpyObj('Dashboard', [
      'retornarAgendaEventos',
    ]);
    const kinds = [
      'FINALIZACAO_CONTRATO',
      'AGENDAMENTO',
      'ORDEM_SERVICO',
      'ATENDIMENTO',
      'MANUTENCAO',
    ];
    const events = kinds.map((tipo, index) => ({
      tipo,
      referenciaId: index + 1,
      empresaId: 3,
      titulo: 'Evento',
      subtitulo: 'Detalhes',
      dataEvento: '2026-10-12T12:00:00',
      concluido: index === 0,
    }));
    dashboard.retornarAgendaEventos.and.returnValue(of(events));
    TestBed.overrideProvider(DashboardService, { useValue: dashboard });
    const c = setup.create(AgendaComponent);
    c.ngOnInit();
    expect(c.eventosFiltrados.length).toBe(5);
    for (const event of events) {
      c.navegarParaDetalhe(event);
      expect(c.descricaoTipo(event.tipo)).not.toBe(event.tipo);
      expect(c.tituloEvento(event)).toContain('Evento');
    }
    expect(setup.router.navigate).toHaveBeenCalledTimes(5);
    c.abrirCadastroAgendamento();
    c.atualizarFiltro('AGENDAMENTO', false);
    expect(c.eventosFiltrados.length).toBe(4);
    c.atualizarFiltro('missing' as any, false);
    expect(c.descricaoTipo('OUTRO')).toBe('OUTRO');
    expect(c.descricaoStatus(true)).toContain('Concluído');
    expect(c.descricaoStatus(false)).toContain('Não');
    expect(c.classesStatusEvento(events[0])).toEqual([]);
    expect(c.classesStatusEvento(events[1])).toEqual(['is-overdue']);
    expect(c.classesStatusEvento({ ...events[1], dataEvento: '' })).toEqual([]);
    expect(c.formatarDataEvento('')).toBe('-');
    expect(c.formatarDataEvento('2026-10-13T12:00:00')).toContain('13/10/2026');
    c.navegarParaDetalhe({ ...events[0], empresaId: null });
    c.navegarParaDetalhe({ ...events[0], tipo: 'OUTRO' });
    expect(setup.router.navigate).toHaveBeenCalledTimes(6);
    (c.calendarioOptions.eventClick as any)({
      event: {
        extendedProps: { tipo: 'AGENDAMENTO', referenciaId: 42 },
        title: '',
      },
    });
    expect(setup.router.navigate).toHaveBeenCalledWith([
      '/agenda/detalhes',
      42,
    ]);
    (c.calendarioOptions.eventClick as any)({
      event: {
        extendedProps: {
          tipo: 'ATENDIMENTO',
          referenciaId: 42,
          empresaId: 3,
          subtitulo: 'Teste',
          dataEvento: '',
          concluido: true,
        },
        title: 'Atendimento',
      },
    });
    dashboard.retornarAgendaEventos.and.returnValue(of(null));
    c.ngOnInit();
    expect(c.eventosFiltrados).toEqual([]);
    spyOn(console, 'log');
    dashboard.retornarAgendaEventos.and.returnValue(
      throwError(() => new Error('offline')),
    );
    c.ngOnInit();
    expect(console.log).toHaveBeenCalled();
  });
});
