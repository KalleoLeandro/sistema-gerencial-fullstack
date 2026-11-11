import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ListaPaginada } from '@models/lista-paginada';
import { Produto } from '@models/produto';
import { Observable, catchError, throwError } from 'rxjs';

export interface ProdutoPayload {
  id?: number;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  unidade_medida?: string | null;
  valor_custo?: number | null;
  valor_venda?: number | null;
  estoque_atual?: number | null;
  estoque_minimo?: number | null;
  ativo?: boolean | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  public cadastrar(payload: ProdutoPayload): Observable<any> {
    return this.httpClient.post<number>(`${this.url}/produtos/cadastrar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizar(payload: ProdutoPayload): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/produtos/atualizar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listar(page: number, limit: number): Observable<ListaPaginada<Produto>> {
    return this.httpClient.get<ListaPaginada<Produto>>(`${this.url}/produtos/listar?page=${page}&limit=${limit}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listarAtivos(): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.url}/produtos/listar-ativos`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listarEmFalta(): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.url}/produtos/listar-em-falta`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.url}/produtos/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluir(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/produtos/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
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
