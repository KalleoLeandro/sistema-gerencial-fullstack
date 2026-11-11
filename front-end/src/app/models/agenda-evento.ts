export interface AgendaEvento {
  tipo: string;
  referenciaId: number;
  empresaId?: number | null;
  titulo: string;
  subtitulo: string;
  dataEvento: string;
  concluido: boolean;
}
