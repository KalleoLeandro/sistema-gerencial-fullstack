import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaPaginada } from '@models/lista-paginada';
import { Orcamento } from '@models/orcamento';
import { ComercialService } from '@services/comercial.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-comercial-orcamentos-listar',
  imports: [CommonModule, FormsModule, CurrencyPipe, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
})
export class ListarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly comercialService = inject(ComercialService);
  private readonly toastService = inject(ToastService);

  public readonly orcamentos = signal<ListaPaginada<Orcamento>>({ lista: [], total: 0 });
  public paginacao = [
    { numero: 10, descricao: '10 por pagina' },
    { numero: 25, descricao: '25 por pagina' },
    { numero: 50, descricao: '50 por pagina' }
  ];
  public pesquisa = '';
  public limit = 10;
  public page = 1;
  public totalPages = 0;

  ngOnInit(): void {
    const pageParam = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    const limitParam = Number(this.activatedRoute.snapshot.queryParamMap.get('limit'));
    this.pesquisa = this.activatedRoute.snapshot.queryParamMap.get('pesquisa') || '';

    if (!Number.isNaN(pageParam) && pageParam > 0) {
      this.page = pageParam;
    }

    if (!Number.isNaN(limitParam) && this.paginacao.some(item => item.numero === limitParam)) {
      this.limit = limitParam;
    }

    this.carregar();
  }

  public carregar(): void {
    this.comercialService.listarOrcamentos(this.page, this.limit, this.pesquisa).subscribe({
      next: (response) => {
        this.orcamentos.set(response);
        this.totalPages = Math.max(1, Math.ceil(response.total / this.limit));
      },
      error: () => this.toastService.error('Nao foi possivel carregar os orcamentos.')
    });
  }

  public pesquisar(): void {
    this.page = 1;
    this.atualizarQueryParams();
    this.carregar();
  }

  public abrirDetalhes(id: number): void {
    this.router.navigate(['/comercial/vendas/orcamentos/detalhes', id]);
  }

  public editarOrcamento(id: number): void {
    this.router.navigate(['/comercial/vendas/orcamentos/editar', id]);
  }

  public novoOrcamento(): void {
    this.router.navigate(['/comercial/vendas/orcamento']);
  }

  public abrirVendas(): void {
    this.router.navigate(['/comercial/vendas/listar']);
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
      queryParams: { page: this.page, limit: this.limit, pesquisa: this.pesquisa || null },
      replaceUrl: true
    });
  }
}
