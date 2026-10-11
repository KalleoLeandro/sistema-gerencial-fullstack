import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AERO_COMPONENTS, AeroButtonComponent, AeroDialogComponent, AeroPaginationComponent } from './index';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ...AERO_COMPONENTS],
  template: `<form [formGroup]="form">
    <app-aero-input controlId="name" label="Nome" formControlName="name" error="Informe o nome." />
    <app-aero-input controlId="quantity" label="Quantidade" type="number" formControlName="quantity" />
    <app-aero-select controlId="category" label="Categoria" formControlName="category" [options]="options" />
    <app-aero-checkbox controlId="notify" label="Notificar" formControlName="notify" />
    <app-aero-radio-group controlId="service" label="Serviço" formControlName="service" [options]="options" />
    <app-aero-textarea controlId="notes" label="Observações" formControlName="notes" />
  </form>
  <app-aero-input controlId="model" label="Modelo" [(ngModel)]="model" />`,
})
class FormHost {
  options = [{ label: 'Numérico', value: 2 }, { label: 'Texto', value: '2' }];
  model = 'Inicial';
  form = new FormGroup({
    name: new FormControl('', Validators.required), quantity: new FormControl<number | null>(1),
    category: new FormControl<string | number | null>(2), notify: new FormControl(false),
    service: new FormControl<string | number | null>(2), notes: new FormControl(''),
  });
}

describe('Aero: integração com formulários', () => {
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
    expect(element.querySelector('#name-message')?.textContent).toContain('Informe o nome.');
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

  it('preserva números no campo e os tipos das opções selecionadas', () => {
    const { fixture, host, element } = setup();
    const number = element.querySelector<HTMLInputElement>('#quantity')!;
    number.value = '12';
    number.dispatchEvent(new Event('input'));
    expect(host.form.controls.quantity.value).toBe(12);
    number.value = '';
    number.dispatchEvent(new Event('input'));
    expect(host.form.controls.quantity.value).toBeNull();
    const select = element.querySelector<HTMLSelectElement>('#category')!;
    expect(select.value).toBe('0');
    select.value = '1';
    select.dispatchEvent(new Event('change'));
    expect(host.form.controls.category.value).toBe('2');
    host.form.controls.category.setValue(2);
    fixture.detectChanges();
    expect(select.value).toBe('0');
  });

  it('conecta checkbox, rádio e textarea e propaga disabled', () => {
    const { fixture, host, element } = setup();
    const checkbox = element.querySelector<HTMLInputElement>('#notify')!;
    checkbox.click();
    expect(host.form.controls.notify.value).toBeTrue();
    const radios = element.querySelectorAll<HTMLInputElement>('input[type=radio]');
    radios[1].click();
    expect(host.form.controls.service.value).toBe('2');
    const notes = element.querySelector<HTMLTextAreaElement>('#notes')!;
    notes.value = 'Detalhes';
    notes.dispatchEvent(new Event('input'));
    expect(host.form.controls.notes.value).toBe('Detalhes');
    host.form.disable();
    fixture.detectChanges();
    expect(checkbox.disabled).toBeTrue();
    expect(radios[0].disabled).toBeTrue();
    expect(notes.disabled).toBeTrue();
    expect(element.querySelector<HTMLSelectElement>('#category')!.disabled).toBeTrue();
    expect(element.querySelector<HTMLInputElement>('#name')!.disabled).toBeTrue();
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

describe('Aero: comportamento dos componentes', () => {
  it('bloqueia a ação do botão durante carregamento', () => {
    const fixture = TestBed.createComponent(AeroButtonComponent);
    const pressed = spyOn(fixture.componentInstance.pressed, 'emit');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(button.disabled).toBeTrue();
    expect(pressed).not.toHaveBeenCalled();
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    button.click();
    expect(pressed).toHaveBeenCalledTimes(1);
  });

  it('abre diálogo modal e distingue confirmação e cancelamento', async () => {
    const fixture = TestBed.createComponent(AeroDialogComponent);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const confirmed = spyOn(fixture.componentInstance.confirmed, 'emit');
    const cancelled = spyOn(fixture.componentInstance.cancelled, 'emit');
    fixture.componentInstance.open();
    expect(dialog.open).toBeTrue();
    (dialog.querySelectorAll('button')[0] as HTMLButtonElement).click();
    expect(dialog.open).toBeFalse();
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(confirmed).not.toHaveBeenCalled();
    fixture.componentInstance.open();
    (dialog.querySelectorAll('button')[1] as HTMLButtonElement).click();
    expect(dialog.returnValue).toBe('confirm');
    expect(confirmed).toHaveBeenCalledTimes(1);
    await fixture.whenStable();
  });

  it('limita paginação e emite a página solicitada', () => {
    const fixture = TestBed.createComponent(AeroPaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.detectChanges();
    const changed = spyOn(fixture.componentInstance.pageChange, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBeTrue();
    buttons[1].click();
    expect(changed).toHaveBeenCalledWith(2);
    fixture.componentRef.setInput('page', 999);
    fixture.detectChanges();
    expect(buttons[1].disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Página 3 de 3');
  });
});
