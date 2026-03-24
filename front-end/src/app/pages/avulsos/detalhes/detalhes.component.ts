import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Avulso } from '@models/avulso';
import { Empresa } from '@models/empresa';
import { Status } from '@models/status';
import { AvulsoService } from '@services/avulso.service';
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
  private avulsoService = inject(AvulsoService);
  private activatedRoute = inject(ActivatedRoute);
  private loginService = inject(LoginService);
  private pdfExportService = inject(PdfExportService);
  private login: string = "";
  public perfil: string = sessionStorage.getItem('perfil') || '';
  public excluir: boolean = false;
  public resposta: string = '';
  private id: number = 0;
  public avulso: Avulso | undefined;
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
    if (this.id != null && this.id != undefined) {
      this.carregarAtendimentoAvulso();
    }
  }

  ngAfterViewInit(): void {
    this.moverModaisParaBody(['modalConfirmacao', 'modalMotivoCancelamento']);
  }

  ngOnDestroy(): void {
    this.restaurarModais();
  }

  public carregarAtendimentoAvulso() {
    this.avulsoService.buscarPorId(this.id).subscribe({
      next: (response) => {
        this.avulso = response; 
        this.motivo_cancelamento = response.motivo_cancelamento;       
        this.listaExecutores = JSON.parse(response.executores);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  public alterarAvulso() {
    this.router.navigate([`/avulsos/cadastrar`],
      { queryParams: { id: this.id } }
    )
  }

  public modalExcluirAvulso() {
    this.excluir = true;
    this.resposta = "Tem certeza que deseja excluir esse atendimento(Essa operação é irreversível)?";
    document.getElementById("botaoModal")?.click();
  }

  public excluirAvulso() {
    this.excluir = false;
    this.avulsoService.excluirAvulso(this.id).subscribe({
      next: (response: any) => {
        this.resposta = "Atendimento avulso excluído com sucesso.";
      },
      error: (error: any) => {
        console.log(error);
        this.resposta = "Erro ao excluir o atendimento avulso!";
      },
    });
  }

  public alterarStatusAvulso() {
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
        this.salvarStatusAvulso();
      }
    }
  }

  public salvarStatusAvulso() {
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
    this.avulsoService.alterarStatusAtendimento(this.id, Number(this.statusSelecionado), this.motivo_cancelamento).subscribe({
      next: (response: any) => {
        this.carregarAtendimentoAvulso();
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
      this.router.navigate([`/avulsos/listar`]
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
      document.getElementById('avulso-detalhes-pdf'),
      `Ordem de Serviço - ${this.avulso?.id ?? 'Detalhes'}`
    );
  }

}
