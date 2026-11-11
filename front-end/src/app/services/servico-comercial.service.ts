import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ListaPaginada } from '@models/lista-paginada';
import { ServicoComercial } from '@models/servico-comercial';
import { Observable, catchError, throwError } from 'rxjs';

export interface ServicoPayload {
  id?: number;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  valor_padrao?: number | null;
  ativo?: boolean | null;
}

@Injectable({
  providedIn: 'root'
})
export class ServicoComercialService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  public cadastrar(payload: ServicoPayload): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/servicos/cadastrar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizar(payload: ServicoPayload): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/servicos/atualizar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listar(page: number, limit: number): Observable<ListaPaginada<ServicoComercial>> {
    return this.httpClient.get<ListaPaginada<ServicoComercial>>(`${this.url}/servicos/listar?page=${page}&limit=${limit}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listarAtivos(): Observable<ServicoComercial[]> {
    return this.httpClient.get<ServicoComercial[]>(`${this.url}/servicos/listar-ativos`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number): Observable<ServicoComercial> {
    return this.httpClient.get<ServicoComercial>(`${this.url}/servicos/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluir(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/servicos/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
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
