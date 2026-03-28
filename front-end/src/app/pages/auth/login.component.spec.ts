import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthComponent } from './auth.component';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let loginService: jasmine.SpyObj<LoginService>;
  let router: jasmine.SpyObj<Router>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', ['validarLogin', 'persistSessionMetadata']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        { provide: LoginService, useValue: loginService },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('nao deve chamar API se form invalido', () => {
    spyOn(component.AuthForm, 'markAllAsTouched');

    component.entrar();

    expect(component.AuthForm.markAllAsTouched).toHaveBeenCalled();
    expect(loginService.validarLogin).not.toHaveBeenCalled();
  });

  it('deve persistir a sessao e navegar para /dashboard', () => {
    loginService.validarLogin.and.returnValue(of({ userName: 'Kalleo', perfil: 'ADMIN' } as any));
    component.AuthForm.patchValue({ login: 'admin', senha: '123' });

    component.entrar();

    expect(loginService.persistSessionMetadata).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('deve tratar erro 401', () => {
    loginService.validarLogin.and.returnValue(
      throwError(() => ({
        status: 401,
        error: { message: 'Credenciais invalidas' }
      }))
    );
    component.AuthForm.patchValue({ login: 'user', senha: '123' });

    component.entrar();

    expect(component.AuthForm.value.login).toBe('');
    expect(component.AuthForm.value.senha).toBe('');
    expect(toastService.error).toHaveBeenCalledWith('Login e/ou senha invalidos');
  });

  it('deve tratar erro generico', () => {
    loginService.validarLogin.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    component.AuthForm.patchValue({ login: 'user', senha: '123' });

    component.entrar();

    expect(toastService.error).toHaveBeenCalledWith(
      'Erro ao efetuar o login. A API pode estar fora do ar ou o recurso foi alterado.'
    );
  });
});
