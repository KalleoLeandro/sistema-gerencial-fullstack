import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { AeroFieldComponent, AeroNativeControlComponent, AeroNativeButtonComponent } from './aero-native.component';
import { AeroDateDirective } from './aero-date.directive';

const meta: Meta<AeroFieldComponent> = {
  title: 'Formulários/Campos nativos e máscaras',
  component: AeroFieldComponent,
  decorators: [moduleMetadata({
    imports: [ReactiveFormsModule, AeroNativeControlComponent, AeroNativeButtonComponent, AeroDateDirective, NgxMaskDirective, CurrencyMaskModule],
    providers: [provideNgxMask()],
  })],
};
export default meta;
type Story = StoryObj<AeroFieldComponent>;

export const Cadastro: Story = {
  render: () => ({
    props: {
      cpf: new FormControl('', Validators.required),
      valor: new FormControl(1234.56),
      data: new FormControl<Date | null>(new Date()),
    },
    template: `<div style="display:grid;gap:1rem;max-width:32rem">
      <app-aero-field><span aeroLabel>CPF</span><input aeroControl mask="000.000.000-00" [formControl]="cpf"><span aeroError>Informe o CPF completo.</span></app-aero-field>
      <app-aero-field><span aeroLabel>Valor</span><input aeroControl currencyMask [formControl]="valor" [options]="{prefix: 'R$', thousands: '.', decimal: ','}"></app-aero-field>
      <app-aero-field><span aeroLabel>Data</span><input aeroControl aeroDate="date" [formControl]="data"></app-aero-field>
      <button aeroButton="primary" type="button" (click)="cpf.markAsTouched()">Validar CPF</button>
    </div>`,
  }),
};
