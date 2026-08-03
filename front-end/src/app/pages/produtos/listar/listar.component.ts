import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaPaginada } from '@models/lista-paginada';
import { Produto } from '@models/produto';
import { ImagemService } from '@services/imagem.service';
import { ProdutoService } from '@services/produto.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-produtos-listar',
  imports: [CommonModule, FormsModule, CurrencyPipe, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
})
export class ListarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly produtoService = inject(ProdutoService);
  private readonly imagemService = inject(ImagemService);
  private readonly toastService = inject(ToastService);

  public readonly produtos = signal<ListaPaginada<Produto>>({ lista: [], total: 0 });
  public paginacao = [
    { numero: 10, descricao: '10 por pagina' },
    { numero: 25, descricao: '25 por pagina' },
    { numero: 50, descricao: '50 por pagina' }
  ];
  public limit = 10;
  public page = 1;
  public totalPages = 0;

  ngOnInit(): void {
    const pageParam = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    const limitParam = Number(this.activatedRoute.snapshot.queryParamMap.get('limit'));

    if (!Number.isNaN(pageParam) && pageParam > 0) {
      this.page = pageParam;
    }

    if (!Number.isNaN(limitParam) && this.paginacao.some(item => item.numero === limitParam)) {
      this.limit = limitParam;
    }

    this.carregar();
  }

  public carregar(): void {
    this.produtoService.listar(this.page, this.limit).subscribe({
      next: (response) => {
        this.produtos.set(response);
        this.totalPages = Math.max(1, Math.ceil(response.total / this.limit));
      },
      error: () => this.toastService.error('Nao foi possivel carregar os produtos.')
    });
  }

  public cadastrarNovo(): void {
    this.router.navigate(['/produtos/cadastrar']);
  }

  public editar(id: number): void {
    this.router.navigate(['/produtos/cadastrar', id]);
  }

  public excluir(id: number): void {
    const confirmou = window.confirm('Deseja excluir este produto?');
    if (!confirmou) {
      return;
    }

    this.produtoService.excluir(id).subscribe({
      next: () => {
        this.toastService.success('Produto excluido com sucesso.');
        this.carregar();
      },
      error: () => this.toastService.error('Nao foi possivel excluir o produto.')
    });
  }

  public urlImagemExibicao(produto: Produto): string | null {
    return produto.imagem_exibicao_id ? this.imagemService.urlConteudo(produto.imagem_exibicao_id) : null;
  }

  public mudarTamanho(): void {
    this.page = 1;
    this.atualizarQueryParams();
    this.carregar();
  }

  public irParaPagina(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.page = page;
    this.atualizarQueryParams();
    this.carregar();
  }

  public get paginasVisiveis(): number[] {
    if (this.totalPages <= 0) {
      return [];
    }

    const inicio = Math.max(1, Math.min(this.page - 1, this.totalPages - 2));
    const fim = Math.min(this.totalPages, inicio + 2);
    return Array.from({ length: fim - inicio + 1 }, (_, index) => inicio + index);
  }

  private atualizarQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: this.page, limit: this.limit },
      replaceUrl: true
    });
  }
}
