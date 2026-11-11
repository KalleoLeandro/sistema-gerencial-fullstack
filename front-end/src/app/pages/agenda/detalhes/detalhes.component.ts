import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Agendamento } from '@models/agendamento';
import { AgendamentoService } from '@services/agendamento.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-agenda-detalhes',
  standalone: true,
  imports: [AeroNativeButtonComponent, CommonModule, RouterLink, ],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agendamentoService = inject(AgendamentoService);
  private readonly toastService = inject(ToastService);

  public agendamento?: Agendamento;

  public ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      this.router.navigate(['/agenda']);
      return;
    }

    this.agendamentoService.buscarPorId(id).subscribe({
      next: (agendamento) => {
        this.agendamento = agendamento;
      },
      error: () => {
        this.toastService.error('Agendamento não encontrado.');
        this.router.navigate(['/agenda']);
      }
    });
  }

  public excluir(): void {
    if (!this.agendamento) {
      return;
    }

    this.agendamentoService.excluir(this.agendamento.id).subscribe({
      next: () => {
        this.toastService.success('Agendamento removido com sucesso.');
        this.router.navigate(['/agenda']);
      },
      error: () => this.toastService.error('Não foi possível excluir o agendamento.')
    });
  }

  public formatarData(dataEvento?: string): string {
    if (!dataEvento) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dataEvento));
  }

  public get status(): string {
    return this.agendamento?.concluido ? 'Concluído' : 'Pendente';
  }

  public get atrasado(): boolean {
    if (!this.agendamento?.data_agendamento || this.agendamento.concluido) {
      return false;
    }

    return new Date(this.agendamento.data_agendamento).getTime() < Date.now();
  }
}
