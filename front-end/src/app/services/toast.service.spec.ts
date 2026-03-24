import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('adiciona e remove um toast apos a duracao configurada', fakeAsync(() => {
    let currentToasts: any[] = [];
    service.toasts$.subscribe((toasts) => currentToasts = toasts);

    service.show('Salvo com sucesso', 'success', 1000);
    expect(currentToasts.length).toBe(1);
    expect(currentToasts[0]).toEqual(jasmine.objectContaining({
      id: 1,
      message: 'Salvo com sucesso',
      type: 'success',
      duration: 1000
    }));

    tick(1000);
    expect(currentToasts).toEqual([]);
  }));

  it('usa os atalhos de severidade', () => {
    spyOn(service, 'show');

    service.success('ok', 1);
    service.error('erro', 2);
    service.info('info', 3);
    service.warning('warn', 4);

    expect(service.show).toHaveBeenCalledWith('ok', 'success', 1);
    expect(service.show).toHaveBeenCalledWith('erro', 'error', 2);
    expect(service.show).toHaveBeenCalledWith('info', 'info', 3);
    expect(service.show).toHaveBeenCalledWith('warn', 'warning', 4);
  });

  it('remove manualmente um toast especifico', () => {
    let currentToasts: any[] = [];
    service.toasts$.subscribe((toasts) => currentToasts = toasts);

    service.show('primeiro', 'info', 5000);
    service.show('segundo', 'info', 5000);

    service.dismiss(1);

    expect(currentToasts.length).toBe(1);
    expect(currentToasts[0].id).toBe(2);
  });
});
