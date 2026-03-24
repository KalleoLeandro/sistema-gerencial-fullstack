import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ListarComponent } from './listar.component';
import { EmpresasService } from '@services/empresas.service';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';

describe('ListarComponent', () => {
  let component: ListarComponent;
  let fixture: ComponentFixture<ListarComponent>;
  let empresaService: jasmine.SpyObj<EmpresasService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: Router;

  beforeEach(async () => {
    empresaService = jasmine.createSpyObj<EmpresasService>('EmpresasService', [
      'buscarEmpresasPorPagina',
      'buscarEmpresasPorPaginaENome',
      'excluirEmpresa'
    ]);
    loginService = jasmine.createSpyObj<LoginService>('LoginService', ['getPerfil']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error']);

    loginService.getPerfil.and.returnValue(of({ role: 'ADMIN' } as any));
    empresaService.buscarEmpresasPorPagina.and.returnValue(of({ lista: [{ id: 1 }], total: 20 } as any));
    empresaService.buscarEmpresasPorPaginaENome.and.returnValue(of({ lista: [{ id: 2 }], total: 10 } as any));
    empresaService.excluirEmpresa.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [ListarComponent],
      providers: [
        provideRouter([]),
        { provide: EmpresasService, useValue: empresaService },
        { provide: LoginService, useValue: loginService },
        { provide: ToastService, useValue: toastService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'page' ? '3' : '10'
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carrega pagina dupla com parametros iniciais', () => {
    expect(component.spreadStart).toBe(3);
    expect(component.limit).toBe(10);
    expect(component.paginaEsquerda().lista.length).toBe(1);
    expect(loginService.getPerfil).toHaveBeenCalled();
  });

  it('calcula derivacoes de navegacao', () => {
    component.spreadStart = 3;
    component.totalPages = 5;

    expect(component.paginaEsquerdaNumero).toBe(3);
    expect(component.paginaDireitaNumero).toBe(4);
    expect(component.itensPorLado).toBe(5);
    expect(component.podeVoltar).toBeTrue();
    expect(component.podeAvancar).toBeTrue();
    expect(component.paginasVisiveis).toEqual([1, 3, 5]);
    expect(component.rotuloPagina(3)).toBe('3-4');
  });

  it('troca paginas e atualiza query params', () => {
    spyOn<any>(component, 'carregarLivro');
    spyOn<any>(component, 'rolarParaTopo');
    component.totalPages = 5;
    component.spreadStart = 3;

    component.paginaAnterior();
    component.proximaPagina();
    component.irParaPagina(4);

    expect(router.navigate).toHaveBeenCalled();
    expect((component as any).carregarLivro).toHaveBeenCalledTimes(3);
    expect((component as any).rolarParaTopo).toHaveBeenCalledTimes(3);
  });

  it('normaliza pagina par para o inicio do par e evita pagina vazia final', () => {
    component.totalPages = 4;

    expect(component['normalizarSpreadStart'](4)).toBe(3);
    expect(component['ajustarSpreadAoTotal'](9)).toBe(3);
  });

  it('altera entre busca simples e por nome', () => {
    component.dadosPesquisa = undefined;
    component['buscarPagina'](1).subscribe();
    expect(empresaService.buscarEmpresasPorPagina).toHaveBeenCalledWith(1, component.itensPorLado);

    component.dadosPesquisa = 'Acme';
    component['buscarPagina'](1).subscribe();
    expect(empresaService.buscarEmpresasPorPaginaENome).toHaveBeenCalledWith(1, component.itensPorLado, 'Acme');
  });

  it('abre cadastro e edicao', () => {
    component.cadastrarNovo();
    component.alterarEmpresa(4);

    expect(router.navigate).toHaveBeenCalledWith(['/empresas/cadastrar']);
    expect(router.navigate).toHaveBeenCalledWith(['/empresas/cadastrar/4']);
  });

  it('exclui empresa com sucesso', () => {
    spyOn(component as any, 'carregarLivro');
    component.id = 9;

    component.excluirEmpresa();

    expect(toastService.success).toHaveBeenCalled();
    expect((component as any).carregarLivro).toHaveBeenCalledWith(component.spreadStart);
  });

  it('trata erro ao excluir empresa', () => {
    empresaService.excluirEmpresa.and.returnValue(throwError(() => ({ error: { message: 'falhou' } })));
    component.id = 9;

    component.excluirEmpresa();

    expect(toastService.error).toHaveBeenCalledWith('falhou');
  });
});
