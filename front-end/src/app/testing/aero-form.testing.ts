import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AERO_COMPONENTS } from '../components/aero/index';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ...AERO_COMPONENTS],
  template: `<form [formGroup]="form">
      <app-aero-input
        controlId="name"
        label="Nome"
        formControlName="name"
        error="Informe o nome."
      />
      <app-aero-input
        controlId="quantity"
        label="Quantidade"
        type="number"
        formControlName="quantity"
      />
      <app-aero-select
        controlId="category"
        label="Categoria"
        formControlName="category"
        [options]="options"
      />
      <app-aero-checkbox
        controlId="notify"
        label="Notificar"
        formControlName="notify"
      />
      <app-aero-radio-group
        controlId="service"
        label="Serviço"
        formControlName="service"
        [options]="options"
      />
      <app-aero-textarea
        controlId="notes"
        label="Observações"
        formControlName="notes"
      />
    </form>
    <app-aero-input controlId="model" label="Modelo" [(ngModel)]="model" />`,
})
export class FormHost {
  options = [
    { label: 'Numérico', value: 2 },
    { label: 'Texto', value: '2' },
  ];
  model = 'Inicial';
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    quantity: new FormControl<number | null>(1),
    category: new FormControl<string | number | null>(2),
    notify: new FormControl(false),
    service: new FormControl<string | number | null>(2),
    notes: new FormControl(''),
  });
}
