import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginService } from '@services/login.service';

import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let router: Router;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    sessionStorage.clear();
    loginServiceSpy = jasmine.createSpyObj<LoginService>('LoginService', [
      'validarToken',
      'refreshToken',
      'getPerfil',
      'buscarPorToken',
      'persistSessionMetadata',
      'logout',
      'clearSessionMetadata',
      'markLogoutRequested',
      'isLogoutRequested'
    ]);

    loginServiceSpy.validarToken.and.returnValue(of(true));
    loginServiceSpy.refreshToken.and.returnValue(of({ userName: 'Maria', perfil: 'ADMIN' } as any));
    loginServiceSpy.getPerfil.and.returnValue(of({ role: 'ADMIN' }));
    loginServiceSpy.buscarPorToken.and.returnValue(of({ nome: 'Maria' }));
    loginServiceSpy.logout.and.returnValue(of(void 0));
    loginServiceSpy.isLogoutRequested.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: LoginService, useValue: loginServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('carrega perfil e nome do usuario ao iniciar', () => {
    fixture.detectChanges();

    expect(loginServiceSpy.validarToken).toHaveBeenCalled();
    expect(loginServiceSpy.getPerfil).toHaveBeenCalled();
    expect(loginServiceSpy.buscarPorToken).toHaveBeenCalled();
    expect((component as any).perfil()).toBe('ADMIN');
    expect((component as any).userName()).toBe('Maria');
    expect(loginServiceSpy.persistSessionMetadata).toHaveBeenCalledWith({
      userName: 'Maria',
      perfil: 'ADMIN'
    });
  });

  it('renova a sessao quando o token atual nao e valido', () => {
    loginServiceSpy.validarToken.and.returnValue(of(false));

    fixture.detectChanges();

    expect(loginServiceSpy.refreshToken).toHaveBeenCalled();
    expect(loginServiceSpy.persistSessionMetadata).toHaveBeenCalledWith({
      userName: 'Maria',
      perfil: 'ADMIN'
    } as any);
  });

  it('mantem a tela responsiva e controla a sidebar', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(800);

    fixture.detectChanges();
    component.handleViewport();

    expect((component as any).isDesktop()).toBeFalse();
    expect((component as any).sidebarOpen()).toBeFalse();

    (component as any).toggleSidebar();
    expect((component as any).sidebarOpen()).toBeTrue();

    (component as any).closeSidebar();
    expect((component as any).sidebarOpen()).toBeFalse();
  });

  it('mantem a sidebar aberta em desktop e filtra a navegacao por perfil', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1280);

    fixture.detectChanges();
    component.handleViewport();
    (component as any).closeSidebar();
    (component as any).perfil.set('DEV');

    const items = (component as any).visibleNavItems();

    expect((component as any).sidebarOpen()).toBeTrue();
    expect(items.some((item: { route: string }) => item.route === '/usuarios/listar')).toBeTrue();

    (component as any).perfil.set('COMERCIAL');
    expect((component as any).visibleNavItems().some((item: { route: string }) => item.route === '/usuarios/listar')).toBeFalse();
  });

  it('realiza logout com sucesso', () => {
    fixture.detectChanges();
    const navigateSpy = spyOn(router, 'navigate');

    (component as any).logout();

    expect(loginServiceSpy.markLogoutRequested).toHaveBeenCalled();
    expect(loginServiceSpy.logout).toHaveBeenCalled();
    expect(loginServiceSpy.clearSessionMetadata).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('realiza cleanup mesmo quando o logout falha', () => {
    loginServiceSpy.logout.and.returnValue(throwError(() => new Error('falha')));

    fixture.detectChanges();
    const navigateSpy = spyOn(router, 'navigate');

    (component as any).logout();

    expect(loginServiceSpy.clearSessionMetadata).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('encerra a sessao local quando a validacao falha', () => {
    loginServiceSpy.validarToken.and.returnValue(throwError(() => new Error('falha')));
    const navigateSpy = spyOn(router, 'navigate');

    fixture.detectChanges();

    expect(loginServiceSpy.clearSessionMetadata).toHaveBeenCalled();
    expect((component as any).userName()).toBe('');
    expect((component as any).perfil()).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('monta a saudacao usando o nome salvo na sessao', () => {
    sessionStorage.setItem('userName', 'Nome Atual');

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect((component as any).welcomeLabel()).toBe('Bem vindo Maria');
  });
});
