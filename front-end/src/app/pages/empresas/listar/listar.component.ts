import { AeroNativeButtonComponent } from '@components/aero';
import { AeroSelectComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
  imports: [AeroNativeButtonComponent, AeroSelectComponent, CommonModule, FormsModule, RouterLink, RouterLinkActive, MatFormFieldModule, MatInputModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
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
  public spreadStart = 1;

  public paginaEsquerda = signal<ListaEmpresaResponse>({ lista: [], total: 0 });
  public paginaDireita = signal<ListaEmpresaResponse>({ lista: [], total: 0 });

  ngOnInit(): void {
    const pageParam = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    const limitParam = Number(this.activatedRoute.snapshot.queryParamMap.get('limit'));

    if (!Number.isNaN(pageParam) && pageParam > 0) {
      this.spreadStart = this.normalizarSpreadStart(pageParam);
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

    this.carregarLivro(this.spreadStart);
  }

  public get paginaEsquerdaNumero(): number {
    return this.spreadStart;
  }

  public get paginaDireitaNumero(): number | null {
    return this.spreadStart + 1 <= this.totalPages ? this.spreadStart + 1 : null;
  }

  public get itensPorLado(): number {
    return Math.max(1, Math.floor(this.limit / 2));
  }

  public get podeVoltar(): boolean {
    return this.spreadStart > 1;
  }

  public get podeAvancar(): boolean {
    return this.totalPages > 1 && this.spreadStart + 2 <= this.totalPages;
  }

  public get paginasVisiveis(): number[] {
    if (this.totalPages <= 0) {
      return [];
    }

    const totalSpreads = Math.ceil(this.totalPages / 2);
    const currentSpreadIndex = Math.floor((this.spreadStart - 1) / 2);
    const startSpreadIndex = Math.max(0, Math.min(currentSpreadIndex - 1, totalSpreads - 3));
    const visibleSpreadCount = Math.min(3, totalSpreads - startSpreadIndex);

    return Array.from({ length: visibleSpreadCount }, (_, index) => 1 + (startSpreadIndex + index) * 2);
  }

  public isPaginaAtiva(pagina: number): boolean {
    return pagina === this.paginaEsquerdaNumero;
  }

  public rotuloPagina(pagina: number): string {
    const paginaFinal = Math.min(pagina + 1, this.totalPages);
    return pagina === paginaFinal ? `${pagina}` : `${pagina}-${paginaFinal}`;
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
        this.carregarLivro(this.spreadStart);
      },
      error: (error: any) => {
        this.toastService.error(getHttpErrorMessage(error, 'Erro ao excluir a empresa!'));
      }
    });
  }

  public carregarEmpresas(): void {
    this.atualizarQueryParams(1);
    this.carregarLivro(1);
  }

  public cadastrarNovo(): void {
    this.router.navigate([`/clientes/cadastrar`]);
  }

  public verificarVazio(): void {
    if (!this.dadosPesquisa) {
      this.atualizarQueryParams(1);
      this.carregarLivro(1);
    }
  }

  public mudarTamanho(): void {
    this.atualizarQueryParams(1);
    this.carregarLivro(1);
  }

  public paginaAnterior(): void {
    if (!this.podeVoltar) {
      return;
    }

    const novoInicio = Math.max(1, this.spreadStart - 2);
    this.atualizarQueryParams(novoInicio);
    this.carregarLivro(novoInicio);
    this.rolarParaTopo();
  }

  public proximaPagina(): void {
    if (!this.podeAvancar) {
      return;
    }

    const novoInicio = this.spreadStart + 2;
    this.atualizarQueryParams(novoInicio);
    this.carregarLivro(novoInicio);
    this.rolarParaTopo();
  }

  public irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) {
      return;
    }

    const paginaNormalizada = this.normalizarSpreadStart(pagina);
    this.atualizarQueryParams(paginaNormalizada);
    this.carregarLivro(paginaNormalizada);
    this.rolarParaTopo();
  }

  public trackEmpresa(_: number, item: Empresa): number {
    return item.id || _;
  }

  private carregarLivro(paginaInicial: number): void {
    const paginaNormalizada = this.normalizarSpreadStart(paginaInicial);

    this.buscarPagina(paginaNormalizada).subscribe({
      next: (pagina1) => {
        this.paginaEsquerda.set(pagina1);
        this.totalItens = pagina1.total;
        this.totalPages = Math.ceil((pagina1.total || 0) / this.itensPorLado);
        this.spreadStart = this.ajustarSpreadAoTotal(paginaNormalizada);

        if (this.spreadStart !== paginaNormalizada) {
          this.carregarLivro(this.spreadStart);
          return;
        }

        const proximaPagina = this.spreadStart + 1;
        if (proximaPagina <= this.totalPages) {
          this.buscarPagina(proximaPagina).subscribe({
            next: (pagina2) => {
              this.paginaDireita.set(pagina2);
            },
            error: (error) => {
              console.log(error);
              this.paginaDireita.set({ lista: [], total: pagina1.total });
            }
          });
        } else {
          this.paginaDireita.set({ lista: [], total: pagina1.total });
        }
      },
      error: (error: any) => {
        console.log(error);
        this.paginaEsquerda.set({ lista: [], total: 0 });
        this.paginaDireita.set({ lista: [], total: 0 });
        this.totalItens = 0;
        this.totalPages = 0;
      }
    });
  }

  private buscarPagina(page: number) {
    return !this.dadosPesquisa
      ? this.empresaService.buscarEmpresasPorPagina(page, this.itensPorLado)
      : this.empresaService.buscarEmpresasPorPaginaENome(page, this.itensPorLado, this.dadosPesquisa || '');
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

  private normalizarSpreadStart(page: number): number {
    if (page <= 1) {
      return 1;
    }

    return page % 2 === 0 ? page - 1 : page;
  }

  private ajustarSpreadAoTotal(page: number): number {
    if (this.totalPages <= 0) {
      return 1;
    }

    const ultimoInicio = this.totalPages % 2 === 0 ? Math.max(1, this.totalPages - 1) : this.totalPages;
    return Math.min(this.normalizarSpreadStart(page), ultimoInicio);
  }
}
