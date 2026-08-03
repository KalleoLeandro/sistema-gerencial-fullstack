import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Imagem } from '@models/imagem';
import { ImagemService } from '@services/imagem.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from '@utils/http-error.util';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-imagem-manager',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './imagem-manager.component.html',
  styleUrl: './imagem-manager.component.css'
})
export class ImagemManagerComponent implements OnChanges {
  private readonly imagemService = inject(ImagemService);
  private readonly toastService = inject(ToastService);

  @Input({ required: true }) public entityType!: string;
  @Input() public entityId: number | null = null;
  @Input({ required: true }) public categoria!: string;
  @Input() public titulo = 'Imagens';
  @Input() public descricao = '';
  @Input() public multiple = true;
  @Input() public leitura = false;
  @Input() public textoVazio = 'Nenhuma imagem cadastrada.';
  @Input() public tamanhoMaximoPx: number | null = null;

  public imagens: Imagem[] = [];
  public carregando = false;
  public enviando = false;
  public imagemAberta: Imagem | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entityId'] || changes['entityType'] || changes['categoria']) {
      this.carregar();
    }
  }

  public carregar(): void {
    if (!this.entityId || !this.entityType || !this.categoria) {
      this.imagens = [];
      return;
    }

    this.carregando = true;
    this.imagemService.listar(this.entityType, this.entityId, this.categoria).subscribe({
      next: (response) => {
        this.imagens = response;
        this.carregando = false;
      },
      error: (error) => {
        this.carregando = false;
        this.toastService.error(getHttpErrorMessage(error, 'Nao foi possivel carregar as imagens.'));
      }
    });
  }

  public aoSelecionarArquivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivos = Array.from(input.files ?? []);

    if (!arquivos.length) {
      return;
    }

    if (!this.entityId) {
      this.toastService.warning('Salve o cadastro antes de enviar imagens.');
      input.value = '';
      return;
    }

    this.enviando = true;
    forkJoin(
      arquivos.map((arquivo) => this.imagemService.upload({
        entityType: this.entityType,
        entityId: this.entityId!,
        categoria: this.categoria,
        arquivo
      }))
    ).subscribe({
      next: () => {
        this.toastService.success(arquivos.length === 1 ? 'Imagem enviada com sucesso.' : 'Imagens enviadas com sucesso.');
        this.enviando = false;
        input.value = '';
        this.carregar();
      },
      error: (error) => {
        this.enviando = false;
        input.value = '';
        this.toastService.error(getHttpErrorMessage(error, 'Nao foi possivel enviar a imagem.'));
      }
    });
  }

  public excluir(imagem: Imagem): void {
    if (!window.confirm(`Deseja excluir a imagem "${imagem.nomeArquivo}"?`)) {
      return;
    }

    this.imagemService.excluir(imagem.id).subscribe({
      next: () => {
        this.toastService.success('Imagem excluida com sucesso.');
        this.carregar();
      },
      error: (error) => {
        this.toastService.error(getHttpErrorMessage(error, 'Nao foi possivel excluir a imagem.'));
      }
    });
  }

  public abrirImagem(imagem: Imagem): void {
    this.imagemAberta = imagem;
    requestAnimationFrame(() => {
      const dialog = document.querySelector('.image-modal__dialog');
      if (dialog instanceof HTMLElement) {
        dialog.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  public fecharImagem(): void {
    this.imagemAberta = null;
  }

  public urlConteudo(imagem: Imagem): string {
    return this.imagemService.urlConteudo(imagem.id);
  }
}
