import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Empresa } from '@models/empresa';
import { ListaAtendimentoResponse } from '@models/listaAtendimentoResponse';
import { ListaEquipamementoResponse } from '@models/listaEquipamentoResponse';
import { ListaManutencaoResponse } from '@models/listaManutencaoResponse';
import { RenovacaoContrato } from '@models/renovacao-contrato';
import { AtendimentoService } from '@services/atendimento.service';
import { EmpresasService } from '@services/empresas.service';
import { EquipamentoService } from '@services/equipamento.service';
import { LoginService } from '@services/login.service';
import { ManutencaoService } from '@services/manutencao.service';
import { PdfExportService } from '@services/pdf-export.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';
import { StatusPipe } from 'app/pipes/status.pipe';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-detalhes',
  imports: [CommonModule, FormsModule, RouterLink, StatusPipe, MatButtonModule],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent {

  private router = inject(Router);
  private equipamentoService = inject(EquipamentoService);
  private activatedRoute = inject(ActivatedRoute);
  private empresaService = inject(EmpresasService);
  private atendimentoService = inject(AtendimentoService);
  private loginService = inject(LoginService);
  private manutencaoService = inject(ManutencaoService);
  private pdfExportService = inject(PdfExportService);
  private toastService = inject(ToastService);
  public perfil: string = "";
  public excluir: boolean = false;
  public resposta: string = "";
  public empresa: Empresa | undefined;
  public dadosInfra: string | undefined;
  public editandoInfra: boolean = false;

  public page: number = 1;
  public pageHistorico: number = 1;
  public pageManutencao: number = 1;
  public listaEquipamentos = signal<ListaEquipamementoResponse>({ lista: [], total: 0 });
  public listaAtendimentos = signal<ListaAtendimentoResponse>({ lista: [], total: 0 });
  public listaManutencoes = signal<ListaManutencaoResponse>({ lista: [], total: 0 });
  public renovacoesContrato = signal<RenovacaoContrato[]>([]);
  public listaHistorico = signal<any>({ lista: [], total: 0 });
  public paginacao = [{
    numero: 10, descricao: '10 por página'
  },
  {
    numero: 25, descricao: '25 por página'
  },
  {
    numero: 50, descricao: '50 por página'
  }];
  public paginacaoHistorico = [{
    numero: 10, descricao: '10 por página'
  },
  {
    numero: 25, descricao: '25 por página'
  },
  {
    numero: 50, descricao: '50 por página'
  }];
  public limit = 10;
  public limitHistorico = 10;
  public totalPages: number = 0;
  public totalPagesHistorico: number = 0;
  public totalPagesManutencao: number = 0;

  public idExcluir: number = 0;
  private id: number = 0;

  private tipoExclusao: number = 0;

  constructor() {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) {
        return;
      }

      this.id = id;
      this.page = 1;
      this.pageHistorico = 1;
      this.pageManutencao = 1;
      this.carregarEmpresa();
      this.carregarHistoricoAtendimentos();
    });

    this.loginService.getPerfil().subscribe({
      next: (response) => {
        this.perfil = response.role;
      },
      error: (error) => {
        console.log(error);
      }
    })
    this.activatedRoute.queryParams.subscribe(params => {
      const aba = Number(params['aba']) || 1;
      this.ativarAba(aba);
    });
  }

  public ativarAba(numero: number) {
    const abaId = `tab${numero}`;
    const abaEl = document.getElementById(abaId);

    if (abaEl) {
      const tab = new bootstrap.Tab(abaEl);
      tab.show();
    }
  }

  public carregarEmpresa() {
    this.empresaService.buscarPorId(this.id).subscribe({
      next: (response) => {
        this.dadosInfra = response.infraestrutura;
        this.empresa = response;
        if (this.exibeRecursosContrato) {
          this.carregarEquipamentos();
          this.carregarManutencoes();
          this.carregarRenovacoesContrato();
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  public carregarEquipamentos() {
    this.equipamentoService.buscarEquipamentosPorPagina(this.page, this.limit, this.id).subscribe({
      next: (response: ListaEquipamementoResponse) => {
        this.listaEquipamentos.set(response);
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      error: (error: any) => {
        console.log(error);
      },
    })
  }

  public carregarHistoricoAtendimentos() {
    this.atendimentoService.buscarAtendimentosPorPagina(this.pageHistorico, this.limitHistorico, this.id).subscribe({
      next: (response: ListaAtendimentoResponse) => {
        this.listaAtendimentos.set(response);
        this.totalPagesHistorico = Math.ceil(response.total / this.limitHistorico);
      },
      error: (error: any) => {
        console.log(error);
      },
    })
  }

  public carregarManutencoes() {
    this.manutencaoService.buscarManutencoesPorCliente(this.pageManutencao, this.limit, this.id).subscribe({
      next: (response: ListaManutencaoResponse) => {
        this.listaManutencoes.set(response);
        this.totalPagesManutencao = Math.ceil(response.total / this.limit);
      },
      error: (error: any) => {
        console.log(error);
      },
    })
  }

  public carregarRenovacoesContrato() {
    this.empresaService.listarRenovacoes(this.id).subscribe({
      next: (response) => {
        this.renovacoesContrato.set(response ?? []);
      },
      error: () => {
        this.renovacoesContrato.set([]);
      }
    });
  }

  public salvarDadosInfra() {
    if (this.dadosInfra?.trim()) {
      this.empresaService.salvarDadosInfra(this.dadosInfra, this.id).subscribe({
        next: (response) => {
          this.editandoInfra = false;
          if (this.empresa) {
            this.empresa.infraestrutura = this.dadosInfra;
          }
          this.resposta = "Dados salvos com sucesso!";
          document.getElementById("botaoModal")?.click();
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }

  public alterarEmpresa() {
    this.router.navigate([`/clientes/cadastrar/${this.id}`]);
  }

  public renovarContrato() {
    this.router.navigate([`/clientes/cadastrar/${this.id}`]);
  }

  public modalExcluirEmpresa() {
    if (!window.confirm('Tem certeza que deseja excluir essa empresa? Essa operação é irreversível.')) {
      return;
    }

    this.excluir = false;
    this.idExcluir = this.id;
    this.excluirEmpresa();
  }

  public excluirEmpresa() {
    this.empresaService.excluirEmpresa(this.idExcluir).subscribe({
      next: () => {
        this.toastService.success('Empresa excluída com sucesso.');
        this.router.navigate(['/clientes/listar']);
      },
      error: (error: any) => {
        this.toastService.error(getHttpErrorMessage(error, 'Erro ao excluir a empresa!'));
      },
    });
  }
  public alterarEquipamento(id: number) {
    this.router.navigate(
      ['/equipamentos/cadastrar'],
      { queryParams: { id_empresa: this.id, id: id } }
    );
  }

  public cadastrarNovoEquipamento() {
    this.router.navigate(
      ['/equipamentos/cadastrar'],
      { queryParams: { id_empresa: this.id } }
    );
  }

  public cadastrarNovoAtendimento() {
    this.router.navigate(
      ['/ordens-servico/cadastrar'],
      { queryParams: { id_empresa: this.id } }
    );
  }

  public irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.page = pagina;
      this.carregarEquipamentos();
    }
  }

  public paginaAnterior(): void {
    if (this.page > 1) {
      this.page--;
      this.carregarEquipamentos();
    }
  }

  public proximaPagina(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.carregarEquipamentos();
    }
  }

  public mudarTamanho() {
    this.page = 1;
    this.carregarEquipamentos();
  }

  public modalExcluirEquipamento(id: number) {
    this.excluir = true;
    this.idExcluir = id;
    this.tipoExclusao = 1;
    this.resposta = "Tem certeza que deseja excluir essa equipamento(Essa operação é irreversível)?";
    document.getElementById("botaoModal")?.click();
  }

  public excluirPorTipo() {
    switch (this.tipoExclusao) {
      case 1:
        this.excluirEquipamento();
        break;
      case 2:
        break;
      case 3:
        this.excluirHistoricoAtendimento();
        break;
    }
  }

  public excluirEquipamento() {
    this.excluir = false;
    this.equipamentoService.excluirEquipamento(this.idExcluir).subscribe({
      next: (response: any) => {
        this.resposta = "Equipamento excluído com sucesso.";
        this.carregarEquipamentos();
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = "Erro ao excluir o equipamento!";
      },
    });
  }

  public excluirHistoricoAtendimento() {
    this.excluir = false;
    this.atendimentoService.excluirHistoricoAtendimento(this.idExcluir).subscribe({
      next: (response: any) => {
        this.resposta = "Atendimento excluído com sucesso.";
        this.carregarHistoricoAtendimentos();
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = "Erro ao excluir o atendimento!";
      },
    });
  }

  public detalharAtendimento(id: number) {
    this.router.navigate([`/ordens-servico/detalhes/${id}`],
      { queryParams: { id_empresa: this.id } }
    );
  }

  public detalharManutencao(id: number) {
    this.router.navigate([`/manutencao/detalhes/${id}`], { queryParams: { id_empresa: this.id } });
  }

  public mudarTamanhoHistorico() {
    this.pageHistorico = 1;
    this.carregarHistoricoAtendimentos();
  }

  public irParaPaginaHistorico(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPagesHistorico) {
      this.pageHistorico = pagina;
      this.carregarHistoricoAtendimentos();
    }
  }

  public paginaAnteriorHistorico(): void {
    if (this.pageHistorico > 1) {
      this.pageHistorico--;
      this.carregarHistoricoAtendimentos();
    }
  }

  public proximaPaginaHistorico(): void {
    if (this.pageHistorico < this.totalPagesHistorico) {
      this.pageHistorico++;
      this.carregarHistoricoAtendimentos();
    }
  }

  public modalExcluirHistoricoAtendimento(id: number) {
    this.excluir = true;
    this.tipoExclusao = 3;
    this.idExcluir = id;
    this.resposta = "Tem certeza que deseja excluir essa atendimento(Essa operação é irreversível)?";
    document.getElementById("botaoModal")?.click();
  }

  public redirecionar() {
    if (!this.resposta.includes("Erro") && this.excluir === false) {
      this.router.navigate(['/clientes/listar'])
    }
  }

  public voltar() {
    this.router.navigate(['/clientes/listar'])
  }

  public exportarPdf() {
    this.pdfExportService.exportElementToPdf(
      document.getElementById('empresa-detalhes-pdf'),
      `Empresa - ${this.empresa?.nome_fantasia ?? 'Detalhes'}`
    );
  }

  public habilitarEdicaoInfra() {
    this.editandoInfra = true;
  }

  public cancelarEdicaoInfra() {
    this.editandoInfra = false;
    this.dadosInfra = this.empresa?.infraestrutura;
  }

  public get exibeRecursosContrato(): boolean {
    return !!(this.empresa?.possui_contrato || this.empresa?.teve_contrato);
  }

  formatarExecutores(json: string): string {
    try {
      const executores = JSON.parse(json);
      return executores.map((e: any) => e.nome).join(', ');
    } catch {
      return '';
    }
  }
}

