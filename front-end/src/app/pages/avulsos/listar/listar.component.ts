import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ListaAvulsoResponse } from '@models/listaAvulsoResponse';
import { AvulsoService } from '@services/avulso.service';
import { StatusPipe } from 'app/pipes/status.pipe';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-listar',
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink, RouterLinkActive, NgxMaskDirective, StatusPipe, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
})
export class ListarComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private avulsoService = inject(AvulsoService);

  public dadosPesquisa: string | undefined;
  public resposta = '';
  public id = 0;
  public excluir = true;
  public listaAvulsos = signal<ListaAvulsoResponse>({ lista: [], total: 0 });
  public limit = 10;
  public page = 1;
  public totalPages = 0;
  public dataInicioPesquisa: Date | null = null;
  public atributo = [
    { nome: 'nome', descricao: 'Nome' },
    { nome: 'cpf', descricao: 'CPF' },
    { nome: 'cnpj', descricao: 'CNPJ' },
    { nome: 'data_inicio', descricao: 'Data Inicio' },
    { nome: 'executor_interno', descricao: 'Executor Interno' },
    { nome: 'executor_externo', descricao: 'Executor Externo' }
  ];
  public tipo_consulta: string = this.atributo[0]?.nome || '';
  public paginacao = [
    { numero: 10, descricao: '10 por pagina' },
    { numero: 25, descricao: '25 por pagina' },
    { numero: 50, descricao: '50 por pagina' }
  ];

  ngOnInit(): void {
    const pageParam = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    const limitParam = Number(this.activatedRoute.snapshot.queryParamMap.get('limit'));

    if (!Number.isNaN(pageParam) && pageParam > 0) {
      this.page = pageParam;
    }

    if (!Number.isNaN(limitParam) && this.paginacao.some(item => item.numero === limitParam)) {
      this.limit = limitParam;
    }

    this.carregarHistoricoAvulsos();
  }

  public carregarHistoricoAvulsos() {
    if (!this.dadosPesquisa) {
      this.avulsoService.buscarAvulsosPorPagina(this.page, this.limit).subscribe({
        next: (response: ListaAvulsoResponse) => {
          this.listaAvulsos.set(response);
          this.totalPages = Math.ceil(response.total / this.limit);
        },
        error: (error: any) => {
          console.log(error);
        }
      });
      return;
    }

    this.avulsoService.buscarAvulsosAtributoEPorPagina(this.page, this.limit, this.dadosPesquisa, this.tipo_consulta).subscribe({
      next: (response: ListaAvulsoResponse) => {
        this.listaAvulsos.set(response);
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  public verificarVazio() {}

  public limparPesquisa() {
    this.dadosPesquisa = '';
    this.dataInicioPesquisa = null;
  }

  public onDataInicioPesquisaChange(value: Date | null) {
    this.dataInicioPesquisa = value;
    this.dadosPesquisa = value ? this.formatarDataPesquisa(value) : '';
  }

  public mudarTamanho() {
    this.page = 1;
    this.atualizarQueryParams();
    this.carregarHistoricoAvulsos();
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
      this.carregarHistoricoAvulsos();
      this.rolarParaTopo();
    }
  }

  public paginaAnterior(): void {
    if (this.page > 1) {
      this.page--;
      this.atualizarQueryParams();
      this.carregarHistoricoAvulsos();
      this.rolarParaTopo();
    }
  }

  public proximaPagina(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.atualizarQueryParams();
      this.carregarHistoricoAvulsos();
      this.rolarParaTopo();
    }
  }

  public cadastrarNovo() {
    this.router.navigate(['/avulsos/cadastrar']);
  }

  public alterarAvulso(id: number) {
    this.router.navigate(['/avulsos/cadastrar'], { queryParams: { id } });
  }

  public modalExcluirAvulso(id: number) {
    this.excluir = true;
    this.id = id;
    this.resposta = 'Tem certeza que deseja excluir esse atendimento(Essa operacao e irreversivel)?';
    document.getElementById('botaoModal')?.click();
  }

  public excluirAvulso() {
    this.excluir = false;
    this.avulsoService.excluirAvulso(this.id).subscribe({
      next: () => {
        this.resposta = 'Atendimento avulso excluido com sucesso.';
        this.carregarHistoricoAvulsos();
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = 'Erro ao excluir o atendimento avulso!';
      }
    });
  }

  public formatarExecutores(json: string): string {
    try {
      const executores = JSON.parse(json);
      return executores.map((e: any) => e.nome).join(', ');
    } catch {
      return '';
    }
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

  private formatarDataPesquisa(data: Date): string {
    const dia = `${data.getDate()}`.padStart(2, '0');
    const mes = `${data.getMonth() + 1}`.padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
}
