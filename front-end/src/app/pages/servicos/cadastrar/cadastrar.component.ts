import { AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroCheckboxComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { ServicoPayload, ServicoComercialService } from '@services/servico-comercial.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-servicos-cadastrar',
  imports: [AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroCheckboxComponent, CommonModule, FormsModule, CurrencyMaskModule, FormSubmitLoaderComponent],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicoService = inject(ServicoComercialService);
  private readonly toastService = inject(ToastService);

  public id: number | null = null;
  public salvando = false;
  public readonly moneyMaskOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', align: 'left', allowNegative: false };
  public form: ServicoPayload = {
    codigo: '',
    nome: '',
    descricao: '',
    valor_padrao: 0,
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
      this.toastService.warning('Informe o nome do servico.');
      return;
    }

    this.salvando = true;
    const payload = { ...this.form, id: this.id ?? undefined };
    const request$ = this.id ? this.servicoService.atualizar(payload) : this.servicoService.cadastrar(payload);

    request$.subscribe({
      next: () => {
        this.toastService.success(`Servico ${this.id ? 'atualizado' : 'cadastrado'} com sucesso.`);
        this.router.navigate(['/servicos/listar']);
      },
      error: () => {
        this.salvando = false;
        this.toastService.error('Nao foi possivel salvar o servico.');
      }
    });
  }

  public voltar(): void {
    this.router.navigate(['/servicos/listar']);
  }

  private carregar(): void {
    if (!this.id) {
      return;
    }

    this.servicoService.buscarPorId(this.id).subscribe({
      next: (response) => {
        this.form = { ...response };
      },
      error: () => this.toastService.error('Nao foi possivel carregar o servico.')
    });
  }
}
