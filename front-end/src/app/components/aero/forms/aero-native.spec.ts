import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { AeroDateDirective } from './aero-date.directive';
import { AeroFieldComponent, AeroNativeButtonComponent, AeroNativeControlComponent } from './aero-native.component';

@Component({
  imports: [ReactiveFormsModule, AeroFieldComponent, AeroNativeControlComponent, AeroNativeButtonComponent, AeroDateDirective, NgxMaskDirective, CurrencyMaskModule],
  providers: [provideNgxMask()],
  template: `<form [formGroup]="form">
    <app-aero-field><span aeroLabel>Nome</span><input aeroControl id="name" formControlName="name"><span aeroError>Obrigatório</span></app-aero-field>
    <input aeroControl id="cpf" mask="000.000.000-00" formControlName="cpf">
    <input aeroControl id="money" currencyMask formControlName="money" [options]="{prefix: 'R$', thousands: '.', decimal: ','}">
    <select aeroControl id="select" formControlName="select"><option [ngValue]="2">Número</option><option [ngValue]="'2'">Texto</option></select>
    <input aeroControl id="date" aeroDate="date" formControlName="date" [min]="min">
    <input aeroControl id="time" aeroDate="time" formControlName="time">
    <button aeroButton="primary" type="button" data-bs-target="#modal" [disabled]="disabled" (click)="clicks = clicks + 1">Salvar</button>
  </form>`,
})
class Host {
  min = new Date(2026, 9, 10);
  disabled = false;
  clicks = 0;
  form = new FormGroup({
    name: new FormControl('', Validators.required), cpf: new FormControl(''), money: new FormControl(1234.56),
    select: new FormControl<string | number>(2), date: new FormControl<Date | string | null>(new Date(2026, 9, 11)),
    time: new FormControl<Date | null>(new Date(2026, 9, 11, 14, 30)),
  });
}

describe('Aero: controles nativos dos cadastros', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, input: (id: string) => fixture.nativeElement.querySelector('#' + id) as HTMLInputElement };
  };
  it('associa label e erro e respeita touched, reset e disabled', () => {
    const { fixture, host, input } = setup();
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe('name');
    input('name').dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input('name').getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('[aeroError]').parentElement.hidden).toBeFalse();
    expect(document.getElementById(input('name').getAttribute('aria-describedby')!)?.textContent).toContain('Obrigatório');
    host.form.disable(); fixture.detectChanges();
    expect(input('name').disabled).toBeTrue();
    host.form.reset(); fixture.detectChanges();
    expect(input('name').value).toBe('');
  });
  it('preserva máscara e valor monetário numérico', fakeAsync(() => {
    const { host, input } = setup();
    input('cpf').value = '12345678901'; input('cpf').dispatchEvent(new Event('input'));
    expect(host.form.controls.cpf.value).toBe('12345678901');
    expect(input('cpf').value).toBe('123.456.789-01');
    expect(input('money').value).toContain('1.234,56');
    input('money').value = 'R$2.500,00'; input('money').dispatchEvent(new Event('paste'));
    tick(2);
    expect(host.form.controls.money.value).toBe(2500);
  }));
  it('preserva tipos das opções nativas', () => {
    const { host, input } = setup();
    const select = input('select') as unknown as HTMLSelectElement;
    expect(select.selectedIndex).toBe(0);
    select.selectedIndex = 1; select.dispatchEvent(new Event('change'));
    expect(host.form.controls.select.value).toBe('2');
  });
  it('converte datas e horários locais, valida limites e limpa o valor', () => {
    const { fixture, host, input } = setup();
    expect(input('date').value).toBe('2026-10-11');
    expect(input('time').value).toBe('14:30');
    host.form.controls.date.setValue('11/10/2026 00:00');
    fixture.detectChanges();
    expect(input('date').value).toBe('2026-10-11');
    expect(host.form.controls.date.valid).toBeTrue();
    input('date').value = '2026-10-09'; input('date').dispatchEvent(new Event('input'));
    expect(host.form.controls.date.value).toEqual(new Date(2026, 9, 9));
    expect(host.form.controls.date.hasError('aeroMin')).toBeTrue();
    host.min = new Date(2026, 9, 8); fixture.detectChanges();
    expect(host.form.controls.date.valid).toBeTrue();
    input('time').value = '16:45'; input('time').dispatchEvent(new Event('input'));
    expect(host.form.controls.time.value).toEqual(new Date(2026, 9, 11, 16, 45));
    input('date').value = ''; input('date').dispatchEvent(new Event('input'));
    expect(host.form.controls.date.value).toBeNull();
  });
  it('mantém eventos e atributos no botão nativo', () => {
    const { fixture, host } = setup();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.dataset['bsTarget']).toBe('#modal');
    button.click(); expect(host.clicks).toBe(1);
    host.disabled = true; fixture.detectChanges(); button.click();
    expect(host.clicks).toBe(1);
  });
});
