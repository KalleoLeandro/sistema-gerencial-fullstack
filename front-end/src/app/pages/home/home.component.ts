import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  protected readonly highlights = [
    {
      title: 'Visibilidade operacional',
      description: 'Acompanhe acessos, rotinas e estabilidade do ambiente em uma superficie unica.'
    },
    {
      title: 'Fluxos integrados',
      description: 'Conecte autenticacao, equipes e etapas de acompanhamento sem trocar de contexto.'
    },
    {
      title: 'Decisao com contexto',
      description: 'Organize sinais do sistema em paineis claros para agir com mais rapidez.'
    }
  ];
}
