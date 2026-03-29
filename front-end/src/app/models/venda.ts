import { OrcamentoItem } from './orcamento';

export interface PagamentoVenda {
  numero_parcela?: number | null;
  data_pagamento?: string | null;
  forma_pagamento?: string | null;
  valor_pago: number;
  observacoes?: string | null;
}

export interface ParcelaVenda {
  id: number;
  numero_parcela: number;
  data_vencimento: string;
  status: string;
  valor_previsto: number;
  valor_pago: number;
  saldo_aberto: number;
  data_ultimo_pagamento?: string | null;
  observacoes?: string | null;
}

export interface Venda {
  id: number;
  codigo: string;
  id_orcamento: number;
  origem_tipo: string;
  cliente_nome: string;
  cliente_documento?: string | null;
  status: string;
  data_venda: string;
  forma_pagamento?: string | null;
  quantidade_parcelas: number;
  subtotal: number;
  total_desconto: number;
  total_acrescimo: number;
  total_geral: number;
  observacoes?: string | null;
  criado_em?: string;
  atualizado_em?: string;
  itens: OrcamentoItem[];
  parcelas: ParcelaVenda[];
}
