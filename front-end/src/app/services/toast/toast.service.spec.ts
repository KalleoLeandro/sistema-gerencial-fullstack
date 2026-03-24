import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';


describe('ToastService', () => {

  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  it('deve definir mensagem ao chamar show()', () => {

    service.show('teste');

    expect(service.message()).toBe('teste');

  });

  it('deve limpar a mensagem após 3 segundos', fakeAsync(() => {

    service.show('teste');

    expect(service.message()).toBe('teste');

    tick(3000);

    expect(service.message()).toBeNull();

  }));

});