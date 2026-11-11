import { of, Subject, throwError } from 'rxjs';
import { CadastrarComponent as ServicoForm } from './cadastrar.component';
import { ServicoComercialService } from '@services/servico-comercial.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../testing/page.testing';

{
  const [type, token] = [ServicoForm, ServicoComercialService];
  {
    describe(`${token.name} form`, () => {
      for (const id of [null, 42])
        for (const outcome of ['success', 'error', 'pending']) {
          it(`saves ${id ? 'existing' : 'new'} record: ${outcome}`, () => {
            const setup = pageSetup({}, id ? { id: String(id) } : {});
            const service = setup.mock(token);
            service.buscarPorId.and.returnValue(of({ id: 42, nome: 'Item' }));
            service.cadastrar.and.returnValue(
              outcome === 'success'
                ? of(42)
                : outcome === 'error'
                  ? throwError(() => new Error('offline'))
                  : new Subject(),
            );
            service.atualizar.and.returnValue(
              outcome === 'success'
                ? of(42)
                : outcome === 'error'
                  ? throwError(() => new Error('offline'))
                  : new Subject(),
            );
            const component: any = setup.create(type as any);
            component.ngOnInit();
            component.form.nome = 'Item';
            component.salvar();
            expect(
              service[id ? 'atualizar' : 'cadastrar'],
            ).toHaveBeenCalledWith(
              jasmine.objectContaining({ nome: 'Item', id: id ?? undefined }),
            );
            if (outcome === 'success')
              expect(setup.mock(ToastService).success).toHaveBeenCalled();
            if (outcome === 'error') {
              expect(component.salvando).toBeFalse();
              expect(setup.mock(ToastService).error).toHaveBeenCalled();
            }
            if (outcome === 'pending') {
              component.salvar();
              expect(
                service[id ? 'atualizar' : 'cadastrar'],
              ).toHaveBeenCalledTimes(1);
            }
            component.voltar();
            expect(setup.router.navigate).toHaveBeenCalled();
          });
        }
      it('requires a name and reports lookup errors', () => {
        const setup = pageSetup();
        const service = setup.mock(token);
        const component: any = setup.create(type as any);
        component.ngOnInit();
        component.salvar();
        expect(setup.mock(ToastService).warning).toHaveBeenCalled();
        expect(service.cadastrar).not.toHaveBeenCalled();
        component['carregar']();
        expect(service.buscarPorId).not.toHaveBeenCalled();
        component.id = 42;
        service.buscarPorId.and.returnValue(
          throwError(() => new Error('offline')),
        );
        component['carregar']();
        expect(setup.mock(ToastService).error).toHaveBeenCalled();
      });
    });
  }
}
