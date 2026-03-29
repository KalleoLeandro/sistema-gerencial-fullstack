export interface OrcamentoItem {
  id?: number;
  tipo_item: string;
  id_produto?: number | null;
  id_servico?: number | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  percentual_desconto: number;
  valor_desconto: number;
  valor_total: number;
  ordem: number;
}

export interface Orcamento {
  id: number;
  codigo?: string | null;
  origem_tipo: string;
  id_atendimento?: number | null;
  id_manutencao?: number | null;
  id_avulso?: number | null;
  cliente_nome: string;
  cliente_documento?: string | null;
  status: string;
  validade_em?: string | null;
  aprovado_em?: string | null;
  desconto_financeiro: number;
  acrescimo_financeiro: number;
  subtotal: number;
  total_desconto: number;
  total_acrescimo: number;
  total_geral: number;
  observacoes?: string | null;
  criado_em?: string;
  atualizado_em?: string;
  itens: OrcamentoItem[];
}
