import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Produto } from '@models/produto';
import { ProdutoService } from '@services/produto.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-produtos-em-falta',
  imports: [AeroNativeButtonComponent, CommonModule, CurrencyPipe],
  templateUrl: './em-falta.component.html',
  styleUrl: './em-falta.component.css'
})
export class EmFaltaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);

  public readonly produtos = signal<Produto[]>([]);

  public ngOnInit(): void {
    this.carregar();
  }

  public carregar(): void {
    this.produtoService.listarEmFalta().subscribe({
      next: (response) => this.produtos.set(response || []),
      error: () => this.toastService.error('Nao foi possivel carregar os produtos em falta.')
    });
  }

  public voltarParaDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  public editar(id: number): void {
    this.router.navigate(['/produtos/cadastrar', id]);
  }

  public get totalProdutos(): number {
    return this.produtos().length;
  }
}
