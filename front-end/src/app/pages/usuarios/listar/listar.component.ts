import { AeroInputComponent } from '@components/aero';
import { } from '@components/aero';
import { AeroNativeButtonComponent } from '@components/aero';
import { AeroSelectComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaLoginsResponse } from '@models/listaLoginsResponse';
import { LoginService } from '@services/login.service';

@Component({
  selector: 'app-listar',
  imports: [AeroInputComponent, AeroNativeButtonComponent, AeroSelectComponent, CommonModule, FormsModule],
  templateUrl: './listar.component.html',
  styleUrls: ['../../../components/aero/list-layout.css', './listar.component.css']
})
export class ListarComponent {

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private loginService = inject(LoginService);
  public dadosPesquisa: string | undefined;
  public resposta: string = "";
  public id: number = 0;
  public excluir: boolean = true;
  public listaLogins = signal<ListaLoginsResponse>({ lista: [], total: 0 });
  public limit = 10;
  public page: number = 1;
  public totalPages: number = 0;
  public paginacao = [{
    numero: 10, descricao: '10 por página'
  },
  {
    numero: 25, descricao: '25 por página'
  },
  {
    numero: 50, descricao: '50 por página'
  }];
  public readonly pageSizeOptions = this.paginacao.map(item => ({ value: item.numero, label: item.descricao }));

  constructor() { }

  ngOnInit(): void {
    const pageParam = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    const limitParam = Number(this.activatedRoute.snapshot.queryParamMap.get('limit'));

    if (!Number.isNaN(pageParam) && pageParam > 0) {
      this.page = pageParam;
    }

    if (!Number.isNaN(limitParam) && this.paginacao.some(item => item.numero === limitParam)) {
      this.limit = limitParam;
    }

    this.carregarLogins();
  }

  public carregarLogins() {
    this.loginService.buscarLoginsPorPagina(this.limit, this.page).subscribe({
      next: (response: ListaLoginsResponse) => {
        this.listaLogins.set(response);
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      error: (error: any) => {
        console.log(error);
      },
    })
  }

   public buscarLoginsPorAtributo() {
    this.loginService.buscarLoginsPorPagina(this.limit, this.page).subscribe({
      next: (response: ListaLoginsResponse) => {
        this.listaLogins.set(response);
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      error: (error: any) => {
        console.log(error);
      },
    })
  }

  public verificarVazio() {
    if (!this.dadosPesquisa) {
    }
  }

  public mudarTamanho() {
    this.page = 1;
    this.atualizarQueryParams();
    this.carregarLogins();
  }

  public get paginasVisiveis(): number[] {
    if (this.totalPages <= 0) {
      return [];
    }

    const inicio = Math.max(1, Math.min(this.page - 1, this.totalPages - 2));
    const fim = Math.min(this.totalPages, inicio + 2);
    return Array.from({ length: fim - inicio + 1 }, (_, index) => inicio + index);
  }

  public irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.page = pagina;
      this.atualizarQueryParams();
      this.carregarLogins();
      this.rolarParaTopo();
    }
  }

  public paginaAnterior(): void {
    if (this.page > 1) {
      this.page--;
      this.atualizarQueryParams();
      this.carregarLogins();
      this.rolarParaTopo();
    }
  }

  public proximaPagina(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.atualizarQueryParams();
      this.carregarLogins();
      this.rolarParaTopo();
    }
  }

  public cadastrarNovo() {
    this.router.navigate([`/usuarios/cadastrar`]);
  }

  public alterarLogin(id: number) {
    this.router.navigate([`/usuarios/cadastrar`],
      { queryParams: { id: id } }
    )
  }

  public modalExcluirLogin(id: number) {
    this.excluir = true;
    this.id = id;
    this.resposta = "Tem certeza que deseja excluir esse login(Essa operação é irreversível)?";
    document.getElementById("botaoModal")?.click();
  }

  public excluirLogin() {
    this.excluir = false;
    this.loginService.excluirLogin(this.id).subscribe({
      next: (response: any) => {
        this.resposta = "Login excluído com sucesso.";
        this.carregarLogins();
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = "Erro ao excluir o login!";
      },
    });
  }

  private rolarParaTopo(): void {
    const container = document.querySelector('.main-content');
    if (container instanceof HTMLElement) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private atualizarQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.page,
        limit: this.limit
      },
      replaceUrl: true
    });
  }

}
