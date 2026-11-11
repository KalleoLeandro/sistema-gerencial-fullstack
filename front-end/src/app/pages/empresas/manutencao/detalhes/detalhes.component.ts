import { AeroNativeControlComponent, AeroNativeButtonComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Manutencao } from '@models/manutencao';
import { Status } from '@models/status';
import { LoginService } from '@services/login.service';
import { ManutencaoService } from '@services/manutencao.service';
import { PdfExportService } from '@services/pdf-export.service';
import { ToastService } from '@services/toast.service';
import { StatusPipe } from 'app/pipes/status.pipe';
import { getHttpErrorMessage } from '@utils/http-error.util';

@Component({
  selector: 'app-detalhes',
  imports: [AeroNativeControlComponent, AeroNativeButtonComponent, CommonModule, FormsModule, StatusPipe, ],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private manutencaoService = inject(ManutencaoService);
  private activatedRoute = inject(ActivatedRoute);
  private loginService = inject(LoginService);
  private pdfExportService = inject(PdfExportService);
  private toastService = inject(ToastService);

  public manutencao: Manutencao | undefined;
  private id: number;
  public perfil: string = sessionStorage.getItem('perfil') || '';
  public resposta = '';
  public excluir = true;
  private id_equipamento = 0;
  private id_empresa = 0;
  public listaExecutores: Array<any> = [];
  private login = '';
  private movedModals: Array<{ element: HTMLElement; parent: ParentNode; nextSibling: Node | null }> = [];

  public status_atendimento: Array<Status> = [
    { id: 1, descricao: 'AGUARDANDO ATENDIMENTO' },
    { id: 2, descricao: 'EM ATENDIMENTO' },
    { id: 3, descricao: 'FINALIZADO' },
    { id: 4, descricao: 'CANCELADO' }
  ];

  statusSelecionado: number | null = null;
  public motivo_cancelamento = '';
  public mostrarSelecao = false;

  constructor() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id') as unknown as number;
    this.id_equipamento = this.activatedRoute.snapshot.queryParamMap.get('id_equipamento') as unknown as number;
    this.id_empresa = this.activatedRoute.snapshot.queryParamMap.get('id_empresa') as unknown as number;

    if (this.id != null && this.id != undefined) {
      this.carregarManutencaoPorId(this.id);
    }
  }

  ngAfterViewInit(): void {
    this.moverModaisParaBody(['modalConfirmacaoEmpresa', 'modalMotivoCancelamento']);
  }

  ngOnDestroy(): void {
    this.restaurarModais();
  }

  public carregarManutencaoPorId(id: number) {
    this.manutencaoService.buscarPorId(id).subscribe({
      next: (response: Manutencao) => {
        this.manutencao = response;
        this.listaExecutores = JSON.parse(response.executores);
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  public alterarManutencao() {
    this.router.navigate(
      ['/manutencao/cadastrar'],
      { queryParams: { id_equipamento: this.id_equipamento, id_manutencao: this.id } }
    );
  }

  public abrirFluxoComercial() {
    this.router.navigate(['/comercial/vendas/orcamento'], {
      queryParams: { origemTipo: 'MANUTENCAO', origemId: this.id }
    });
  }

  public alterarStatusManutencao() {
    this.mostrarSelecao = false;

    if (this.statusSelecionado !== null) {
      if (this.statusSelecionado === 4) {
        this.loginService.buscarPorToken().subscribe({
          next: (response: any) => {
            this.login = response.nome;
          },
          error: (error: any) => {
            console.log(error);
            this.resposta = 'Erro ao localizar o executor!';
          }
        });
        document.getElementById('botaoModalMotivoCancelamento')?.click();
      } else {
        this.motivo_cancelamento = '';
        this.salvarStatusManutencao();
      }
    }
  }

  public salvarStatusManutencao() {
    if (this.statusSelecionado && (this.statusSelecionado > 4 || this.statusSelecionado < 1)) {
      console.log('Erro ao gravar status, status inválido');
    }

    if (this.motivo_cancelamento) {
      const dataAgora = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date());
      this.motivo_cancelamento = `${this.motivo_cancelamento}\n\nCancelado por ${this.login} em ${dataAgora}`;
    }

    this.manutencaoService.alterarStatusManutencao(this.id, Number(this.statusSelecionado), this.motivo_cancelamento).subscribe({
      next: () => {
        this.carregarManutencaoPorId(this.id);
        this.statusSelecionado = 0;
        this.resposta = 'Cancelamento de atendimento efetuado com sucesso!';
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = 'Erro ao alterar o status do atendimento!';
      }
    });
  }

  public modalExcluirManutencao() {
    const confirmou = window.confirm('Tem certeza que deseja excluir esta manutenção? Essa operação é irreversível.');
    if (!confirmou) {
      return;
    }

    this.excluirManutencao();
  }

  public excluirManutencao() {
    this.manutencaoService.excluirManutencao(this.id).subscribe({
      next: () => {
        this.toastService.success('Manutenção excluída com sucesso.');
        this.router.navigate(
          [`/equipamentos/detalhes/${this.id_equipamento}`],
          { queryParams: { id_empresa: this.id_empresa, aba: 2 } }
        );
      },
      error: (error: any) => {
        console.log(error);
        this.toastService.error(getHttpErrorMessage(error, 'Erro ao excluir a manutenção!'));
      }
    });
  }

  public redirecionar() {}

  private moverModaisParaBody(ids: string[]): void {
    ids.forEach(id => {
      const modal = document.getElementById(id);
      const parent = modal?.parentNode;
      if (!modal || !parent || parent === document.body) {
        return;
      }

      this.movedModals.push({
        element: modal,
        parent,
        nextSibling: modal.nextSibling
      });
      document.body.appendChild(modal);
    });
  }

  private restaurarModais(): void {
    this.movedModals.forEach(({ element, parent, nextSibling }) => {
      if (nextSibling && parent.contains(nextSibling)) {
        parent.insertBefore(element, nextSibling);
        return;
      }

      parent.appendChild(element);
    });
  }

  public exportarPdf() {
    this.pdfExportService.exportElementToPdf(
      document.getElementById('manutencao-detalhes-pdf'),
      `Manutenção - ${this.manutencao?.id ?? 'Detalhes'}`
    );
  }
}
