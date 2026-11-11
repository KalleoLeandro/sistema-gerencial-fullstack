import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Atendimento } from '@models/atendimento';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtendimentoService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  constructor() { }

  public cadastrarAtendimento(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/atendimento/cadastrar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarAtendimento(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/atendimento/atualizar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public alterarStatusAtendimento(id: number, status: number, motivo_cancelamento: string): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/atendimento/alterar-status`, { motivo_cancelamento: motivo_cancelamento ?? '' }, {
      ...this.httpOptions,
      params: { id, status }
    }).pipe(catchError(this.handleError));
  }

  public buscarAtendimentosPorPagina(page: number, limit: number, id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/atendimento/listar?page=${page}&limit=${limit}&id=${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number | null): Observable<Atendimento> {
    return this.httpClient.get<Atendimento>(`${this.url}/atendimento/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluirHistoricoAtendimento(id: number | null): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/atendimento/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
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

