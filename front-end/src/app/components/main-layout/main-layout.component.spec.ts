import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginService } from '@services/login.service';

import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    sessionStorage.clear();
    loginServiceSpy = jasmine.createSpyObj<LoginService>('LoginService', [
      'getPerfil',
      'buscarPorToken',
      'persistSessionMetadata',
      'logout',
      'clearSessionMetadata'
    ]);
    loginServiceSpy.getPerfil.and.returnValue(of({ role: 'ADMIN' }));
    loginServiceSpy.buscarPorToken.and.returnValue(of({ nome: 'Maria' }));
    loginServiceSpy.logout.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: LoginService, useValue: loginServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carrega perfil e nome do usuario ao iniciar', () => {
    component.ngOnInit();

    expect(loginServiceSpy.getPerfil).toHaveBeenCalled();
    expect(loginServiceSpy.buscarPorToken).toHaveBeenCalled();
    expect(component.perfil).toBe('ADMIN');
    expect(component.userName).toBe('Maria');
    expect(loginServiceSpy.persistSessionMetadata).toHaveBeenCalledWith({ role: 'ADMIN' });
    expect(loginServiceSpy.persistSessionMetadata).toHaveBeenCalledWith({
      userName: 'Maria',
      perfil: 'ADMIN'
    });
  });

  it('mantem a tela responsiva e controla a sidebar', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(800);

    component.handleViewport();
    expect(component.isMobile).toBeTrue();
    expect(component.sidebarOpened).toBeFalse();

    component.toggleSidebar();
    expect(component.sidebarOpened).toBeTrue();

    component.closeSidebarOnMobile();
    expect(component.sidebarOpened).toBeFalse();
  });

  it('nao fecha a sidebar em desktop e respeita permissoes', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1280);

    component.handleViewport();
    component.closeSidebarOnMobile();

    expect(component.sidebarOpened).toBeTrue();
    component.perfil = 'DEV';
    expect(component.canAccess(['ADMIN', 'DEV'])).toBeTrue();
    component.perfil = '';
    expect(component.canAccess(['ADMIN'])).toBeFalse();
  });

  it('realiza logout com sucesso', () => {
    const navigateSpy = spyOn(component.route, 'navigate');

    component.sair();

    expect(loginServiceSpy.logout).toHaveBeenCalled();
    expect(loginServiceSpy.clearSessionMetadata).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('realiza cleanup mesmo quando logout falha', () => {
    loginServiceSpy.logout.and.returnValue(throwError(() => new Error('falha')));
    const navigateSpy = spyOn(component.route, 'navigate');

    component.sair();

    expect(loginServiceSpy.clearSessionMetadata).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('tolera erros ao carregar perfil e usuario', () => {
    spyOn(console, 'log');
    loginServiceSpy.getPerfil.and.returnValue(throwError(() => new Error('perfil')));
    loginServiceSpy.buscarPorToken.and.returnValue(throwError(() => new Error('usuario')));

    component.ngOnInit();

    expect(console.log).toHaveBeenCalledTimes(2);
  });

  it('mantem o nome atual quando a busca por token nao retorna nome', () => {
    component.userName = 'Nome Atual';
    loginServiceSpy.buscarPorToken.and.returnValue(of({ nome: '' }));

    component.ngOnInit();

    expect(component.userName).toBe('Nome Atual');
    expect(loginServiceSpy.persistSessionMetadata).toHaveBeenCalledWith({
      userName: 'Nome Atual',
      perfil: 'ADMIN'
    });
  });
});
