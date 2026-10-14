import { of, throwError } from 'rxjs';
import { EmFaltaComponent } from './em-falta.component';
import { ProdutoService } from '@services/produto.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../testing/page.testing';

describe('Products below minimum stock', () => {
  it('loads stock alerts, shows totals and opens product editing', () => {
    const setup = pageSetup();
    const service = setup.mock(ProdutoService);
    service.listarEmFalta.and.returnValue(of([{ id: 42 }]));
    const c = setup.create(EmFaltaComponent);
    c.ngOnInit();
    expect(c.totalProdutos).toBe(1);
    c.editar(42);
    c.voltarParaDashboard();
    expect(setup.router.navigate).toHaveBeenCalledTimes(2);
    service.listarEmFalta.and.returnValue(of(null));
    c.carregar();
    expect(c.totalProdutos).toBe(0);
    service.listarEmFalta.and.returnValue(
      throwError(() => new Error('offline')),
    );
    c.carregar();
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
  });
});
