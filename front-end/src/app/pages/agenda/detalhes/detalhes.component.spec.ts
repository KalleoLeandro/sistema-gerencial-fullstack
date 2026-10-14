import { of, throwError } from 'rxjs';
import { DetalhesComponent } from './detalhes.component';
import { AgendamentoService } from '@services/agendamento.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../testing/page.testing';

describe('Appointment details', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 13, 12));
  });
  afterEach(() => jasmine.clock().uninstall());
  it('handles details with missing ID, pending/completed dates and deletion errors', () => {
    const setup = pageSetup();
    const api = setup.mock(AgendamentoService);
    const c = setup.create(DetalhesComponent);
    c.ngOnInit();
    expect(setup.router.navigate).toHaveBeenCalledWith(['/agenda']);
    c.excluir();
    expect(api.excluir).not.toHaveBeenCalled();
    setup.route.snapshot.paramMap = { get: () => '42' } as any;
    api.buscarPorId.and.returnValue(
      of({ id: 42, data_agendamento: '2026-10-12T12:00:00', concluido: false }),
    );
    c.ngOnInit();
    expect(c.atrasado).toBeTrue();
    expect(c.status).toBe('Pendente');
    expect(c.formatarData()).toBe('-');
    expect(c.formatarData('2026-10-13T12:00:00')).toContain('13/10/2026');
    c.agendamento!.concluido = true;
    expect(c.atrasado).toBeFalse();
    expect(c.status).toBe('Concluído');
    c.excluir();
    expect(api.excluir).toHaveBeenCalledWith(42);
    api.excluir.and.returnValue(throwError(() => new Error('offline')));
    c.excluir();
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
    api.buscarPorId.and.returnValue(throwError(() => new Error('offline')));
    c.ngOnInit();
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
  });
});
