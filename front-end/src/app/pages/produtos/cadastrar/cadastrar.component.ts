import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { ProdutoPayload, ProdutoService } from '@services/produto.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-produtos-cadastrar',
  imports: [CommonModule, FormsModule, CurrencyMaskModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, FormSubmitLoaderComponent],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);

  public id: number | null = null;
  public salvando = false;
  public readonly moneyMaskOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', align: 'left', allowNegative: false };
  public form: ProdutoPayload = {
    codigo: '',
    nome: '',
    descricao: '',
    unidade_medida: 'UN',
    valor_custo: 0,
    valor_venda: 0,
    estoque_atual: 0,
    estoque_minimo: 0,
    ativo: true
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(id) && id > 0) {
      this.id = id;
      this.carregar();
    }
  }

  public salvar(): void {
    if (this.salvando) {
      return;
    }

    if (!this.form.nome?.trim()) {
      this.toastService.warning('Informe o nome do produto.');
      return;
    }

    this.salvando = true;
    const payload = { ...this.form, id: this.id ?? undefined };
    const request$ = this.id ? this.produtoService.atualizar(payload) : this.produtoService.cadastrar(payload);

    request$.subscribe({
      next: () => {
        this.toastService.success(`Produto ${this.id ? 'atualizado' : 'cadastrado'} com sucesso.`);
        this.router.navigate(['/produtos/listar']);
      },
      error: () => {
        this.salvando = false;
        this.toastService.error('Nao foi possivel salvar o produto.');
      }
    });
  }

  public voltar(): void {
    this.router.navigate(['/produtos/listar']);
  }

  private carregar(): void {
    if (!this.id) {
      return;
    }

    this.produtoService.buscarPorId(this.id).subscribe({
      next: (response) => {
        this.form = { ...response };
      },
      error: () => this.toastService.error('Nao foi possivel carregar o produto.')
    });
  }
}
