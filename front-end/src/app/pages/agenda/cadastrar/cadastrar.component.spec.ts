import { of, Subject, throwError } from 'rxjs';
import { CadastrarComponent } from './cadastrar.component';
import { AgendamentoService } from '@services/agendamento.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../testing/page.testing';

describe('Appointment registration', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 13, 12));
  });
  afterEach(() => jasmine.clock().uninstall());
  for (const existing of [false, true])
    for (const error of [false, true])
      it(`saves appointment existing=${existing}, error=${error}`, () => {
        const setup = pageSetup({}, existing ? { id: '42' } : {});
        const api = setup.mock(AgendamentoService);
        api.buscarPorId.and.returnValue(
          of({
            titulo: 'Visita',
            tipo_tarefa: 'Entrega',
            data_agendamento: '2026-10-13T12:00:00',
            detalhes: 'Cliente',
          }),
        );
        api.montarPayload.and.returnValue({ titulo: 'Visita' });
        if (error)
          api[existing ? 'atualizar' : 'cadastrar'].and.returnValue(
            throwError(() => new Error('offline')),
          );
        const c = setup.create(CadastrarComponent);
        c.ngOnInit();
        expect(c.tituloPagina).toContain(existing ? 'Atualizar' : 'Cadastrar');
        expect(c.subtituloPagina.length).toBeGreaterThan(0);
        c.cadastroForm.setValue({
          titulo: 'Visita',
          tipoTarefa: 'Entrega',
          data: new Date(2026, 9, 13),
          detalhes: 'Cliente',
        });
        c.salvar();
        expect(api[existing ? 'atualizar' : 'cadastrar']).toHaveBeenCalled();
        if (error) {
          expect(c.salvando).toBeFalse();
          expect(setup.mock(ToastService).error).toHaveBeenCalled();
        } else expect(setup.router.navigate).toHaveBeenCalled();
        c.limpar();
      });
  it('validates appointment forms, prevents duplicate saves and handles loading failures', () => {
    const setup = pageSetup();
    const api = setup.mock(AgendamentoService);
    const c = setup.create(CadastrarComponent);
    c.ngOnInit();
    c.salvar();
    expect(c.cadastroForm.touched).toBeTrue();
    expect(api.cadastrar).not.toHaveBeenCalled();
    c.cadastroForm.setValue({
      titulo: 'Visita',
      tipoTarefa: 'Entrega',
      data: new Date(2026, 9, 13),
      detalhes: 'Cliente',
    });
    api.cadastrar.and.returnValue(new Subject());
    c.salvar();
    c.salvar();
    expect(api.cadastrar).toHaveBeenCalledTimes(1);
    c.agendamentoId = 42;
    api.buscarPorId.and.returnValue(throwError(() => new Error('offline')));
    c.limpar();
    expect(setup.router.navigate).toHaveBeenCalledWith(['/agenda']);
    api.buscarPorId.and.returnValue(
      of({ titulo: 'Visita', data_agendamento: null }),
    );
    c.limpar();
    expect(c.cadastroForm.get('data')!.value).toBeNull();
  });
});
