import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginServiceMock: jasmine.SpyObj<LoginService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    loginServiceMock = jasmine.createSpyObj('LoginService', ['validarToken', 'validarLogin']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: LoginService, useValue: loginServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('deve redirecionar para /home se o token for válido no ngOnInit', () => {
    loginServiceMock.validarToken.and.returnValue(of(true));    
    fixture.detectChanges();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('não deve redirecionar se o token for inválido no ngOnInit', () => {
    loginServiceMock.validarToken.and.returnValue(of(false));

    fixture.detectChanges();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve realizar login com sucesso e redirecionar para /home', () => {
    loginServiceMock.validarToken.and.returnValue(of(false));
    loginServiceMock.validarLogin.and.returnValue(of({ expiration: '20000', status: 200, userName: 'user', message: 'teste' }));

    fixture.detectChanges();

    component.loginForm.setValue({ login: 'user', senha: '123' });
    component.logar();

    expect(sessionStorage.getItem('userName')).toBe('user');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('deve limpar o formulário e setar invalido=true quando o login der 401', () => {
    loginServiceMock.validarToken.and.returnValue(of(false));

    loginServiceMock.validarLogin.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    fixture.detectChanges();
    component.loginForm.setValue({ login: 'user', senha: '123' });
    component.logar();

    expect(component.invalido).toBeTrue();
    expect(component.loginForm.value).toEqual({ login: '', senha: '' });
  });

  it('deve mudar invalido para false ao chamar change() quando houver valores', () => {
    loginServiceMock.validarToken.and.returnValue(of(false));
    fixture.detectChanges();

    component.invalido = true;
    component.loginForm.setValue({ login: 'user', senha: '123' });

    component.change();

    expect(component.invalido).toBeFalse();
  });

});
