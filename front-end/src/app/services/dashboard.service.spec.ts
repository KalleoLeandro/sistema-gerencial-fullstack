import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@environments/environment';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

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
      ['retornarLucrosDoMes', `${apiUrl}/dashboard/retornar-lucro-mes`],
      ['retornarLucrosDoAno', `${apiUrl}/dashboard/retornar-lucro-ano`],
      ['retornarContratosAcabando', `${apiUrl}/dashboard/retornar-contratos-acabando`],
      ['retornarChamadosCancelados', `${apiUrl}/dashboard/retornar-chamados-cancelados`],
      ['retornarTotalChamadosMes', `${apiUrl}/dashboard/retornar-total-chamados-mes`],
      ['retornarChamadosAtrasados', `${apiUrl}/dashboard/retornar-chamados-atrasados`],
      ['retornarChamadosAtendidosPorMim', `${apiUrl}/dashboard/retornar-chamados-atendidos-por-mim`],
      ['retornarLucrosPorMes', `${apiUrl}/dashboard/retornar-por-mes`],
      ['retornarQuantidadeAtendimentosPorTipo', `${apiUrl}/dashboard/retornar-proporcao-atendimento`],
      ['retornarContratosCalendario', `${apiUrl}/dashboard/retornar-contratos-calendario`],
      ['retornarAgendaEventos', `${apiUrl}/dashboard/retornar-agenda-eventos`]
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

    const request = httpMock.expectOne(`${apiUrl}/dashboard/retornar-lucro-mes`);
    request.flush({ message: 'falha' }, { status: 503, statusText: 'Service Unavailable' });

    expect(capturedError?.status).toBe(503);
  });
});
