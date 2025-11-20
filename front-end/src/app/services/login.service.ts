import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from '@environments/environment';
import { LoginReponse } from '@models/LoginReponse';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private httpClient = inject(HttpClient);
  private url = signal(environment.BFF);

  public validarLogin(hash: string): Observable<LoginReponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };
    return this.httpClient.post<LoginReponse>(`${this.url()}/validar-login`, { hash }, httpOptions).pipe(
      shareReplay(),
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    )
  }

  public validarToken(): Observable<Boolean> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    }

    return this.httpClient.post<Boolean>(`${this.url()}/validar-token`, null, httpOptions).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    );
  }

  public getPerfil(token: string): Observable<Boolean> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    }

    return this.httpClient.post<Boolean>(`${this.url()}/retorna-perfil`, null, httpOptions).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    );
  }

  public buscarUsuarioPorId(id: number | null): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    }

    return this.httpClient.get<Boolean>(`${this.url()}/buscar-login-por-id/${id}`, httpOptions).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    );
  }

  public atualizarUsuario(formulario: FormGroup<any>): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    }

    return this.httpClient.put<any>(`${this.url()}/atualizar-login`, formulario.getRawValue(), httpOptions).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    );
  }

  public cadastrarUsuario(formulario: FormGroup<any>): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    }

    return this.httpClient.post<any>(`${this.url()}/cadastrar-login`, formulario.getRawValue(), httpOptions).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    );
  }

  public buscarLoginsPorPagina(page: number, limit: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    }

    return this.httpClient.get<any>(`${this.url()}/buscar-usuarios-por-pagina?page=${page}&limit=${limit}`, httpOptions).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    );
  }

  public excluirUsuario(id: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    }

    return this.httpClient.delete<any>(`${this.url()}/excluir-login/${id}`, httpOptions).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => error)
      )
    );
  }
}