import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Empresa } from '@models/empresa';
import { RenovacaoContrato } from '@models/renovacao-contrato';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  constructor() { }

  public cadastrarEmpresa(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/empresa/cadastrar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarEmpresa(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/empresa/atualizar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarEmpresasPorPagina(page: number, limit: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/empresa/listar?page=${page}&limit=${limit}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarEmpresasPorPaginaENome(page: number, limit: number, dadosPesquisa: string): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/empresa/listar-por-nome?page=${page}&limit=${limit}&nome=${dadosPesquisa}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number | null): Observable<Empresa> {
    return this.httpClient.get<Empresa>(`${this.url}/empresa/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluirEmpresa(id: number | null): Observable<Empresa> {
    return this.httpClient.delete<any>(`${this.url}/empresa/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public salvarDadosInfra(dadosInfra: string, id: number): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/empresa/salvar-infra/${id}`, dadosInfra, this.httpOptions).pipe(catchError(this.handleError));
  }

  public renovarContrato(id: number, payload: { data_inicio: string; data_fim: string; observacoes?: string }): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/empresa/renovar-contrato/${id}`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listarRenovacoes(id: number): Observable<RenovacaoContrato[]> {
    return this.httpClient.get<RenovacaoContrato[]>(`${this.url}/empresa/listar-renovacoes/${id}`, this.httpOptions).pipe(catchError(this.handleError));
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

