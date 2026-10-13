import { AeroInputComponent } from '@components/aero';
import { } from '@components/aero';
import { AeroNativeButtonComponent } from '@components/aero';
import { AeroSelectComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Empresa } from '@models/empresa';
import { ListaEmpresaResponse } from '@models/listaEmpresaResponse';
import { EmpresasService } from '@services/empresas.service';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';

@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [AeroInputComponent, AeroNativeButtonComponent, AeroSelectComponent, CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './listar.component.html',
  styleUrls: ['../../../components/aero/list-layout.css', './listar.component.css']
})
export class ListarComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private empresaService = inject(EmpresasService);
  private loginService = inject(LoginService);
  private toastService = inject(ToastService);

  public perfil: string = sessionStorage.getItem('perfil') || '';
  public resposta = '';
  public excluir = true;
  public id = 0;
  public dadosPesquisa: string | undefined;
  public paginacao = [
    { numero: 10, descricao: '10 por página' },
    { numero: 25, descricao: '25 por página' },
    { numero: 50, descricao: '50 por página' }
  ];

  public readonly pageSizeOptions = this.paginacao.map(item => ({ value: item.numero, label: item.descricao }));
  public limit = 10;
  public totalPages = 0;
  public totalItens = 0;
  public page = 1;
  public empresas = signal<ListaEmpresaResponse>({ lista: [], total: 0 });

  ngOnInit(): void {
    const pageParam = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    const limitParam = Number(this.activatedRoute.snapshot.queryParamMap.get('limit'));

    if (!Number.isNaN(pageParam) && pageParam > 0) {
      this.page = pageParam;
    }

    if (!Number.isNaN(limitParam) && this.paginacao.some(item => item.numero === limitParam)) {
      this.limit = limitParam;
    }

    this.loginService.getPerfil().subscribe({
      next: (response) => {
        this.perfil = response.role;
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.carregarPagina(this.page);
  }

  public get paginasVisiveis(): number[] {
    const inicio = Math.max(1, Math.min(this.page - 1, this.totalPages - 2));
    const fim = Math.min(this.totalPages, inicio + 2);
    return Array.from({ length: Math.max(0, fim - inicio + 1) }, (_, index) => inicio + index);
  }

  public alterarEmpresa(id: number): void {
    this.router.navigate([`/clientes/cadastrar/${id}`]);
  }

  public modalExcluirEmpresa(id: number): void {
    if (!window.confirm('Tem certeza que deseja excluir essa empresa? Essa operação é irreversível.')) {
      return;
    }

    this.id = id;
    this.excluirEmpresa();
  }

  public excluirEmpresa(): void {
    this.empresaService.excluirEmpresa(this.id).subscribe({
      next: () => {
        this.toastService.success('Empresa excluída com sucesso.');
        this.carregarPagina(this.page);
      },
      error: (error: any) => {
        this.toastService.error(getHttpErrorMessage(error, 'Erro ao excluir a empresa!'));
      }
    });
  }

  public carregarEmpresas(): void {
    this.atualizarQueryParams(1);
    this.carregarPagina(1);
  }

  public cadastrarNovo(): void {
    this.router.navigate([`/clientes/cadastrar`]);
  }

  public verificarVazio(): void {
    if (!this.dadosPesquisa) {
      this.atualizarQueryParams(1);
      this.carregarPagina(1);
    }
  }

  public mudarTamanho(): void {
    this.atualizarQueryParams(1);
    this.carregarPagina(1);
  }

  public irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.atualizarQueryParams(pagina);
    this.carregarPagina(pagina);
    this.rolarParaTopo();
  }

  private carregarPagina(page: number): void {
    this.page = page;
    this.buscarPagina(page).subscribe({
      next: (response) => {
        this.empresas.set(response);
        this.totalItens = response.total;
        this.totalPages = Math.max(1, Math.ceil(response.total / this.limit));
        if (this.page > this.totalPages) {
          this.atualizarQueryParams(this.totalPages);
          this.carregarPagina(this.totalPages);
        }
      },
      error: (error) => {
        this.empresas.set({ lista: [], total: 0 });
        this.totalItens = 0;
        this.totalPages = 1;
        this.toastService.error(getHttpErrorMessage(error, 'Não foi possível carregar os clientes.'));
      }
    });
  }

  private buscarPagina(page: number) {
    return !this.dadosPesquisa
      ? this.empresaService.buscarEmpresasPorPagina(page, this.limit)
      : this.empresaService.buscarEmpresasPorPaginaENome(page, this.limit, this.dadosPesquisa || '');
  }

  private rolarParaTopo(): void {
    const container = document.querySelector('.main-content');
    if (container instanceof HTMLElement) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private atualizarQueryParams(page: number): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page,
        limit: this.limit
      },
      replaceUrl: true
    });
  }

}
