import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ListarComponent } from './listar.component';
import { LoginService } from '@services/login.service';

describe('ListarComponent', () => {
  let component: ListarComponent;
  let fixture: ComponentFixture<ListarComponent>;
  let router: jasmine.SpyObj<Router>;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    loginService = jasmine.createSpyObj<LoginService>('LoginService', ['buscarLoginsPorPagina', 'excluirLogin']);
    loginService.buscarLoginsPorPagina.and.returnValue(of({ lista: [{ id: 1 }], total: 21 } as any));
    loginService.excluirLogin.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ListarComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: LoginService, useValue: loginService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'page' ? '2' : '25'
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carrega parametros iniciais e pagina os logins', () => {
    expect(component.page).toBe(2);
    expect(component.limit).toBe(25);
    expect(component.totalPages).toBe(1);
    expect(loginService.buscarLoginsPorPagina).toHaveBeenCalledWith(25, 2);
  });

  it('retorna paginas visiveis', () => {
    component.page = 2;
    component.totalPages = 5;

    expect(component.paginasVisiveis).toEqual([1, 2, 3]);
  });

  it('navega e recarrega quando troca de pagina', () => {
    component.totalPages = 4;
    spyOn<any>(component, 'carregarLogins');
    spyOn<any>(component, 'rolarParaTopo');

    component.irParaPagina(3);
    component.paginaAnterior();
    component.proximaPagina();

    expect(router.navigate).toHaveBeenCalled();
    expect((component as any).carregarLogins).toHaveBeenCalledTimes(3);
    expect((component as any).rolarParaTopo).toHaveBeenCalledTimes(3);
  });

  it('abre cadastro e edicao', () => {
    component.cadastrarNovo();
    component.alterarLogin(8);

    expect(router.navigate).toHaveBeenCalledWith(['/usuarios/cadastrar']);
    expect(router.navigate).toHaveBeenCalledWith(['/usuarios/cadastrar'], { queryParams: { id: 8 } });
  });

  it('prepara a exclusao e atualiza a resposta quando conclui', () => {
    spyOn(component, 'carregarLogins');

    component.modalExcluirLogin(7);
    expect(component.id).toBe(7);
    expect(component.excluir).toBeTrue();

    component.excluirLogin();

    expect(component.excluir).toBeFalse();
    expect(component.resposta).toContain('sucesso');
    expect(component.carregarLogins).toHaveBeenCalled();
  });

  it('trata erro ao excluir login', () => {
    loginService.excluirLogin.and.returnValue(throwError(() => new Error('erro')));
    component.id = 4;

    component.excluirLogin();

    expect(component.resposta).toContain('Erro ao excluir');
  });
});
