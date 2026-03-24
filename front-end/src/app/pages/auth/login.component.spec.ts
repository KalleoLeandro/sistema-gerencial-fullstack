import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { AuthService } from 'app/services/auth/auth.service';
import { ToastService } from 'app/services/toast/toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AuthComponent', () => {

  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  let authServiceMock: any;
  let toastServiceMock: any;
  let router: Router;

  beforeEach(async () => {

    authServiceMock = {
      validarAuth: jasmine.createSpy('validarAuth')
    };

    toastServiceMock = {
      show: jasmine.createSpy('show')
    };

    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('nÃ£o deve chamar API se form invÃ¡lido', () => {
    component.AuthForm.patchValue({
      login: '',
      senha: ''
    });

    component.entrar();

    expect(authServiceMock.validarAuth).not.toHaveBeenCalled();
  });

  it('deve fazer login admin e navegar para /selecao', () => {
    authServiceMock.validarAuth.and.returnValue(of({
      userName: 'Kalleo',
      perfil: 'admin'
    }));

    component.AuthForm.patchValue({
      login: 'admin',
      senha: '123'
    });

    component.entrar();

    expect(router.navigate).toHaveBeenCalledWith(['/selecao']);
  });

  it('deve fazer login user e navegar para /', () => {
    authServiceMock.validarAuth.and.returnValue(of({
      userName: 'Kalleo',
      perfil: 'user'
    }));

    component.AuthForm.patchValue({
      login: 'user',
      senha: '123'
    });

    component.entrar();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('deve tratar erro 401', () => {
    authServiceMock.validarAuth.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component.AuthForm.patchValue({
      login: 'user',
      senha: '123'
    });

    component.entrar();

    expect(component.AuthForm.value.login).toBe('');
    expect(component.AuthForm.value.senha).toBe('');
    expect(toastServiceMock.show).toHaveBeenCalledWith('Login e/ou senha invÃ¡lidos');
  });

  it('deve tratar erro genÃ©rico', () => {
    authServiceMock.validarAuth.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.AuthForm.patchValue({
      login: 'user',
      senha: '123'
    });

    component.entrar();

    expect(toastServiceMock.show).toHaveBeenCalledWith(
      'Erro ao efetuar o login. A API pode estar fora do ar ou o caminho de destino do recurso foi modificado'
    );
  });
});
