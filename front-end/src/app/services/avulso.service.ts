import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Avulso } from '@models/avulso';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvulsoService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  constructor() { }

  public cadastrarAvulso(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/avulso/cadastrar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarAvulsosPorPagina(page: number, limit: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/avulso/listar?page=${page}&limit=${limit}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarAvulsosAtributoEPorPagina(page: number, limit: number, pesquisa: string, tipoConsulta: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/avulso/listar-com-pesquisa?page=${page}&limit=${limit}&pesquisa=${pesquisa}&tipoConsulta=${tipoConsulta}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number | null): Observable<Avulso> {
    return this.httpClient.get<Avulso>(`${this.url}/avulso/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarAvulso(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/avulso/atualizar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public alterarStatusAtendimento(id: number, status: number, motivo_cancelamento: string): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/avulso/alterar-status`, { motivo_cancelamento: motivo_cancelamento ?? '' }, {
      ...this.httpOptions,
      params: { id, status }
    }).pipe(catchError(this.handleError));
  }

  public excluirAvulso(id: number | null): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/avulso/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
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

