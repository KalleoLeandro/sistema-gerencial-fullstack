import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  constructor() { }

  public retornarLucrosDoMes(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-lucro-mes`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarLucrosDoAno(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-lucro-ano`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarContratosAcabando(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-contratos-acabando`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarChamadosCancelados(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-chamados-cancelados`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarTotalChamadosMes(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-total-chamados-mes`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarChamadosAtrasados(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-chamados-atrasados`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarChamadosAtendidosPorMim(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-chamados-atendidos-por-mim`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarProdutosEmFalta(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-produtos-em-falta`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarLucrosPorMes(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-por-mes`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarVendasPorMes(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-vendas-por-mes`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarQuantidadeAtendimentosPorTipo(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-proporcao-atendimento`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarContratosCalendario(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-contratos-calendario`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public retornarAgendaEventos(_token?: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/retornar-agenda-eventos`, this.httpOptions).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }
}

