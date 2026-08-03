export interface RenovacaoContrato {
  id: number;
  id_cliente: number;
  data_inicio_anterior?: string | Date | null;
  data_fim_anterior?: string | Date | null;
  data_inicio_novo?: string | Date | null;
  data_fim_novo?: string | Date | null;
  observacoes?: string | null;
  criado_em?: string | Date | null;
}
