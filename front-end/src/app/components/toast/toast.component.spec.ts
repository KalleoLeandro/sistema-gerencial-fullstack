import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ToastComponent } from './toast.component';
import { ToastService } from '@services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['dismiss'], {
      toasts$: of([])
    });

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cria o componente', () => {
    expect(component).toBeTruthy();
  });

  it('delega o dismiss para o servico', () => {
    component.dismiss(7);

    expect(toastService.dismiss).toHaveBeenCalledWith(7);
  });
});
