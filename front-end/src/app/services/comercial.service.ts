import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Cliente } from '@models/cliente';
import { environment } from '@environments/environment';
import { ListaPaginada } from '@models/lista-paginada';
import { Orcamento } from '@models/orcamento';
import { PagamentoVenda, Venda } from '@models/venda';
import { Observable, catchError, throwError } from 'rxjs';

export interface OrcamentoItemPayload {
  tipo_item: string;
  id_produto?: number | null;
  id_servico?: number | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  percentual_desconto: number;
  valor_desconto: number;
  ordem: number;
}

export interface AtualizarOrcamentoPayload {
  id_orcamento: number;
  validade_em?: string | null;
  desconto_financeiro?: number;
  acrescimo_financeiro?: number;
  cliente_nome?: string | null;
  cliente_documento?: string | null;
  observacoes?: string | null;
  itens: OrcamentoItemPayload[];
}

export interface CriarOrcamentoPdvPayload {
  cliente_nome?: string | null;
  cliente_documento?: string | null;
  observacoes?: string | null;
}

export interface CriarOrcamentoPayload {
  origem_tipo?: string | null;
  origem_id?: number | null;
  cliente_nome?: string | null;
  cliente_documento?: string | null;
  observacoes?: string | null;
}

export interface AprovarOrcamentoPayload {
  id_orcamento: number;
  forma_pagamento?: string | null;
  quantidade_parcelas?: number | null;
  data_primeiro_vencimento?: string | null;
  intervalo_dias?: number | null;
  observacoes?: string | null;
  pagamentos?: PagamentoVenda[];
}

export interface RejeitarOrcamentoPayload {
  id_orcamento: number;
  motivo?: string | null;
}

export interface ReabrirOrcamentoPayload {
  id_orcamento: number;
}

export interface AtualizarVendaPayload {
  id_venda: number;
  cliente_nome?: string | null;
  cliente_documento?: string | null;
  forma_pagamento?: string | null;
  observacoes?: string | null;
  pagamentos?: PagamentoVenda[];
  itens: OrcamentoItemPayload[];
}

export interface CaixaResumoPagamento {
  forma_pagamento: string;
  valor_total: number;
  valor_recebido: number;
}

export interface FecharCaixaItemPayload {
  forma_pagamento: string;
  valor_informado: number;
}

export interface CaixaFechado {
  id: number;
  data_referencia: string;
  fechado_em: string | null;
  valor_total: number;
  valor_informado?: number;
  valor_quebra?: number;
  observacoes?: string | null;
  itens: CaixaResumoPagamento[];
}

export interface CaixaResumoDia {
  data_referencia: string;
  resumo: CaixaResumoPagamento[];
  fechamentos: CaixaFechado[];
}

export interface FecharCaixaPayload {
  data_referencia?: string | null;
  valor_informado: number;
  observacoes?: string | null;
  itens?: FecharCaixaItemPayload[];
}

@Injectable({
  providedIn: 'root'
})
export class ComercialService {
  private httpClient = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  public buscarOrcamentoPorOrigem(origemTipo: string, origemId: number): Observable<Orcamento> {
    return this.httpClient.get<Orcamento>(`${this.url}/orcamentos/buscar-por-origem?origemTipo=${origemTipo}&origemId=${origemId}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarOrcamentoPorId(id: number): Observable<Orcamento> {
    return this.httpClient.get<Orcamento>(`${this.url}/orcamentos/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listarOrcamentos(page: number, limit: number, pesquisa = ''): Observable<ListaPaginada<Orcamento>> {
    return this.httpClient.get<ListaPaginada<Orcamento>>(`${this.url}/orcamentos/listar?page=${page}&limit=${limit}&pesquisa=${encodeURIComponent(pesquisa)}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public criarOrcamentoPdv(payload: CriarOrcamentoPdvPayload = {}): Observable<Orcamento> {
    return this.httpClient.post<Orcamento>(`${this.url}/orcamentos/criar-pdv`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public criarOrcamento(payload: CriarOrcamentoPayload = {}): Observable<Orcamento> {
    return this.httpClient.post<Orcamento>(`${this.url}/orcamentos/criar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarItens(payload: AtualizarOrcamentoPayload): Observable<Orcamento> {
    return this.httpClient.put<Orcamento>(`${this.url}/orcamentos/atualizar-itens`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public aprovarOrcamento(payload: AprovarOrcamentoPayload): Observable<Venda> {
    return this.httpClient.post<Venda>(`${this.url}/vendas/aprovar-orcamento`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public rejeitarOrcamento(payload: RejeitarOrcamentoPayload): Observable<Orcamento> {
    return this.httpClient.put<Orcamento>(`${this.url}/orcamentos/rejeitar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public reabrirOrcamento(payload: ReabrirOrcamentoPayload): Observable<Orcamento> {
    return this.httpClient.put<Orcamento>(`${this.url}/orcamentos/reabrir`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarVendaPorId(id: number): Observable<Venda> {
    return this.httpClient.get<Venda>(`${this.url}/vendas/buscar-por-id/${id}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public atualizarVenda(payload: AtualizarVendaPayload): Observable<Venda> {
    return this.httpClient.put<Venda>(`${this.url}/vendas/atualizar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public listarVendas(page: number, limit: number, pesquisa = ''): Observable<ListaPaginada<Venda>> {
    return this.httpClient.get<ListaPaginada<Venda>>(`${this.url}/vendas/listar?page=${page}&limit=${limit}&pesquisa=${encodeURIComponent(pesquisa)}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarClientePorDocumento(documento: string): Observable<Cliente | null> {
    return this.httpClient.get<Cliente | null>(`${this.url}/clientes/buscar-por-documento?documento=${encodeURIComponent(documento)}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarCliente(termo: string): Observable<Cliente[]> {
    return this.httpClient.get<Cliente[]>(`${this.url}/clientes/buscar?termo=${encodeURIComponent(termo)}`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public buscarResumoCaixaDia(): Observable<CaixaResumoDia> {
    return this.httpClient.get<CaixaResumoDia>(`${this.url}/caixa/resumo-dia`, this.httpOptions).pipe(catchError(this.handleError));
  }

  public fecharCaixa(payload: FecharCaixaPayload): Observable<CaixaFechado> {
    return this.httpClient.post<CaixaFechado>(`${this.url}/caixa/fechar`, payload, this.httpOptions).pipe(catchError(this.handleError));
  }

  public formatarData(date: string | Date | null | undefined): string | null {
    if (!date) {
      return null;
    }

    const current = new Date(date);
    if (Number.isNaN(current.getTime())) {
      return null;
    }

    const dia = `${current.getDate()}`.padStart(2, '0');
    const mes = `${current.getMonth() + 1}`.padStart(2, '0');
    const ano = current.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }
}
