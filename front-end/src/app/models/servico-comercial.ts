export interface ServicoComercial {
  id: number;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  valor_padrao: number;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}
