import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  BaixaRequest,
  ContaFinanceira,
  ContaRequest,
  DetalhesConta,
  FiltroFinanceiro,
  OrigemConta,
  PaginaFinanceira,
  RelatorioFinanceiro,
} from '@models/financeiro';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.BFF + '/financeiro';
  private params(filtro: FiltroFinanceiro, page?: number, limit?: number) {
    let params = new HttpParams();
    Object.entries({ ...filtro, page, limit }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '')
        params = params.set(key, String(value));
    });
    return params;
  }
  listar(filtro: FiltroFinanceiro, page: number, limit: number) {
    return this.http.get<PaginaFinanceira>(this.url + '/contas', {
      params: this.params(filtro, page, limit),
      withCredentials: true,
    });
  }
  detalhes(origem: OrigemConta, id: number) {
    return this.http.get<DetalhesConta>(`${this.url}/contas/${origem}/${id}`, {
      withCredentials: true,
    });
  }
  criar(conta: ContaRequest) {
    return this.http.post<ContaFinanceira>(this.url + '/contas', conta, {
      withCredentials: true,
    });
  }
  atualizar(id: number, conta: ContaRequest) {
    return this.http.put<ContaFinanceira>(`${this.url}/contas/${id}`, conta, {
      withCredentials: true,
    });
  }
  cancelar(id: number) {
    return this.http.post<void>(
      `${this.url}/contas/${id}/cancelar`,
      {},
      { withCredentials: true },
    );
  }
  baixar(origem: OrigemConta, id: number, baixa: BaixaRequest) {
    return this.http.post<DetalhesConta>(
      `${this.url}/contas/${origem}/${id}/baixas`,
      baixa,
      { withCredentials: true },
    );
  }
  relatorio(filtro: FiltroFinanceiro) {
    return this.http.get<RelatorioFinanceiro>(this.url + '/relatorios', {
      params: this.params(filtro),
      withCredentials: true,
    });
  }
}
