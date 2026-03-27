import { Injectable } from '@angular/core';
import { AgendaEvento } from '@models/agenda-evento';

export interface AgendamentoFormulario {
  titulo: string;
  tipoTarefa: string;
  data: Date | null;
  detalhes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoLocalService {
  private readonly storageKey = 'agenda-agendamentos-locais';

  public readonly tiposTarefa: string[] = [
    'Visita técnica',
    'Compra de material',
    'Entrega',
    'Reunião',
    'Instalação',
    'Retorno ao cliente'
  ];

  public listar(): AgendaEvento[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const conteudo = window.localStorage.getItem(this.storageKey);

    if (!conteudo) {
      return [];
    }

    try {
      const dados = JSON.parse(conteudo);
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  public buscarPorId(referenciaId: number): AgendaEvento | undefined {
    return this.listar().find((item) => item.referenciaId === referenciaId);
  }

  public existe(referenciaId: number): boolean {
    return this.listar().some((item) => item.referenciaId === referenciaId);
  }

  public salvar(formulario: AgendamentoFormulario, referenciaId?: number | null): AgendaEvento {
    const dataEvento = formulario.data ? new Date(formulario.data) : null;

    if (!dataEvento) {
      throw new Error('Data do agendamento inválida.');
    }

    const agendamento: AgendaEvento = {
      tipo: 'AGENDAMENTO',
      referenciaId: referenciaId ?? Date.now(),
      empresaId: null,
      titulo: formulario.titulo.trim(),
      subtitulo: `${formulario.tipoTarefa} | ${formulario.detalhes.trim()}`,
      dataEvento: new Date(dataEvento.getFullYear(), dataEvento.getMonth(), dataEvento.getDate(), 12, 0, 0).toISOString(),
      concluido: false
    };

    const agendamentos = this.listar();
    const atualizados = referenciaId
      ? agendamentos.map((item) => item.referenciaId === referenciaId ? agendamento : item)
      : [agendamento, ...agendamentos];

    this.persistir(atualizados);
    return agendamento;
  }

  public remover(referenciaId: number): void {
    const atualizados = this.listar().filter((item) => item.referenciaId !== referenciaId);
    this.persistir(atualizados);
  }

  public paraFormulario(evento: AgendaEvento): AgendamentoFormulario {
    const [tipoTarefa, ...detalhes] = (evento.subtitulo || '').split(' | ');

    return {
      titulo: evento.titulo || '',
      tipoTarefa: tipoTarefa || '',
      data: evento.dataEvento ? new Date(evento.dataEvento) : null,
      detalhes: detalhes.join(' | ')
    };
  }

  private persistir(agendamentos: AgendaEvento[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(agendamentos));
  }
}
