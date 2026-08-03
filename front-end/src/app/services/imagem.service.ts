import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Imagem } from '@models/imagem';
import { Observable, catchError, throwError } from 'rxjs';

export interface UploadImagemPayload {
  entityType: string;
  entityId: number;
  categoria: string;
  arquivo: File;
  principal?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImagemService {
  private readonly httpClient = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/imagens`;

  public listar(entityType: string, entityId: number, categoria?: string | null): Observable<Imagem[]> {
    const categoriaParam = categoria ? `&categoria=${encodeURIComponent(categoria)}` : '';
    return this.httpClient
      .get<Imagem[]>(`${this.url}/listar?entityType=${encodeURIComponent(entityType)}&entityId=${entityId}${categoriaParam}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  public upload(payload: UploadImagemPayload): Observable<Imagem> {
    const formData = new FormData();
    formData.append('entityType', payload.entityType);
    formData.append('entityId', String(payload.entityId));
    formData.append('categoria', payload.categoria);
    formData.append('arquivo', payload.arquivo);

    if (payload.principal !== undefined) {
      formData.append('principal', String(payload.principal));
    }

    return this.httpClient.post<Imagem>(`${this.url}/upload`, formData, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  public excluir(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.url}/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public urlConteudo(id: string): string {
    return `${this.url}/${id}/conteudo`;
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
