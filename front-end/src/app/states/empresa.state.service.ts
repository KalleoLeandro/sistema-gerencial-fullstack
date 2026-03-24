import { Injectable } from '@angular/core';
import { EmpresaState } from '@models/empresaState';

@Injectable({
  providedIn: 'root'
})
export class EmpresaStateService {

  page = 1;
  limit = 10;
  pesquisa = '';

  constructor() { }


  setState(partial: Partial<EmpresaState>) {
    Object.assign(this, partial);
  }

  getState(): EmpresaState {
    return {
      page: this.page,
      limit: this.limit,
      pesquisa: this.pesquisa
    };
  }
}
