import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LoginCadastro } from '@models/loginCadastro';
import { LoginReponse } from '@models/loginResponse';
import { environment } from '@environments/environment';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  constructor() { }

  public validarLogin(formulario: FormGroup<any>): Observable<LoginReponse> {
    return this.httpClient.post<LoginReponse>(`${this.url}/login/validar-login`, formulario.getRawValue(), this.httpOptions).pipe(
      shareReplay(),
      catchError(this.handleError)
    );
  }

  public refreshToken(): Observable<LoginReponse> {
    return this.httpClient.post<LoginReponse>(`${this.url}/login/refresh`, null, this.httpOptions).pipe(catchError(this.handleError));
  }

  public logout(): Observable<void> {
    return this.httpClient.post<void>(`${this.url}/login/logout`, null, this.httpOptions).pipe(catchError(this.handleError));
  }

  public validarToken(): Observable<boolean> {
    return this.httpClient.post<boolean>(`${this.url}/login/validar-token`, null, this.httpOptions).pipe(catchError(this.handleError));
  }

  public getPerfil(): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/login/retorna-perfil`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public cadastrarUsuario(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/login/cadastrar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarUsuario(formulario: FormGroup<any>): Observable<any> {
    return this.httpClient.put<any>(`${this.url}/login/atualizar`, formulario.getRawValue(), this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorId(id: number | null): Observable<LoginCadastro> {
    return this.httpClient.get<LoginCadastro>(`${this.url}/login/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorToken(): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/login/buscar-por-token`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarPorNome(nome: string | null): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/login/buscar-por-nome?nome=${nome}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarLoginsPorPagina(limit: number, page: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/login/listar?page=${page}&limit=${limit}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarTodos(): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/login/listar-todos`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public excluirLogin(id: number | null): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/login/excluir/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public persistSessionMetadata(response: LoginReponse | { userName?: string; perfil?: string; role?: string }): void {
    const userName = response.userName ?? sessionStorage.getItem('userName') ?? '';
    const perfil = response.perfil ?? ('role' in response ? response.role : undefined) ?? sessionStorage.getItem('perfil') ?? '';

    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('perfil', perfil);
  }

  public clearSessionMetadata(): void {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('perfil');
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

