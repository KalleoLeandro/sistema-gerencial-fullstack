import { AeroNativeControlComponent, AeroNativeButtonComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

import { Equipamento } from '@models/equipamento';
import { ListaManutencaoResponse } from '@models/listaManutencaoResponse';
import { EquipamentoService } from '@services/equipamento.service';
import { ManutencaoService } from '@services/manutencao.service';
import { PdfExportService } from '@services/pdf-export.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from '@utils/http-error.util';

@Component({
  selector: 'app-detalhes',
  imports: [AeroNativeControlComponent, AeroNativeButtonComponent, CommonModule, FormsModule, ],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements OnInit {
  private router = inject(Router);
  private equipamentoService = inject(EquipamentoService);
  private manutencaoService = inject(ManutencaoService);
  private pdfExportService = inject(PdfExportService);
  private activatedRoute = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  public equipamento: Equipamento | undefined;
  public listaManutencao = signal<ListaManutencaoResponse>({ lista: [], total: 0 });
  public idEquipamento = 0;
  public pageHistorico = 1;
  public resposta = '';
  public excluir = true;
  private id_empresa = 0;
  public dadosPesquisa: string | undefined;
  public paginacaoHistorico = [
    { numero: 10, descricao: '10 por página' },
    { numero: 25, descricao: '25 por página' },
    { numero: 50, descricao: '50 por página' }
  ];
  public limitHistorico = 10;
  public totalPagesHistorico = 0;

  private id = 0;
  private idExcluir = 0;

  constructor() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id') as unknown as number;
    this.id_empresa = this.activatedRoute.snapshot.queryParamMap.get('id_empresa') as unknown as number;

    if (this.id != null && this.id != undefined) {
      this.carregarEquipamento();
      this.carregarHistoricoEquipamento(this.id);
    }
  }

  ngOnInit() {
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

  public carregarEquipamento() {
    this.equipamentoService.buscarEquipamentoPorId(this.id).subscribe({
      next: (response: Equipamento) => {
        this.equipamento = response;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  public carregarHistoricoEquipamento(id: number) {
    this.idEquipamento = id;
    this.manutencaoService.buscarManutencoesPorPagina(this.pageHistorico, this.limitHistorico, id).subscribe({
      next: (response: ListaManutencaoResponse) => {
        this.listaManutencao.set(response);
        this.totalPagesHistorico = Math.ceil(response.total / this.limitHistorico);
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  public alterarEquipamento() {
    this.router.navigate(
      ['/equipamentos/cadastrar'],
      { queryParams: { id_empresa: this.equipamento?.id_empresa, id: this.id } }
    );
  }

  public modalExcluirEquipamento() {
    const confirmou = window.confirm('Tem certeza que deseja excluir este equipamento? Essa operação é irreversível.');
    if (!confirmou) {
      return;
    }

    this.idExcluir = this.id;
    this.excluirEquipamento();
  }

  public excluirEquipamento() {
    this.equipamentoService.excluirEquipamento(this.idExcluir).subscribe({
      next: () => {
        this.toastService.success('Equipamento excluído com sucesso.');
        this.router.navigate(
          [`/empresas/detalhes/${this.id_empresa}`],
          { queryParams: { aba: 2 } }
        );
      },
      error: (error: any) => {
        console.log(error);
        this.toastService.error(getHttpErrorMessage(error, 'Erro ao excluir o equipamento!'));
      }
    });
  }

  public modalExcluirManutencao(id: number) {
    const confirmou = window.confirm('Tem certeza que deseja excluir esta manutenção? Essa operação é irreversível.');
    if (!confirmou) {
      return;
    }

    this.idExcluir = id;
    this.excluirManutencao();
  }

  public excluirManutencao() {
    this.manutencaoService.excluirManutencao(this.idExcluir).subscribe({
      next: () => {
        this.toastService.success('Manutenção excluída com sucesso.');
        this.carregarHistoricoEquipamento(this.idEquipamento);
      },
      error: (error: any) => {
        console.log(error);
        this.toastService.error(getHttpErrorMessage(error, 'Erro ao excluir a manutenção!'));
      }
    });
  }

  public alterarHistoricoManutencao(id: number) {
    this.router.navigate(
      ['/manutencao/cadastrar'],
      { queryParams: { id_equipamento: this.id, id_manutencao: id } }
    );
  }

  public detalharManutencao(id: number) {
    this.router.navigate(
      [`/manutencao/detalhes/${id}`],
      { queryParams: { id_equipamento: this.id, id_empresa: this.id_empresa } }
    );
  }

  public mudarTamanhoHistorico() {
    this.pageHistorico = 1;
    this.carregarHistoricoEquipamento(this.id);
  }

  public irParaPaginaHistorico(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPagesHistorico) {
      this.pageHistorico = pagina;
      this.carregarHistoricoEquipamento(this.id);
    }
  }

  public paginaAnteriorHistorico(): void {
    if (this.pageHistorico > 1) {
      this.pageHistorico--;
      this.carregarHistoricoEquipamento(this.id);
    }
  }

  public proximaPaginaHistorico(): void {
    if (this.pageHistorico < this.totalPagesHistorico) {
      this.pageHistorico++;
      this.carregarHistoricoEquipamento(this.id);
    }
  }

  public cadastrarNovaManutencao() {
    this.router.navigate(['/manutencao/cadastrar'], { queryParams: { id_equipamento: this.id } });
  }

  public redirecionar() {}

  public exportarPdf() {
    this.pdfExportService.exportElementToPdf(
      document.getElementById('equipamento-detalhes-pdf'),
      `Equipamento - ${this.equipamento?.nome_maquina ?? 'Detalhes'}`
    );
  }
}
