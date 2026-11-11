import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Equipamento } from '@models/equipamento';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipamentoService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  constructor() { }

  public cadastrarEquipamento(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/equipamento/cadastrar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarEquipamentosPorPagina(page: number, limit: number, id_empresa: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/equipamento/listar?page=${page}&limit=${limit}&id_empresa=${id_empresa}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarEquipamentoPorId(id: number): Observable<Equipamento> {
    return this.httpClient.get<Equipamento>(`${this.url}/equipamento/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarEquipamento(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/equipamento/atualizar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluirEquipamento(id: number | null): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/equipamento/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
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

