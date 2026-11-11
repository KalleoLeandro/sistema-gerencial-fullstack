export type TipoConta = 'PAGAR' | 'RECEBER';
export type OrigemConta = 'MANUAL' | 'VENDA';
export interface ContaFinanceira {
  id: number;
  origem: OrigemConta;
  tipo: TipoConta;
  descricao: string;
  contraparte: string;
  categoria: string | null;
  referencia: string | null;
  vencimento: string;
  valor: number;
  valorBaixado: number;
  saldo: number;
  status: string;
  vendaId: number | null;
  entidadeTipo: string | null;
  entidadeId: number | null;
}
export interface ContaRequest {
  tipo: TipoConta;
  descricao: string;
  contraparte: string;
  categoria: string | null;
  referencia: string | null;
  vencimento: string;
  valor: number;
  entidadeTipo: string | null;
  entidadeId: number | null;
}
export interface BaixaFinanceira {
  id: number;
  data: string;
  valor: number;
  formaPagamento: string;
  observacoes: string | null;
}
export interface BaixaRequest {
  data: string;
  valor: number;
  formaPagamento: string;
  observacoes: string | null;
}
export interface DetalhesConta {
  conta: ContaFinanceira;
  baixas: BaixaFinanceira[];
}
export interface PaginaFinanceira {
  lista: ContaFinanceira[];
  total: number;
  page: number;
  limit: number;
}
export interface FiltroFinanceiro {
  tipo?: string;
  status?: string;
  pesquisa?: string;
  inicio?: string;
  fim?: string;
  categoria?: string;
}
export interface ResumoFinanceiro {
  aPagar: number;
  aReceber: number;
  pagarVencido: number;
  receberVencido: number;
  pago: number;
  recebido: number;
  saldoRealizado: number;
  saldoPrevisto: number;
}
export interface FluxoFinanceiro {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
}
export interface RelatorioFinanceiro {
  resumo: ResumoFinanceiro;
  realizado: FluxoFinanceiro[];
  previsto: FluxoFinanceiro[];
}
