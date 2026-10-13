import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AeroInputComponent,
  AeroSelectComponent,
  AeroNativeButtonComponent,
} from '@components/aero';
import { FinanceiroService } from '@services/financeiro.service';
import { ToastService } from '@services/toast.service';
import { RelatorioFinanceiro } from '@models/financeiro';
import { getHttpErrorMessage } from '@utils/http-error.util';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-financeiro-relatorios',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AeroInputComponent,
    AeroSelectComponent,
    AeroNativeButtonComponent,
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['../../../components/aero/list-layout.css', '../financeiro.css'],
})
export class RelatoriosComponent {
  private readonly api = inject(FinanceiroService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly relatorio = signal<RelatorioFinanceiro | null>(null);
  readonly carregando = signal(false);
  inicio = '';
  fim = '';
  tipo = '';
  categoria = '';
  readonly tipos = [
    { value: 'PAGAR', label: 'Contas a pagar' },
    { value: 'RECEBER', label: 'Contas a receber' },
  ];
  ngOnInit(): void {
    this.carregar();
  }
  carregar(): void {
    if (this.inicio && this.fim && this.inicio > this.fim) {
      this.toast.warning('Verifique o período informado.');
      return;
    }
    this.carregando.set(true);
    this.relatorio.set(null);
    this.api
      .relatorio({
        inicio: this.inicio,
        fim: this.fim,
        tipo: this.tipo,
        categoria: this.categoria,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregando.set(false)),
      )
      .subscribe({
        next: (r) => this.relatorio.set(r),
        error: (error) =>
          this.toast.error(
            getHttpErrorMessage(
              error,
              'Não foi possível carregar o relatório.',
            ),
          ),
      });
  }
  exportar(): void {
    const relatorio = this.relatorio();
    if (!relatorio) return;
    const linhas: (string | number)[][] = [
      ['Financeiro', 'Valor'],
      ['A pagar', relatorio.resumo.aPagar],
      ['A receber', relatorio.resumo.aReceber],
      ['A pagar vencido', relatorio.resumo.pagarVencido],
      ['A receber vencido', relatorio.resumo.receberVencido],
      ['Pago', relatorio.resumo.pago],
      ['Recebido', relatorio.resumo.recebido],
      ['Saldo realizado', relatorio.resumo.saldoRealizado],
      ['Saldo previsto', relatorio.resumo.saldoPrevisto],
      [],
      ['Regime', 'Data', 'Entradas', 'Saídas', 'Saldo'],
    ];
    for (const [regime, fluxo] of [
      ['Realizado', relatorio.realizado],
      ['Previsto', relatorio.previsto],
    ] as const) {
      fluxo.forEach((dia) =>
        linhas.push([regime, dia.data, dia.entradas, dia.saidas, dia.saldo]),
      );
    }
    const csv = linhas
      .map((linha) =>
        linha
          .map((valor) =>
            JSON.stringify(
              typeof valor === 'number'
                ? valor.toFixed(2).replace('.', ',')
                : valor,
            ),
          )
          .join(';'),
      )
      .join(String.fromCharCode(13, 10));
    const url = URL.createObjectURL(
      new Blob([String.fromCharCode(65279) + csv], {
        type: 'text/csv;charset=utf-8;',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-financeiro.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
