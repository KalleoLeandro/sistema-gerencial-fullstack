import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  
  private httpClient = inject(HttpClient);  

  constructor() { }

  public formatarDatas(data: Date) {        
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()} ${pad(data.getHours())}:${pad(data.getMinutes())}`
  }

  public buscarEnderecoPorCep(cep: string) {
    return this.httpClient.get<any>(`https://viacep.com.br/ws/${cep}/json/`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
