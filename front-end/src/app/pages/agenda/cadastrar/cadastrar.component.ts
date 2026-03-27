import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AgendamentoService } from '@services/agendamento.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-agenda-cadastrar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agendamentoService = inject(AgendamentoService);
  private readonly toastService = inject(ToastService);

  public agendamentoId: number | null = null;
  public readonly tiposTarefa = this.agendamentoService.tiposTarefa;

  public cadastroForm = this.formBuilder.group({
    titulo: ['', Validators.required],
    tipoTarefa: ['', Validators.required],
    data: [null as Date | null, Validators.required],
    detalhes: ['', Validators.required]
  });

  public ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.agendamentoId = idParam ? Number(idParam) : null;

    if (!this.agendamentoId) {
      return;
    }

    this.carregarAgendamento();
  }

  public salvar(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const payload = this.agendamentoService.montarPayload(this.cadastroForm.getRawValue(), this.agendamentoId);
    const request$ = this.agendamentoId
      ? this.agendamentoService.atualizar(payload)
      : this.agendamentoService.cadastrar(payload);

    request$.subscribe({
      next: () => {
        this.toastService.success(this.agendamentoId ? 'Agendamento atualizado com sucesso.' : 'Agendamento cadastrado com sucesso.');
        this.router.navigate(this.agendamentoId ? ['/agenda/detalhes', this.agendamentoId] : ['/agenda']);
      },
      error: () => this.toastService.error('Não foi possível salvar o agendamento.')
    });
  }

  public limpar(): void {
    if (!this.agendamentoId) {
      this.cadastroForm.reset();
      return;
    }

    this.carregarAgendamento();
  }

  public get tituloPagina(): string {
    return this.agendamentoId ? 'Atualizar agendamento' : 'Cadastrar agendamento';
  }

  public get subtituloPagina(): string {
    return this.agendamentoId
      ? 'Ajuste os dados do compromisso salvo no backend.'
      : 'Preencha as informações para incluir um novo compromisso na agenda.';
  }

  private carregarAgendamento(): void {
    if (!this.agendamentoId) {
      return;
    }

    this.agendamentoService.buscarPorId(this.agendamentoId).subscribe({
      next: (agendamento) => {
        this.cadastroForm.patchValue({
          titulo: agendamento.titulo,
          tipoTarefa: agendamento.tipo_tarefa,
          data: agendamento.data_agendamento ? new Date(agendamento.data_agendamento) : null,
          detalhes: agendamento.detalhes
        });
      },
      error: () => {
        this.toastService.error('Agendamento não encontrado.');
        this.router.navigate(['/agenda']);
      }
    });
  }
}
