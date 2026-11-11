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
    empresaService.buscarEmpresasPorPagina.and.returnValue(of({ lista: [{ id: 1 }], total: 50 } as any));
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

  it('carrega apenas a página solicitada com o limite completo', () => {
    expect(component.page).toBe(3);
    expect(component.empresas().lista.length).toBe(1);
    expect(empresaService.buscarEmpresasPorPagina).toHaveBeenCalledOnceWith(3, 10);
    expect(fixture.nativeElement.querySelector('.book-shell')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('navega sequencialmente, incluindo páginas pares', () => {
    component.irParaPagina(4);
    expect(component.page).toBe(4);
    expect(empresaService.buscarEmpresasPorPagina).toHaveBeenCalledWith(4, 10);
    expect(component.paginasVisiveis).toEqual([3, 4, 5]);
  });

  it('reinicia a pagina ao alterar o tamanho', () => {
    component.limit = 25;
    component.mudarTamanho();
    expect(component.page).toBe(1);
    expect(empresaService.buscarEmpresasPorPagina).toHaveBeenCalledWith(1, 25);
    expect(component.totalPages).toBe(2);
  });

  it('ajusta a pagina quando o total diminui', () => {
    empresaService.buscarEmpresasPorPagina.and.returnValue(of({ lista: [], total: 12 }));
    component.irParaPagina(5);
    expect(component.page).toBe(2);
    expect(empresaService.buscarEmpresasPorPagina).toHaveBeenCalledWith(2, 10);
  });

  it('altera entre busca simples e por nome', () => {
    component.dadosPesquisa = undefined;
    component['buscarPagina'](1).subscribe();
    expect(empresaService.buscarEmpresasPorPagina).toHaveBeenCalledWith(1, component.limit);

    component.dadosPesquisa = 'Acme';
    component['buscarPagina'](1).subscribe();
    expect(empresaService.buscarEmpresasPorPaginaENome).toHaveBeenCalledWith(1, component.limit, 'Acme');
  });

  it('abre cadastro e edicao', () => {
    component.cadastrarNovo();
    component.alterarEmpresa(4);

    expect(router.navigate).toHaveBeenCalledWith(['/clientes/cadastrar']);
    expect(router.navigate).toHaveBeenCalledWith(['/clientes/cadastrar/4']);
  });

  it('exclui empresa com sucesso', () => {
    spyOn(component as any, 'carregarPagina');
    component.id = 9;

    component.excluirEmpresa();

    expect(toastService.success).toHaveBeenCalled();
    expect((component as any).carregarPagina).toHaveBeenCalledWith(component.page);
  });

  it('trata erro ao excluir empresa', () => {
    empresaService.excluirEmpresa.and.returnValue(throwError(() => ({ error: { message: 'falhou' } })));
    component.id = 9;

    component.excluirEmpresa();

    expect(toastService.error).toHaveBeenCalledWith('falhou');
  });
});
