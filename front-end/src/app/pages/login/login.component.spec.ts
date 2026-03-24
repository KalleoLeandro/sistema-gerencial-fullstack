import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginService: jasmine.SpyObj<LoginService>;
  let router: jasmine.SpyObj<Router>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', ['validarLogin', 'persistSessionMetadata']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: LoginService, useValue: loginService },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toastService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('limpa o estado invalido quando o usuario altera os campos', () => {
    component.invalido = true;
    component.loginForm.patchValue({ login: 'maria' });

    component.change();

    expect(component.invalido).toBeFalse();
  });

  it('informa invalidade do campo quando tocado', () => {
    const control = component.loginForm.get('login');
    control?.markAsTouched();

    expect(component.isInvalid('login')).toBeTrue();
  });

  it('marca o formulario quando tenta logar com campos invalidos', () => {
    spyOn(component.loginForm, 'markAllAsTouched');

    component.logar();

    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    expect(loginService.validarLogin).not.toHaveBeenCalled();
  });

  it('persiste a sessao e navega quando o login da certo', () => {
    component.loginForm.patchValue({ login: 'maria', senha: '123' });
    loginService.validarLogin.and.returnValue(of({ userName: 'Maria', perfil: 'ADMIN' } as any));

    component.logar();

    expect(loginService.persistSessionMetadata).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('trata erro 401 limpando o formulario e marcando invalido', () => {
    component.loginForm.patchValue({ login: 'maria', senha: '123' });
    loginService.validarLogin.and.returnValue(throwError(() => ({
      status: 401,
      error: { message: 'Credenciais invalidas' }
    })));

    component.logar();

    expect(toastService.error).toHaveBeenCalledWith('Credenciais invalidas');
    expect(component.invalido).toBeTrue();
    expect(component.loginForm.value).toEqual({ login: '', senha: '' });
  });
});
