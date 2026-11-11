import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Agendamento } from '@models/agendamento';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

export interface AgendamentoPayload {
  id?: number;
  titulo: string;
  tipo_tarefa: string;
  data_agendamento: string;
  detalhes: string;
  concluido: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  public readonly tiposTarefa: string[] = [
    'Visita técnica',
    'Compra de material',
    'Entrega',
    'Reunião',
    'Instalação',
    'Retorno ao cliente'
  ];

  public cadastrar(payload: AgendamentoPayload): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/agendamento/cadastrar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listarPorPagina(page: number, limit: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/agendamento/listar?page=${page}&limit=${limit}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number): Observable<Agendamento> {
    return this.httpClient.get<Agendamento>(`${this.url}/agendamento/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizar(payload: AgendamentoPayload): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/agendamento/atualizar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluir(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/agendamento/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public montarPayload(formValue: { titulo: string | null; tipoTarefa: string | null; data: Date | null; detalhes: string | null }, id?: number | null): AgendamentoPayload {
    const dataBase = formValue.data ? new Date(formValue.data) : new Date();
    const dataAgendamento = new Date(
      dataBase.getFullYear(),
      dataBase.getMonth(),
      dataBase.getDate(),
      12,
      0,
      0
    );

    return {
      ...(id ? { id } : {}),
      titulo: formValue.titulo ?? '',
      tipo_tarefa: formValue.tipoTarefa ?? '',
      data_agendamento: this.formatarDataHora(dataAgendamento),
      detalhes: formValue.detalhes ?? '',
      concluido: false
    };
  }

  public formatarDataHora(data: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`;
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
