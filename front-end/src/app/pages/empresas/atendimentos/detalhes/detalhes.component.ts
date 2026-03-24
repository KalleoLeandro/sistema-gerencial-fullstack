import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Atendimento } from '@models/atendimento';
import { Status } from '@models/status';
import { AtendimentoService } from '@services/atendimento.service';
import { LoginService } from '@services/login.service';
import { PdfExportService } from '@services/pdf-export.service';
import { StatusPipe } from 'app/pipes/status.pipe';

@Component({
  selector: 'app-detalhes',
  imports: [CommonModule, FormsModule, StatusPipe, MatButtonModule],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements AfterViewInit, OnDestroy {

  private router = inject(Router);
  public atendimentoService = inject(AtendimentoService);
  private activatedRoute = inject(ActivatedRoute);
  private loginService = inject(LoginService);
  private pdfExportService = inject(PdfExportService);
  private login: string = "";
  public atendimento: Atendimento | undefined;
  private id: number;
  private id_empresa: number = 0;
  public perfil: string = "";
  public excluir: boolean = false;
  public resposta: string = "";
  public idExcluir: number = 0;
  public listaExecutores: Array<any> = [];
  private movedModals: Array<{ element: HTMLElement; parent: ParentNode; nextSibling: Node | null }> = [];

  statusSelecionado: number | null = null;
  public motivo_cancelamento: string = "";

  public status_atendimento: Array<Status> = [
    { id: 1, descricao: 'AGUARDANDO ATENDIMENTO' },
    { id: 2, descricao: 'EM ATENDIMENTO' },
    { id: 3, descricao: 'FINALIZADO' },
    { id: 4, descricao: 'CANCELADO' }
  ]

  public mostrarSelecao: boolean = false;

  constructor() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id') as unknown as number;
    this.id_empresa = this.activatedRoute.snapshot.queryParamMap.get('id_empresa') as unknown as number;
    if (this.id != null && this.id != undefined) {
      this.carregarAtendimentoPorId(this.id);
    }
  }

  ngAfterViewInit(): void {
    this.moverModaisParaBody(['modalConfirmacaoEmpresa', 'modalMotivoCancelamento']);
  }

  ngOnDestroy(): void {
    this.restaurarModais();
  }

  public carregarAtendimentoPorId(id: number) {
    this.atendimentoService.buscarPorId(id).subscribe({
      next: (response: Atendimento) => {
        this.atendimento = response;
        this.listaExecutores = JSON.parse(response.executores);
      },
      error: (error: any) => {
        console.log(error);
      },
    })
  }

  public alterarAtendimento() {
    this.router.navigate(
      ['/atendimentos/cadastrar/'],
      { queryParams: { id: this.id, id_empresa: this.id_empresa } }
    );
  }

  public modalExcluirAtendimento() {
    this.excluir = true;
    this.idExcluir = this.id;
    this.resposta = "Tem certeza que deseja excluir essa atendimento(Essa operação é irreversível)?";
    document.getElementById("botaoModalEmpresa")?.click();
  }

  public excluirAtendimento() {
    this.excluir = false;
    this.atendimentoService.excluirHistoricoAtendimento(this.idExcluir).subscribe({
      next: (response: any) => {
        this.resposta = "Atendimento excluído com sucesso.";
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = "Erro ao excluir o atendimento!";
      },
    });

    console.log(this.id_empresa);
  }

  public alterarStatusAtendimento() {
    this.mostrarSelecao = false;
    if (this.statusSelecionado !== null) {
      if (this.statusSelecionado === 4) {
        this.loginService.buscarPorToken().subscribe({
          next: (response: any) => {
            this.login = response.nome;
          },
          error: (error: any) => {
            console.log(error);
            this.resposta = "Erro ao localizar o executor!";
          },
        })
        document.getElementById("botaoModalMotivoCancelamento")?.click();
      } else {
        this.motivo_cancelamento = "";
        this.salvarStatusAtendimento();
      }
    }
  }

  public salvarStatusAtendimento() {
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
    this.atendimentoService.alterarStatusAtendimento(this.id, Number(this.statusSelecionado), this.motivo_cancelamento).subscribe({
      next: (response: any) => {
        this.carregarAtendimentoPorId(this.id);
        this.statusSelecionado = 0;
        this.resposta = "Cancelamento de atendimento efetuado com sucesso!";
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = "Erro ao alterar o status do atendimento!";
      },
    });
  }

  public redirecionar() {
    if (!this.resposta.includes("Erro") && this.excluir === false) {
      this.router.navigate([`/empresas/detalhes/${this.id_empresa}`],
        { queryParams: { aba: 3 } }
      )
    }
  }

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
      document.getElementById('atendimento-detalhes-pdf'),
      `Atendimento - ${this.atendimento?.id ?? 'Detalhes'}`
    );
  }

}
