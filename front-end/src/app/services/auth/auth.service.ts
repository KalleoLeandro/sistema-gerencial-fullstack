import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from '@environments/environment';
import { AuthReponse } from '@models/authResponse';
import { criptografia } from '@utils/utils';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private httpClient = inject(HttpClient);
  private url = signal(environment.BFF);

  constructor() { }

  public validarAuth(formulario: FormGroup<any>): Observable<AuthReponse> {
    const hash = criptografia(formulario.getRawValue());
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };
    return this.httpClient.post<AuthReponse>(`${this.url()}/auth/login`, { hash }, httpOptions).pipe(
      shareReplay(),
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    )
  }

  public refresh(): Observable<AuthReponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };
    return this.httpClient.post<AuthReponse>(`${this.url()}/auth/refresh`, {}, httpOptions).pipe(
      shareReplay(),
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    )
  }

  public me() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };
    return this.httpClient.get<AuthReponse>(`${this.url()}/auth/me`, httpOptions);
  }

  public logout(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };
    return this.httpClient.post<any>(`${this.url()}/auth/logout`, {}, httpOptions).pipe(
      shareReplay(),
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    )
  }
}
