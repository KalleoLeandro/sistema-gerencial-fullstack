export interface Produto {
  id: number;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  unidade_medida: string;
  valor_custo: number;
  valor_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}
