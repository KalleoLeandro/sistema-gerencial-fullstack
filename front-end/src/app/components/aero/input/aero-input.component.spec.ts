import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { AeroInputComponent } from './aero-input.component';
import { FormHost } from '../../../testing/aero-form.testing';

@Component({
  imports: [FormsModule, AeroInputComponent],
  template: `<app-aero-input
    label="Pesquisar"
    type="search"
    [mask]="mask"
    [(ngModel)]="search"
    (ngModelChange)="changes.push($event)"
  />`,
})
class SearchHost {
  mask = '000.000.000-00';
  search = '';
  changes: string[] = [];
}
describe('AeroInput: pesquisa com máscara', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideNgxMask()] }),
  );

  for (const [mask, raw, formatted] of [
    ['000.000.000-00', '52998224725', '529.982.247-25'],
    ['00.000.000/0000-00', '11222333000181', '11.222.333/0001-81'],
  ]) {
    it(`mantém a máscara ${mask} e envia o valor sem pontuação`, async () => {
      const fixture = TestBed.createComponent(SearchHost);
      fixture.componentInstance.mask = mask;
      fixture.detectChanges();
      await fixture.whenStable();
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      input.value = raw;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(input.value).toBe(formatted);
      expect(fixture.componentInstance.search).toBe(raw);
      expect(fixture.componentInstance.changes.at(-1)).toBe(raw);
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(fixture.componentInstance.search).toBe('');
    });
  }
});

describe('AeroInputComponent standalone', () => {
  it('supports standalone controls before form callbacks are registered', () => {
    const fixture = TestBed.createComponent(AeroInputComponent);
    const c: any = fixture.componentInstance;
    c.ngOnInit();
    c.updateValue('A');
    c.markTouched();
    expect(c.value).toBe('A');
    c.hint = 'Dica';
    expect(c.describedBy).toContain('-message');
    c.disabled = true;
    c.updateValue('B');
    expect(c.value).toBe('A');
    c.invalid = true;
    expect(c.showError).toBeTrue();
  });
});

describe('AeroInputComponent forms', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, element };
  };
  it('sincroniza valor, touched, erro e reset do FormControl', () => {
    const { fixture, host, element } = setup();
    const input = element.querySelector<HTMLInputElement>('#name')!;
    expect(input.getAttribute('aria-invalid')).toBe('false');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.form.controls.name.touched).toBeTrue();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#name-message')?.textContent).toContain(
      'Informe o nome.',
    );
    input.value = 'Cliente';
    input.dispatchEvent(new Event('input'));
    expect(host.form.controls.name.value).toBe('Cliente');
    host.form.controls.name.setValue('Atualizado');
    fixture.detectChanges();
    expect(input.value).toBe('Atualizado');
    host.form.reset();
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });
  it('suporta ngModel nos dois sentidos', async () => {
    const { fixture, host, element } = setup();
    await fixture.whenStable();
    fixture.detectChanges();
    const input = element.querySelector<HTMLInputElement>('#model')!;
    expect(input.value).toBe('Inicial');
    input.value = 'Digitado';
    input.dispatchEvent(new Event('input'));
    expect(host.model).toBe('Digitado');
    host.model = 'Externo';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.value).toBe('Externo');
  });
});

describe('AeroInputComponent numeric values', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, element };
  };
  it('preserves numeric values', () => {
    const { host, element } = setup();
    const number = element.querySelector<HTMLInputElement>('#quantity')!;
    number.value = '12';
    number.dispatchEvent(new Event('input'));
    expect(host.form.controls.quantity.value).toBe(12);
    number.value = '';
    number.dispatchEvent(new Event('input'));
    expect(host.form.controls.quantity.value).toBeNull();
  });
});
