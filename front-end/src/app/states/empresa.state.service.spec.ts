import { TestBed } from '@angular/core/testing';

import { EmpresaStateService } from './empresa.state.service';

describe('EmpresaStateService', () => {
  let service: EmpresaStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpresaStateService);
  });

  it('retorna o estado padrao', () => {
    expect(service.getState()).toEqual({
      page: 1,
      limit: 10,
      pesquisa: ''
    });
  });

  it('mescla atualizacoes parciais no estado atual', () => {
    service.setState({ page: 3, pesquisa: 'acme' });

    expect(service.getState()).toEqual({
      page: 3,
      limit: 10,
      pesquisa: 'acme'
    });
  });
});
