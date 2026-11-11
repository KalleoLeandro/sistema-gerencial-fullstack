import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Manutencao } from '@models/manutencao';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManutencaoService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  constructor() { }

  public cadastrarManutencao(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/manutencao/cadastrar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarManutencao(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/manutencao/atualizar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public alterarStatusManutencao(id: number, status: number, motivo_cancelamento: string): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/manutencao/alterar-status`, { motivo_cancelamento: motivo_cancelamento ?? '' }, {
      ...this.httpOptions,
      params: { id, status }
    }).pipe(catchError(this.handleError));
  }

  public buscarManutencoesPorPagina(page: number, limit: number, id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/manutencao/listar?page=${page}&limit=${limit}&id=${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarManutencoesPorCliente(page: number, limit: number, id_empresa: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/manutencao/listar-por-cliente?page=${page}&limit=${limit}&id_empresa=${id_empresa}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number | null): Observable<Manutencao> {
    return this.httpClient.get<Manutencao>(`${this.url}/manutencao/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluirManutencao(id: number | null): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/manutencao/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
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

