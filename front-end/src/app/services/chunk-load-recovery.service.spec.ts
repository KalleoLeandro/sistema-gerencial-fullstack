import { TestBed } from '@angular/core/testing';
import { NavigationError } from '@angular/router';
import { ChunkLoadRecoveryService, RELOAD_NAVIGATION } from './chunk-load-recovery.service';

describe('ChunkLoadRecoveryService', () => {
  let service: ChunkLoadRecoveryService;
  let reload: jasmine.Spy;
  const route = '/comercial/vendas/detalhes/900021';
  const key = `chunk-reload:${route}`;
  const failure = () => new NavigationError(1, route, new TypeError('Failed to fetch dynamically imported module: http://localhost:4200/chunk-old.js'));

  beforeEach(() => {
    sessionStorage.removeItem(key);
    reload = jasmine.createSpy('reload');
    TestBed.configureTestingModule({ providers: [{ provide: RELOAD_NAVIGATION, useValue: reload }] });
    service = TestBed.inject(ChunkLoadRecoveryService);
  });

  afterEach(() => sessionStorage.removeItem(key));

  it('recarrega a rota solicitada quando o modulo da versao anterior desaparece', () => {
    service.recover(failure());
    expect(reload).toHaveBeenCalledOnceWith(route);
  });

  it('nao entra em loop se a mesma rota continuar falhando', () => {
    service.recover(failure());
    service.recover(failure());
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('permite nova tentativa depois do intervalo', () => {
    sessionStorage.setItem(key, String(Date.now() - 61_000));
    service.recover(failure());
    expect(reload).toHaveBeenCalledOnceWith(route);
  });

  it('nao recarrega por erros que nao sejam de carregamento de modulo', () => {
    service.recover(new NavigationError(1, route, new Error('Erro de permissao')));
    expect(reload).not.toHaveBeenCalled();
  });

  it('nao redireciona para outro site', () => {
    service.recover(new NavigationError(1, 'https://example.test/', failure().error));
    expect(reload).not.toHaveBeenCalled();
  });
});
