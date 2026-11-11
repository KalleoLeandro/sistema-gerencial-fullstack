import { of, throwError } from 'rxjs';
import { ListarComponent as Orcamentos } from './listar.component';
import { ComercialService } from '@services/comercial.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../../testing/page.testing';

{
  const config = {
    type: Orcamentos,
    token: ComercialService,
    method: 'listarOrcamentos',
    state: 'orcamentos',
  };
  describe(`List ${config.state}`, () => {
    it('restores query state, loads data and bounds navigation', () => {
      const setup = pageSetup({ page: '2', limit: '25', pesquisa: 'Ana' });
      const service = setup.mock(config.token);
      service[config.method].and.returnValue(
        of({ lista: [{ id: 42 }], total: 100 }),
      );
      const component: any = setup.create(config.type as any);
      expect(component.paginasVisiveis).toEqual([]);
      component.ngOnInit();
      expect(component.page).toBe(2);
      expect(component.limit).toBe(25);
      expect(component[config.state]().total).toBe(100);
      expect(component.paginasVisiveis).toEqual([1, 2, 3]);
      component.irParaPagina(4);
      expect(component.paginasVisiveis).toEqual([2, 3, 4]);
      component.irParaPagina(0);
      component.irParaPagina(5);
      expect(component.page).toBe(4);
      component.mudarTamanho();
      expect(component.page).toBe(1);
      if (component.pesquisar) {
        component.pesquisa = '';
        component.pesquisar();
        expect(component.page).toBe(1);
      }
      expect(setup.router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({ replaceUrl: true }),
      );
    });
    it('uses defaults for invalid query parameters and reports failure', () => {
      const setup = pageSetup({ page: 'invalid', limit: '3' });
      setup
        .mock(config.token)
        [config.method].and.returnValue(throwError(() => new Error('offline')));
      const component: any = setup.create(config.type as any);
      component.ngOnInit();
      expect(component.page).toBe(1);
      expect(component.limit).toBe(10);
      expect(setup.mock(ToastService).error).toHaveBeenCalled();
    });
    it('opens budget details and a new budget', () => {
      const setup = pageSetup();
      const c: any = setup.create(Orcamentos);
      c.abrirDetalhes(42);
      c.novoOrcamento();
      c.editarOrcamento(42);
      c.abrirVendas();
      expect(setup.router.navigate).toHaveBeenCalledTimes(4);
    });
  });
}
