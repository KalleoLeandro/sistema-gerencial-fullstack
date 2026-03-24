import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('consulta os indicadores do dashboard com credenciais', () => {
    const endpoints = [
      ['retornarLucrosDoMes', '/api/dashboard/retornar-lucro-mes'],
      ['retornarLucrosDoAno', '/api/dashboard/retornar-lucro-ano'],
      ['retornarContratosAcabando', '/api/dashboard/retornar-contratos-acabando'],
      ['retornarChamadosCancelados', '/api/dashboard/retornar-chamados-cancelados'],
      ['retornarTotalChamadosMes', '/api/dashboard/retornar-total-chamados-mes'],
      ['retornarChamadosAtrasados', '/api/dashboard/retornar-chamados-atrasados'],
      ['retornarChamadosAtendidosPorMim', '/api/dashboard/retornar-chamados-atendidos-por-mim'],
      ['retornarLucrosPorMes', '/api/dashboard/retornar-por-mes'],
      ['retornarQuantidadeAtendimentosPorTipo', '/api/dashboard/retornar-proporcao-atendimento'],
      ['retornarContratosCalendario', '/api/dashboard/retornar-contratos-calendario'],
      ['retornarAgendaEventos', '/api/dashboard/retornar-agenda-eventos']
    ] as const;

    for (const [method, url] of endpoints) {
      (service[method] as () => any)().subscribe();
      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      expect(request.request.withCredentials).toBeTrue();
      request.flush({});
    }
  });

  it('propaga erros da API', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.retornarLucrosDoMes().subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne('/api/dashboard/retornar-lucro-mes');
    request.flush({ message: 'falha' }, { status: 503, statusText: 'Service Unavailable' });

    expect(capturedError?.status).toBe(503);
  });
});
